import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { buildOfferBlueprint } from "@/lib/offers";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";

type Lane = "service" | "digital" | "membership" | "live" | "hybrid";

type PricingTier = {
  tier: string;
  price: string;
  includes: string[];
};

type FunnelStep = {
  step: string;
  action: string;
};

type ScriptsShape = {
  dm: string;
  caption: string;
  followUp: string;
};

function noStoreJson(data: unknown, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

function isLane(v: unknown): v is Lane {
  return (
    v === "service" ||
    v === "digital" ||
    v === "membership" ||
    v === "live" ||
    v === "hybrid"
  );
}

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

function cleanString(v: unknown, max: number) {
  return str(v).replace(/\r\n/g, "\n").trim().slice(0, max);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parsePricing(value: unknown) {
  if (!Array.isArray(value)) {
    return { ok: false as const, error: "pricing must be an array" };
  }

  const out: PricingTier[] = [];

  for (const item of value.slice(0, 6)) {
    if (!isPlainObject(item)) {
      return { ok: false as const, error: "Each pricing item must be an object" };
    }

    const tier = cleanString(item.tier, 60);
    const price = cleanString(item.price, 60);

    const includesRaw = Array.isArray(item.includes) ? item.includes : [];
    const includes = includesRaw
      .map((x) => cleanString(x, 120))
      .filter(Boolean)
      .slice(0, 8);

    if (!tier || !price) {
      return {
        ok: false as const,
        error: "Each pricing item must include non-empty tier and price",
      };
    }

    out.push({ tier, price, includes });
  }

  return { ok: true as const, value: out };
}

function parseDeliverables(value: unknown) {
  if (!Array.isArray(value)) {
    return { ok: false as const, error: "deliverables must be an array" };
  }

  const out = value
    .map((x) => cleanString(x, 140))
    .filter(Boolean)
    .slice(0, 20);

  return { ok: true as const, value: out };
}

function parseFunnel(value: unknown) {
  if (!Array.isArray(value)) {
    return { ok: false as const, error: "funnel must be an array" };
  }

  const out: FunnelStep[] = [];

  for (const item of value.slice(0, 10)) {
    if (!isPlainObject(item)) {
      return { ok: false as const, error: "Each funnel item must be an object" };
    }

    const step = cleanString(item.step, 80);
    const action = cleanString(item.action, 240);

    if (!step || !action) {
      return {
        ok: false as const,
        error: "Each funnel item must include non-empty step and action",
      };
    }

    out.push({ step, action });
  }

  return { ok: true as const, value: out };
}

function parseScripts(value: unknown) {
  if (!isPlainObject(value)) {
    return { ok: false as const, error: "scripts must be an object" };
  }

  const scripts: ScriptsShape = {
    dm: cleanString(value.dm, 1200),
    caption: cleanString(value.caption, 1200),
    followUp: cleanString(value.followUp, 1200),
  };

  return { ok: true as const, value: scripts };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return noStoreJson({ error: "Unauthorized" }, 401);

  const plan = await getUserPlan(userId);
  if (!hasAccess(plan, "SOUTH_LOOP")) {
    return noStoreJson(
      {
        error: "upgrade_required",
        message: "Offer editing is unlocked on South Loop and above.",
        currentPlan: plan,
        requiredPlan: "SOUTH_LOOP",
      },
      402
    );
  }

  const { id } = await params;
  const offer = await db.offerBlueprint.findUnique({ where: { id } });
  if (!offer || offer.userId !== userId) {
    return noStoreJson({ error: "Not found" }, 404);
  }

  const body = await req.json().catch(() => ({}));
  if (!isPlainObject(body)) {
    return noStoreJson({ error: "Request body must be a JSON object" }, 400);
  }

  const action = str(body.action || "update");

  // Optional one-click regenerate from current Snapshot
  if (action === "regenerate") {
    const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });
    if (!snapshot) {
      return noStoreJson(
        { error: "No snapshot found. Complete Snapshot first." },
        400
      );
    }

    const nextLane: Lane = isLane(body.lane) ? body.lane : (offer.lane as Lane);

    const blueprint = buildOfferBlueprint({
      lane: nextLane,
      artistName: snapshot.artistName,
      genre: snapshot.genre,
      vibeTags: snapshot.vibeTags,
      primaryGoal: snapshot.primaryGoal,
      audienceSize: snapshot.audienceSize,
      biggestBlocker: snapshot.biggestBlocker,
    });

    const updated = await db.offerBlueprint.update({
      where: { id: offer.id },
      data: {
        lane: nextLane,
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

    return noStoreJson({ offer: updated, mode: "regenerated" });
  }

  // Standard manual update (whitelisted fields only)
  const errors: string[] = [];
  const updateData: Record<string, unknown> = {};

  if ("lane" in body) {
    if (!isLane(body.lane)) {
      errors.push("lane must be one of: service, digital, membership, live, hybrid");
    } else {
      updateData.lane = body.lane;
    }
  }

  if ("title" in body) updateData.title = cleanString(body.title, 140);
  if ("promise" in body) updateData.promise = cleanString(body.promise, 600);
  if ("goal" in body) updateData.goal = cleanString(body.goal, 160);
  if ("audience" in body) updateData.audience = cleanString(body.audience, 160);
  if ("vibe" in body) updateData.vibe = cleanString(body.vibe, 200);

  if ("pricing" in body) {
    const parsed = parsePricing(body.pricing);
    if (!parsed.ok) errors.push(parsed.error);
    else updateData.pricing = parsed.value as any;
  }

  if ("deliverables" in body) {
    const parsed = parseDeliverables(body.deliverables);
    if (!parsed.ok) errors.push(parsed.error);
    else updateData.deliverables = parsed.value as any;
  }

  if ("funnel" in body) {
    const parsed = parseFunnel(body.funnel);
    if (!parsed.ok) errors.push(parsed.error);
    else updateData.funnel = parsed.value as any;
  }

  if ("scripts" in body) {
    const parsed = parseScripts(body.scripts);
    if (!parsed.ok) errors.push(parsed.error);
    else updateData.scripts = parsed.value as any;
  }

  if (errors.length > 0) {
    return noStoreJson(
      {
        error: "invalid_payload",
        message: "Offer update payload is invalid.",
        details: errors,
      },
      400
    );
  }

  if (Object.keys(updateData).length === 0) {
    return noStoreJson(
      { error: "No editable offer fields provided" },
      400
    );
  }

  const updated = await db.offerBlueprint.update({
    where: { id: offer.id },
    data: updateData as any,
  });

  return noStoreJson({ offer: updated, mode: "updated" });
}