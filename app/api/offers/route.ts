import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { buildOfferBlueprint } from "@/lib/offers";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";

type Lane = "service" | "digital" | "membership" | "live" | "hybrid";

function isLane(v: unknown): v is Lane {
  return (
    v === "service" ||
    v === "digital" ||
    v === "membership" ||
    v === "live" ||
    v === "hybrid"
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);

  // Offer Architect is paid.
  if (!hasAccess(plan, "SOUTH_LOOP")) {
    return NextResponse.json(
      {
        error: "upgrade_required",
        message:
          "Offer Architect is a paid unlock. Upgrade to South Loop to generate your first blueprint.",
        currentPlan: plan,
        requiredPlan: "SOUTH_LOOP",
      },
      { status: 402 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const lane = body?.lane;

  if (!isLane(lane)) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: "Invalid lane. Must be one of: service, digital, membership, live, hybrid.",
      },
      { status: 400 }
    );
  }

  // South Loop limit: 1 blueprint.
  if (plan === "SOUTH_LOOP") {
    const count = await db.offerBlueprint.count({ where: { userId } });
    if (count >= 1) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message:
            "South Loop includes 1 Offer Blueprint. Upgrade to River North to create unlimited blueprints + unlock Execution Assets + Iteration.",
          currentPlan: plan,
          requiredPlan: "RIVER_NORTH",
          limit: 1,
        },
        { status: 402 }
      );
    }
  }

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });
  if (!snapshot) return NextResponse.json({ error: "No snapshot found" }, { status: 400 });

  const blueprint = buildOfferBlueprint({
    lane,
    artistName: snapshot.artistName,
    genre: snapshot.genre,
    vibeTags: snapshot.vibeTags,
    primaryGoal: snapshot.primaryGoal,
    audienceSize: snapshot.audienceSize,
    biggestBlocker: snapshot.biggestBlocker,
  } as any);

  const offer = await db.offerBlueprint.create({
    data: {
      userId,
      lane,
      goal: snapshot.primaryGoal || "",
      audience: snapshot.audienceSize || "",
      vibe: snapshot.vibeTags || "",
      title: blueprint.title,
      promise: blueprint.promise,
      pricing: blueprint.pricing as any,
      deliverables: blueprint.deliverables as any,
      funnel: blueprint.funnel as any,
      scripts: blueprint.scripts as any,
    },
  });

  return NextResponse.json({ offer });
}