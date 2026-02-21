// app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { Plan as PrismaPlan } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toPrismaPlan(raw: unknown): PrismaPlan {
  const v = String(raw ?? "").toUpperCase();
  if (v === "SOUTH_LOOP") return PrismaPlan.SOUTH_LOOP;
  if (v === "RIVER_NORTH") return PrismaPlan.RIVER_NORTH;
  if (v === "THE_LOOP") return PrismaPlan.THE_LOOP;
  return PrismaPlan.FREE;
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });

  const rawBody = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    // 1) Checkout completed (subscription OR lifetime payment)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const customerId = session.customer as string | null;
      const clerkUserId = session.metadata?.clerkUserId as string | undefined;
      const plan = toPrismaPlan(session.metadata?.plan);
      const cadence = String(session.metadata?.cadence ?? "monthly");
      const isLifetime = session.mode === "payment" || cadence === "lifetime";

      const stripeSubscriptionId = (session.subscription as string | null) ?? undefined;

      if (customerId && clerkUserId) {
        await db.subscription.upsert({
          where: { userId: clerkUserId },
          create: {
            userId: clerkUserId,
            stripeCustomerId: customerId,
            stripeSubscriptionId,
            plan,
            status: "active",
            isLifetime,
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId,
            plan,
            status: "active",
            isLifetime,
          },
        });
      }

      return NextResponse.json({ received: true });
    }

    // 2) Subscription updated/deleted (recurring only)
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as any;
      const customerId = sub.customer as string;

      const plan = toPrismaPlan(sub.metadata?.plan);
      const status = String(sub.status ?? "inactive");
      const currentPeriodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      // Find existing row by customerId (most reliable)
      const existing = await db.subscription.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (!existing) {
        // If we don't know the clerk userId yet, do nothing rather than creating garbage rows.
        return NextResponse.json({ received: true });
      }

      await db.subscription.update({
        where: { userId: existing.userId },
        data: {
          plan,
          status,
          currentPeriodEnd: currentPeriodEnd ?? undefined,
          isLifetime: false,
          stripeSubscriptionId: sub.id,
        },
      });

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Webhook handler failed" }, { status: 500 });
  }
}