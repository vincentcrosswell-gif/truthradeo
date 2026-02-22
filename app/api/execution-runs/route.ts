import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { buildChicagoIterationPlan } from "@/lib/iteration/chicago";

function intOr0(v: unknown) {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const offerId = searchParams.get("offerId") || "";

  if (!offerId) {
    return NextResponse.json({ error: "offerId is required" }, { status: 400 });
  }

  const offer = await db.offerBlueprint.findUnique({ where: { id: offerId } });
  if (!offer || offer.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const runs = await db.executionRun.findMany({
    where: { userId, offerId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ runs });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const offerId = str(body?.offerId);
  if (!offerId) {
    return NextResponse.json({ error: "offerId is required" }, { status: 400 });
  }

  const offer = await db.offerBlueprint.findUnique({ where: { id: offerId } });
  if (!offer || offer.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  return NextResponse.json({ run: created });
}