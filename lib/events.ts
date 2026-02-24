import { db } from "@/lib/db";

type JsonSafe =
  | string
  | number
  | boolean
  | null
  | JsonSafe[]
  | { [k: string]: JsonSafe };

export type TrackAppEventInput = {
  userId: string;
  name: string;
  route?: string;
  step?: string;
  offerId?: string | null;
  snapshotId?: string | null;
  meta?: unknown;
};

function clampString(value: unknown, max = 120) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function cleanMetaValue(value: unknown, depth = 0): JsonSafe {
  if (depth > 4) return "[depth-limit]";
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    if (typeof value === "string") return value.slice(0, 500);
    if (typeof value === "number" && !Number.isFinite(value)) return null;
    return value as JsonSafe;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 25).map((v) => cleanMetaValue(v, depth + 1));
  }

  if (typeof value === "object") {
    const out: Record<string, JsonSafe> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, 25)) {
      out[k.slice(0, 80)] = cleanMetaValue(v, depth + 1);
    }
    return out;
  }

  return String(value).slice(0, 500);
}

export async function trackAppEvent(input: TrackAppEventInput) {
  const userId = clampString(input.userId, 191);
  const name = clampString(input.name, 80);

  if (!userId || !name) return;

  try {
    await db.appEvent.create({
      data: {
        userId,
        name,
        route: clampString(input.route, 160),
        step: clampString(input.step, 80),
        offerId: clampString(input.offerId ?? "", 191) || null,
        snapshotId: clampString(input.snapshotId ?? "", 191) || null,
        meta: input.meta === undefined ? null : (cleanMetaValue(input.meta) as any),
      },
    });
  } catch (error) {
    console.error("trackAppEvent failed:", error);
  }
}

type StageFunnelMetrics = {
  pageViews: {
    dashboard: number;
    snapshot: number;
    diagnostic: number;
    offerBuilder: number;
    offerWorkspace: number;
  };
  completions: {
    snapshotSaved: number;
    diagnosticRuns: number;
    offersCreated: number;
    executionRunsLogged: number;
    dailyCheckInsSaved: number;
  };
  conversion: {
    snapshotToDiagnosticPct: number | null;
    diagnosticToOfferPct: number | null;
    offerToExecutionPct: number | null;
  };
};

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 100);
}

export async function getStage1FunnelMetrics(userId: string): Promise<StageFunnelMetrics> {
  const events = await db.appEvent.findMany({
    where: { userId },
    select: { name: true, route: true, step: true },
  });

  let dashboardViews = 0;
  let snapshotViews = 0;
  let diagnosticViews = 0;
  let offerBuilderViews = 0;
  let offerWorkspaceViews = 0;

  let snapshotSaved = 0;
  let diagnosticRuns = 0;
  let offersCreated = 0;
  let executionRunsLogged = 0;
  let dailyCheckInsSaved = 0;

  for (const e of events) {
    if (e.name === "page_view") {
      if (e.route === "/dashboard") dashboardViews++;
      if (e.route === "/dashboard/snapshot" || e.route === "/dashboard/snapshot/summary") {
        snapshotViews++;
      }
      if (e.route === "/dashboard/diagnostic") diagnosticViews++;
      if (e.route === "/dashboard/offers/new") offerBuilderViews++;
      if (e.route === "/dashboard/offers/[id]") offerWorkspaceViews++;
    }

    if (e.name === "snapshot_saved") snapshotSaved++;
    if (e.name === "diagnostic_run_saved") diagnosticRuns++;
    if (e.name === "offer_blueprint_created") offersCreated++;
    if (e.name === "execution_run_logged") executionRunsLogged++;
    if (e.name === "daily_checkin_saved") dailyCheckInsSaved++;
  }

  return {
    pageViews: {
      dashboard: dashboardViews,
      snapshot: snapshotViews,
      diagnostic: diagnosticViews,
      offerBuilder: offerBuilderViews,
      offerWorkspace: offerWorkspaceViews,
    },
    completions: {
      snapshotSaved,
      diagnosticRuns,
      offersCreated,
      executionRunsLogged,
      dailyCheckInsSaved,
    },
    conversion: {
      snapshotToDiagnosticPct: pct(diagnosticRuns, snapshotSaved),
      diagnosticToOfferPct: pct(offersCreated, diagnosticRuns),
      offerToExecutionPct: pct(executionRunsLogged, offersCreated),
    },
  };
}