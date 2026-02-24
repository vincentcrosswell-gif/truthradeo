"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DiagnosticResult } from "@/lib/diagnostic";

type HistoryItem = {
  id: string;
  createdAt: string;
  snapshotId: string | null;
  scores: DiagnosticResult["scores"];
  topMoveTitles: string[];
};

type Props = {
  initialResult: DiagnosticResult;
  initialHistory: HistoryItem[];
};

function formatDateTime(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatDate(value: string) {
  const d = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function composite(scores: DiagnosticResult["scores"]) {
  return Math.round(
    (scores.monetization +
      scores.audience +
      scores.offer +
      scores.momentum +
      scores.clarity) /
      5
  );
}

function scoreEntries(scores: DiagnosticResult["scores"]) {
  return [
    { label: "Monetization", value: scores.monetization },
    { label: "Audience", value: scores.audience },
    { label: "Offer", value: scores.offer },
    { label: "Momentum", value: scores.momentum },
    { label: "Clarity", value: scores.clarity },
  ];
}

function bestWorst(scores: DiagnosticResult["scores"]) {
  const sorted = [...scoreEntries(scores)].sort((a, b) => b.value - a.value);
  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
}

export default function DiagnosticClient({
  initialResult,
  initialHistory,
}: Props) {
  const [result, setResult] = useState<DiagnosticResult>(initialResult);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "deduped" | "error"
  >("idle");

  useEffect(() => {
    let cancelled = false;

    async function saveRun() {
      setSaveState("saving");

      try {
        const res = await fetch("/api/diagnostic/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const json = (await res.json().catch(() => ({}))) as any;

        if (!res.ok) {
          throw new Error(json?.error || "Failed to save diagnostic report");
        }

        if (cancelled) return;

        if (json?.result) {
          setResult(json.result as DiagnosticResult);
        }
        if (Array.isArray(json?.history)) {
          setHistory(json.history as HistoryItem[]);
        }

        setSaveState(json?.saved?.deduped ? "deduped" : "saved");
      } catch {
        if (!cancelled) setSaveState("error");
      }
    }

    saveRun();

    return () => {
      cancelled = true;
    };
  }, []);

  const latest = history[0] ?? null;
  const previous = history[1] ?? null;

  const latestComposite = latest ? composite(latest.scores) : composite(result.scores);
  const prevComposite = previous ? composite(previous.scores) : null;
  const delta = prevComposite === null ? null : latestComposite - prevComposite;

  const bw = useMemo(() => bestWorst(result.scores), [result.scores]);

  return (
    <>
      {/* Save status */}
      <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/75">
        {saveState === "saving" && "Saving diagnostic run..."}
        {saveState === "saved" && "Diagnostic report saved to history."}
        {saveState === "deduped" &&
          "Diagnostic already matched your latest run (recent), so history was not duplicated."}
        {saveState === "error" &&
          "Couldn’t save diagnostic history right now, but your scores still rendered."}
        {saveState === "idle" && "Preparing diagnostic..."}
      </div>

      {/* Scores */}
      <div className="grid gap-4 md:grid-cols-5">
        <ScoreCard label="Monetization" value={result.scores.monetization} />
        <ScoreCard label="Audience" value={result.scores.audience} />
        <ScoreCard label="Offer" value={result.scores.offer} />
        <ScoreCard label="Momentum" value={result.scores.momentum} />
        <ScoreCard label="Clarity" value={result.scores.clarity} />
      </div>

      {/* Top Moves */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <h2 className="text-lg font-extrabold">Top 3 Moves</h2>
        <div className="mt-4 grid gap-4">
          {result.topMoves.map((m, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{m.title}</div>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                  Impact: {m.impact}
                </span>
              </div>
              <div className="mt-2 text-sm text-white/70">{m.why}</div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
                {m.nextSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs uppercase tracking-wider text-white/55">
            Snapshot notes used
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {result.notes.map((n, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs"
              >
                <span className="text-white/50">{n.label}: </span>
                <span className="text-white/80">{n.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/snapshot/summary"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm hover:bg-white/10"
          >
            ← Back to Snapshot Summary
          </Link>

          <Link
            href="/dashboard/offers/new"
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Build Offer Blueprint →
          </Link>
        </div>
      </div>

      {/* Diagnostic History */}
      <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Diagnostic History</div>
            <h2 className="mt-1 text-lg font-extrabold">Score trend over time</h2>
            <p className="mt-1 text-sm text-white/70">
              Every time you run the diagnostic, TruthRadeo stores a report so you can
              track momentum and see what’s improving.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            {latest ? `Latest run: ${formatDateTime(latest.createdAt)}` : "No history yet"}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <StatCard
            label="Composite score"
            value={String(latestComposite)}
            sub={delta === null ? "Need 2 runs for trend" : `${delta >= 0 ? "+" : ""}${delta} vs previous`}
          />
          <StatCard
            label="Strongest area"
            value={`${bw.best.label} ${bw.best.value}`}
            sub="Best current score"
          />
          <StatCard
            label="Weakest area"
            value={`${bw.worst.label} ${bw.worst.value}`}
            sub="Primary improvement lane"
          />
          <StatCard
            label="Runs saved"
            value={String(history.length)}
            sub="Showing recent history"
          />
        </div>

        <div className="mt-4 grid gap-3">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              No diagnostic history yet. Refresh the page or run Diagnostic again after updating your Snapshot.
            </div>
          ) : (
            history.map((h, idx) => {
              const comp = composite(h.scores);
              const prev = history[idx + 1] ? composite(history[idx + 1].scores) : null;
              const runDelta = prev === null ? null : comp - prev;

              return (
                <div
                  key={h.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white/90">
                        {formatDateTime(h.createdAt)}
                      </div>
                      <div className="mt-1 text-xs text-white/55">
                        {idx === 0 ? "Most recent" : `Run #${history.length - idx}`}
                        {runDelta !== null
                          ? ` • Composite ${runDelta >= 0 ? "+" : ""}${runDelta} vs previous`
                          : ""}
                      </div>
                    </div>

                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                      Composite {comp}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    {scoreEntries(h.scores).map((s) => (
                      <div
                        key={`${h.id}-${s.label}`}
                        className="rounded-xl border border-white/10 bg-black/50 px-2 py-2 text-center"
                      >
                        <div className="text-[11px] text-white/55">{s.label}</div>
                        <div className="mt-1 text-sm font-semibold">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {h.topMoveTitles.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {h.topMoveTitles.map((title, i) => (
                        <span
                          key={`${h.id}-move-${i}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                        >
                          {title}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {history.length > 0 ? (
          <div className="mt-4 text-xs text-white/50">
            Tip: update your Snapshot, then run Diagnostic again to see score shifts and whether your top moves change.
          </div>
        ) : null}
      </section>
    </>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-white/70" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}