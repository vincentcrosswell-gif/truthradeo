// app/dashboard/snapshot/summary/ChicagoRoadmapPanel.tsx
import Link from "next/link";
import { generateChicagoRoadmap, SnapshotLike } from "@/lib/roadmap/chicago";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

export default function ChicagoRoadmapPanel({ snapshot }: { snapshot: SnapshotLike }) {
  const rm = generateChicagoRoadmap(snapshot);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
            <span className="inline-block h-2 w-2 rounded-full bg-white/50" />
            Chicago Roadmap
          </div>

          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
            {rm.headline}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-white/70">{rm.subhead}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>Goal: {snapshot.primaryGoal || "—"}</Pill>
            <Pill>Blocker: {snapshot.biggestBlocker || "—"}</Pill>
            <Pill>Audience: {snapshot.audienceSize || "—"}</Pill>
            <Pill>Listeners: {snapshot.monthlyListeners || "—"}</Pill>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/offers/new"
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Generate Offer →
          </Link>

          <Link
            href="/dashboard/diagnostic"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm hover:bg-white/10"
          >
            Run Diagnostic
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="text-xs uppercase tracking-wider text-white/50">
          Quick wins (today)
        </div>
        <ul className="mt-2 grid gap-2 text-sm text-white/80">
          {rm.quickWins.map((q) => (
            <li key={q} className="flex gap-2">
              <span className="text-white/50">•</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {rm.weeks.map((w) => (
          <div
            key={w.title}
            className="rounded-3xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold tracking-tight text-white">
                  {w.title}
                </h3>
                <div className="mt-1 text-xs text-white/60">
                  Focus metric:{" "}
                  <span className="font-semibold text-white/80">{w.focusMetric}</span>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Chicago move
              </span>
            </div>

            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Top 3
                </div>
                <ul className="mt-2 grid gap-2 text-sm text-white/80">
                  {w.top3.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-white/50">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Task list
                </div>
                <ul className="mt-2 grid gap-2 text-sm text-white/80">
                  {w.tasks.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-white/50">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4">
                <div className="text-xs uppercase tracking-wider text-white/50">
                  Chicago-native move
                </div>
                <div className="mt-2 text-sm font-semibold text-white/85">
                  {w.chicagoMove}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-white/55">
        This roadmap is rule-based and designed to stay stable, fast, and low-cost.
        Later we can upgrade it to use your Diagnostic + OfferBlueprint results for even tighter steps.
      </div>
    </section>
  );
}