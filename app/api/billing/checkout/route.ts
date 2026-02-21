// app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// ✅ FIX: match your actual filename: lib/billing/price.ts
import { priceIdFor } from "@/lib/billing/price";

import type { Plan as AppPlan, Cadence } from "@/lib/billing/plans";
import { Plan as PrismaPlan } from "@prisma/client";

export const runtime = "nodejs";

function toPrismaPlan(plan: AppPlan): PrismaPlan {
  switch (plan) {
    case "SOUTH_LOOP":
      return PrismaPlan.SOUTH_LOOP;
    case "RIVER_NORTH":
      return PrismaPlan.RIVER_NORTH;
    case "THE_LOOP":
      return PrismaPlan.THE_LOOP;
    default:
      return PrismaPlan.FREE;
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | { plan?: AppPlan; cadence?: Cadence }
    | null;

  const plan: AppPlan = body?.plan ?? "SOUTH_LOOP";
  const cadence: Cadence = body?.cadence ?? "monthly";

  if (plan === "FREE") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = priceIdFor(plan, cadence);

  const existing = await db.subscription.findUnique({ where: { userId } });

  let stripeCustomerId = existing?.stripeCustomerId ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: { clerkUserId: userId },
    });

    stripeCustomerId = customer.id;

    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId,
        plan: PrismaPlan.FREE,
        status: "inactive",
      },
      update: { stripeCustomerId },
    });
  }

  const isLifetime = cadence === "lifetime";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://truthradeo.com";

  const session = await stripe.checkout.sessions.create({
    mode: isLifetime ? "payment" : "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
    metadata: { clerkUserId: userId, plan, cadence },
    subscription_data: isLifetime
      ? undefined
      : { metadata: { clerkUserId: userId, plan, cadence } },
  });

  return NextResponse.json({ url: session.url });
}