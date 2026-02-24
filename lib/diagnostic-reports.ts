// lib/diagnostic-reports.ts
import { db } from "@/lib/db";
import { runDiagnostic, type DiagnosticResult } from "@/lib/diagnostic";

type Scores = DiagnosticResult["scores"];

export type DiagnosticHistoryItem = {
  id: string;
  createdAt: Date;
  snapshotId: string | null;
  scores: Scores;
  topMoveTitles: string[];
};

function sameScores(a: Scores, b: Scores) {
  return (
    a.monetization === b.monetization &&
    a.audience === b.audience &&
    a.offer === b.offer &&
    a.momentum === b.momentum &&
    a.clarity === b.clarity
  );
}

function jsonStable(value: unknown) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return "null";
  }
}

export function diagnosticComposite(scores: Scores) {
  return Math.round(
    (scores.monetization +
      scores.audience +
      scores.offer +
      scores.momentum +
      scores.clarity) /
      5
  );
}

export function bestWorstScores(scores: Scores) {
  const entries = [
    ["Monetization", scores.monetization],
    ["Audience", scores.audience],
    ["Offer", scores.offer],
    ["Momentum", scores.momentum],
    ["Clarity", scores.clarity],
  ] as const;

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);

  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
}

export async function getDiagnosticHistory(
  userId: string,
  limit = 8
): Promise<DiagnosticHistoryItem[]> {
  const rows = await db.diagnosticReport.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      snapshotId: true,
      monetizationScore: true,
      audienceScore: true,
      offerScore: true,
      momentumScore: true,
      clarityScore: true,
      topMovesJson: true,
    },
  });

  return rows.map((r) => {
    const topMoveTitles = Array.isArray(r.topMovesJson)
      ? r.topMovesJson
          .map((x) => {
            if (
              typeof x === "object" &&
              x !== null &&
              "title" in x &&
              typeof (x as { title?: unknown }).title === "string"
            ) {
              return (x as { title: string }).title;
            }
            return "";
          })
          .filter(Boolean)
          .slice(0, 3)
      : [];

    return {
      id: r.id,
      createdAt: r.createdAt,
      snapshotId: r.snapshotId,
      scores: {
        monetization: r.monetizationScore,
        audience: r.audienceScore,
        offer: r.offerScore,
        momentum: r.momentumScore,
        clarity: r.clarityScore,
      },
      topMoveTitles,
    };
  });
}

export async function persistDiagnosticReportForUser(
  userId: string,
  opts?: { dedupeWindowMs?: number }
) {
  const dedupeWindowMs = opts?.dedupeWindowMs ?? 5 * 60 * 1000;

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });
  if (!snapshot) {
    return {
      ok: false as const,
      error: "NO_SNAPSHOT",
    };
  }

  const result = runDiagnostic(snapshot as any);

  const latest = await db.diagnosticReport.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      snapshotId: true,
      monetizationScore: true,
      audienceScore: true,
      offerScore: true,
      momentumScore: true,
      clarityScore: true,
      topMovesJson: true,
      notesJson: true,
    },
  });

  const now = Date.now();
  const withinDedupeWindow =
    latest && now - latest.createdAt.getTime() < dedupeWindowMs;

  const latestScores: Scores | null = latest
    ? {
        monetization: latest.monetizationScore,
        audience: latest.audienceScore,
        offer: latest.offerScore,
        momentum: latest.momentumScore,
        clarity: latest.clarityScore,
      }
    : null;

  const sameAsLatest =
    !!latest &&
    latest.snapshotId === snapshot.id &&
    !!latestScores &&
    sameScores(latestScores, result.scores) &&
    jsonStable(latest.topMovesJson) === jsonStable(result.topMoves) &&
    jsonStable(latest.notesJson) === jsonStable(result.notes);

  if (withinDedupeWindow && sameAsLatest) {
    return {
      ok: true as const,
      snapshot,
      result,
      reportId: latest.id,
      createdAt: latest.createdAt,
      deduped: true,
    };
  }

  const created = await db.diagnosticReport.create({
    data: {
      userId,
      snapshotId: snapshot.id,
      monetizationScore: result.scores.monetization,
      audienceScore: result.scores.audience,
      offerScore: result.scores.offer,
      momentumScore: result.scores.momentum,
      clarityScore: result.scores.clarity,
      topMovesJson: result.topMoves as any,
      notesJson: result.notes as any,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return {
    ok: true as const,
    snapshot,
    result,
    reportId: created.id,
    createdAt: created.createdAt,
    deduped: false,
  };
}