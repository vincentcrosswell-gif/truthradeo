import Link from "next/link";
import { getStage1FunnelMetrics } from "@/lib/events";

type Props = {
  userId: string;
};

export default async function FunnelDropoffPanel({ userId }: Props) {
  const funnel = await getStage1FunnelMetrics(userId);

  const rows = [
    {
      step: "1. Snapshot",
      views: funnel.pageViews.snapshot,
      completions: funnel.completions.snapshotSaved,
      cta: "/dashboard/snapshot",
      ctaLabel: "Open Snapshot",
      conversionLabel: "Save rate",
      conversion:
        funnel.pageViews.snapshot > 0
          ? Math.round((funnel.completions.snapshotSaved / funnel.pageViews.snapshot) * 100)
          : null,
    },
    {
      step: "2. Diagnostic",
      views: funnel.pageViews.diagnostic,
      completions: funnel.completions.diagnosticRuns,
      cta: "/dashboard/diagnostic",
      ctaLabel: "Open Diagnostic",
      conversionLabel: "Run rate",
      conversion:
        funnel.pageViews.diagnostic > 0
          ? Math.round((funnel.completions.diagnosticRuns / funnel.pageViews.diagnostic) * 100)
          : null,
    },
    {
      step: "3. Offer Builder",
      views: funnel.pageViews.offerBuilder,
      completions: funnel.completions.offersCreated,
      cta: "/dashboard/offers/new",
      ctaLabel: "Build Offer",
      conversionLabel: "Create rate",
      conversion:
        funnel.pageViews.offerBuilder > 0
          ? Math.round((funnel.completions.offersCreated / funnel.pageViews.offerBuilder) * 100)
          : null,
    },
    {
      step: "4. Execution",
      views: funnel.pageViews.offerWorkspace,
      completions: funnel.completions.executionRunsLogged,
      cta: "/dashboard/offers",
      ctaLabel: "Open Offers",
      conversionLabel: "Run log rate",
      conversion:
        funnel.pageViews.offerWorkspace > 0
          ? Math.round((funnel.completions.executionRunsLogged / funnel.pageViews.offerWorkspace) * 100)
          : null,
    },
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/60">Analytics</div>
          <h2 className="mt-1 text-lg font-extrabold">Stage 1 Funnel Drop-off</h2>
          <p className="mt-1 text-sm text-white/70">
            Lightweight internal event tracking for your own workspace flow.
            This helps you see where users (and you) are stopping: Snapshot → Diagnostic → Offer → Execution.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
          Events are stored in <span className="font-semibold text-white/90">AppEvent</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Snapshot → Diagnostic"
          value={pctText(funnel.conversion.snapshotToDiagnosticPct)}
          sub={`${funnel.completions.snapshotSaved} saves → ${funnel.completions.diagnosticRuns} runs`}
        />
        <MetricCard
          label="Diagnostic → Offer"
          value={pctText(funnel.conversion.diagnosticToOfferPct)}
          sub={`${funnel.completions.diagnosticRuns} runs → ${funnel.completions.offersCreated} blueprints`}
        />
        <MetricCard
          label="Offer → Execution"
          value={pctText(funnel.conversion.offerToExecutionPct)}
          sub={`${funnel.completions.offersCreated} blueprints → ${funnel.completions.executionRunsLogged} logs`}
        />
      </div>

      <div className="mt-4 grid gap-3">
        {rows.map((row) => {
          const dropoff = row.views > 0 ? Math.max(0, row.views - row.completions) : 0;

          return (
            <div
              key={row.step}
              className="grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))_auto]"
            >
              <div>
                <div className="text-sm font-semibold text-white/90">{row.step}</div>
                <div className="mt-1 text-xs text-white/55">
                  {row.conversionLabel}: {pctText(row.conversion)}
                </div>
              </div>

              <MiniStat label="Views" value={row.views} />
              <MiniStat label="Completions" value={row.completions} />
              <MiniStat label="Drop-off" value={dropoff} />

              <div className="md:justify-self-end">
                <Link
                  href={row.cta}
                  className="inline-flex rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                >
                  {row.ctaLabel} →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/65">
        Tip: this is intentionally simple (first-party events in your own DB). Later you can swap or mirror
        events into PostHog/Amplitude once you have real user traffic.
      </div>
    </section>
  );
}

function pctText(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="text-sm font-semibold text-white/90">{value}</div>
    </div>
  );
}