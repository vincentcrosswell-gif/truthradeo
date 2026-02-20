import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { buildOfferBlueprint } from "@/lib/offers";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lane = body?.lane;

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
