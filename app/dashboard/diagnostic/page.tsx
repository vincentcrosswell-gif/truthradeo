import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { runDiagnostic } from "@/lib/diagnostic";

export default async function DiagnosticPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });
  if (!snapshot) redirect("/dashboard/snapshot");

  const result = runDiagnostic(snapshot as any);

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="text-xs text-white/60">Stage 1 • Chicago</div>
        <h1 className="mt-1 text-2xl font-extrabold">Revenue Diagnostic</h1>
        <p className="mt-2 text-white/70">
          Scores + top moves based on your Snapshot. Transparent logic (no magic).
        </p>
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
    </div>
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
