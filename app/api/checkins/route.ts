import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { trackAppEvent } from "@/lib/events";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";

function noStoreJson(data: any, init?: { status?: number }) {
  const res = NextResponse.json(data, { status: init?.status ?? 200 });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

function intOr0(v: unknown) {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

// Start-of-day in America/Chicago, stored as a UTC DateTime.
// This makes “daily” feel correct for your users (Chicago stage).
function startOfChicagoDay(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = Number(parts.find((p) => p.type === "year")?.value || "1970");
  const m = Number(parts.find((p) => p.type === "month")?.value || "01");
  const day = Number(parts.find((p) => p.type === "day")?.value || "01");

  // Convert “Chicago date” to an unambiguous UTC timestamp at 00:00:00Z.
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0, 0));
}

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return noStoreJson({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (!hasAccess(plan, "RIVER_NORTH")) {
    return noStoreJson(
      {
        error: "upgrade_required",
        message: "Daily check-ins are unlocked on River North and above.",
        currentPlan: plan,
        requiredPlan: "RIVER_NORTH",
      },
      { status: 402 }
    );
  }

  const { searchParams } = new URL(req.url);
  const offerId = searchParams.get("offerId") || "";
  const days = Math.min(30, Math.max(1, intOr0(searchParams.get("days") || "14")));

  if (!offerId) return noStoreJson({ error: "offerId is required" }, { status: 400 });

  const offer = await db.offerBlueprint.findUnique({ where: { id: offerId } });
  if (!offer || offer.userId !== userId) return noStoreJson({ error: "Not found" }, { status: 404 });

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const checkIns = await db.offerDailyCheckIn.findMany({
    where: { userId, offerId, day: { gte: startOfChicagoDay(since) } },
    orderBy: { day: "desc" },
  });

  const today = startOfChicagoDay(new Date());
  const todays = checkIns.find((c) => new Date(c.day).getTime() === today.getTime()) || null;

  return noStoreJson({ checkIns, todays });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return noStoreJson({ error: "Unauthorized" }, { status: 401 });

  const plan = await getUserPlan(userId);
  if (!hasAccess(plan, "RIVER_NORTH")) {
    return noStoreJson(
      {
        error: "upgrade_required",
        message: "Daily check-ins are unlocked on River North and above.",
        currentPlan: plan,
        requiredPlan: "RIVER_NORTH",
      },
      { status: 402 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const offerId = str(body?.offerId);
  if (!offerId) return noStoreJson({ error: "offerId is required" }, { status: 400 });

  const offer = await db.offerBlueprint.findUnique({ where: { id: offerId } });
  if (!offer || offer.userId !== userId) return noStoreJson({ error: "Not found" }, { status: 404 });

  const day = startOfChicagoDay(new Date());

  const existing = await db.offerDailyCheckIn.findUnique({
    where: { offerId_day: { offerId, day } },
    select: { id: true },
  });

  const energy = Math.min(5, Math.max(1, intOr0(body?.energy || 3)));
  const minutesExecuted = Math.min(24 * 60, Math.max(0, intOr0(body?.minutesExecuted || 0)));

  const keyMetric = str(body?.keyMetric || "outreach").slice(0, 32);
  const keyMetricValue = Math.max(0, intOr0(body?.keyMetricValue || 0));

  const win = str(body?.win).slice(0, 500);
  const blocker = str(body?.blocker).slice(0, 500);
  const nextStep = str(body?.nextStep).slice(0, 500);

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });

  const saved = await db.offerDailyCheckIn.upsert({
    where: { offerId_day: { offerId, day } },
    create: {
      userId,
      offerId,
      day,
      energy,
      minutesExecuted,
      keyMetric,
      keyMetricValue,
      win,
      blocker,
      nextStep,
    },
    update: {
      energy,
      minutesExecuted,
      keyMetric,
      keyMetricValue,
      win,
      blocker,
      nextStep,
    },
  });

  // Funnel completion: Daily check-in saved (count only the first save of the day as a “completion”)
  if (!existing) {
    await trackAppEvent({
      userId,
      name: "daily_checkin_saved",
      route: "/dashboard/offers/[id]",
      step: "execution",
      offerId,
      snapshotId: snapshot?.id ?? null,
      meta: {
        day: day.toISOString(),
        energy,
        minutesExecuted,
        keyMetric,
        keyMetricValue,
      },
    });
  }

  return noStoreJson({ checkIn: saved });
}