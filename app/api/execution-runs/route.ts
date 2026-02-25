import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { buildChicagoIterationPlan } from "@/lib/iteration/chicago";
import { trackAppEvent } from "@/lib/events";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";

// Ensure this route is never cached by Next
export const dynamic = "force-dynamic";

function intOr0(v: unknown) {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

function noStoreJson(data: any, init?: { status?: number }) {
  const res = NextResponse.json(data, { status: init?.status ?? 200 });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return noStoreJson({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (!hasAccess(plan, "RIVER_NORTH")) {
    return noStoreJson(
      {
        error: "upgrade_required",
        message:
          "Execution Runs + Iteration Engine is unlocked on River North and above.",
        currentPlan: plan,
        requiredPlan: "RIVER_NORTH",
      },
      { status: 402 }
    );
  }

  const { searchParams } = new URL(req.url);
  const offerId = searchParams.get("offerId") || "";

  if (!offerId) {
    return noStoreJson({ error: "offerId is required" }, { status: 400 });
  }

  const offer = await db.offerBlueprint.findUnique({ where: { id: offerId } });
  if (!offer || offer.userId !== userId) {
    return noStoreJson({ error: "Not found" }, { status: 404 });
  }

  const runs = await db.executionRun.findMany({
    where: { userId, offerId },
    orderBy: { createdAt: "desc" },
  });

  return noStoreJson({ runs });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return noStoreJson({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (!hasAccess(plan, "RIVER_NORTH")) {
    return noStoreJson(
      {
        error: "upgrade_required",
        message:
          "Execution Runs + Iteration Engine is unlocked on River North and above.",
        currentPlan: plan,
        requiredPlan: "RIVER_NORTH",
      },
      { status: 402 }
    );
  }

  const body = await req.json();

  const offerId = str(body?.offerId);
  if (!offerId) {
    return noStoreJson({ error: "offerId is required" }, { status: 400 });
  }

  const offer = await db.offerBlueprint.findUnique({ where: { id: offerId } });
  if (!offer || offer.userId !== userId) {
    return noStoreJson({ error: "Not found" }, { status: 404 });
  }

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });

  const runInput = {
    channel: str(body?.channel),
    outreachCount: intOr0(body?.outreachCount),
    leadsCount: intOr0(body?.leadsCount),
    callsBooked: intOr0(body?.callsBooked),
    salesCount: intOr0(body?.salesCount),
    revenueCents: intOr0(body?.revenueCents),
    whatWorked: str(body?.whatWorked),
    whatDidnt: str(body?.whatDidnt),
    blockers: str(body?.blockers),
    notes: str(body?.notes),
  };

  const iterationPlan = buildChicagoIterationPlan({
    run: runInput,
    offer: {
      lane: offer.lane,
      title: offer.title,
      promise: offer.promise,
      pricing: offer.pricing,
      funnel: offer.funnel,
      scripts: offer.scripts,
    },
    snapshot: snapshot
      ? {
          artistName: snapshot.artistName,
          genre: snapshot.genre,
          vibeTags: snapshot.vibeTags,
          primaryGoal: snapshot.primaryGoal,
          biggestBlocker: snapshot.biggestBlocker,
          audienceSize: snapshot.audienceSize,
          priceRange: snapshot.priceRange,
        }
      : undefined,
  });

  const created = await db.executionRun.create({
    data: {
      userId,
      offerId,
      channel: runInput.channel,
      outreachCount: runInput.outreachCount,
      leadsCount: runInput.leadsCount,
      callsBooked: runInput.callsBooked,
      salesCount: runInput.salesCount,
      revenueCents: runInput.revenueCents,
      whatWorked: runInput.whatWorked || "",
      whatDidnt: runInput.whatDidnt || "",
      blockers: runInput.blockers || "",
      notes: runInput.notes || "",
      iterationPlanJson: iterationPlan as any,
    },
  });

  // Funnel completion: Execution run logged
  await trackAppEvent({
    userId,
    name: "execution_run_logged",
    route: "/dashboard/offers/[id]",
    step: "execution",
    offerId,
    snapshotId: snapshot?.id ?? null,
    meta: {
      runId: created.id,
      channel: runInput.channel,
      outreachCount: runInput.outreachCount,
      leadsCount: runInput.leadsCount,
      callsBooked: runInput.callsBooked,
      salesCount: runInput.salesCount,
      revenueCents: runInput.revenueCents,
    },
  });

  return noStoreJson({ run: created });
}