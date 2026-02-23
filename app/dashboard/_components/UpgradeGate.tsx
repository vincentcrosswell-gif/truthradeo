"use client";

import Link from "next/link";

export type Plan = "FREE" | "SOUTH_LOOP" | "RIVER_NORTH" | "THE_LOOP";

const planLabel: Record<Plan, string> = {
  FREE: "Free",
  SOUTH_LOOP: "South Loop",
  RIVER_NORTH: "River North",
  THE_LOOP: "The Loop",
};

function badgeTone(plan: Plan) {
  if (plan === "FREE") return "border-white/10 bg-black/30 text-white/70";
  if (plan === "SOUTH_LOOP") return "border-amber-400/25 bg-amber-500/10 text-amber-200";
  if (plan === "RIVER_NORTH") return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
  return "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200";
}

export default function UpgradeGate({
  title,
  message,
  currentPlan,
  requiredPlan,
  primaryCtaHref = "/pricing",
  primaryCtaLabel = "Upgrade →",
  secondaryCtaHref,
  secondaryCtaLabel,
}: {
  title: string;
  message: string;
  currentPlan: Plan;
  requiredPlan: Plan;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/60">Upgrade required</div>
          <h2 className="mt-1 text-xl font-extrabold">{title}</h2>
          <p className="mt-2 text-sm text-white/70">{message}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className={`rounded-full border px-3 py-1 ${badgeTone(currentPlan)}`}>
              Current: <span className="text-white/90">{planLabel[currentPlan]}</span>
            </span>
            <span className={`rounded-full border px-3 py-1 ${badgeTone(requiredPlan)}`}>
              Required: <span className="text-white/90">{planLabel[requiredPlan]}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {secondaryCtaHref && secondaryCtaLabel ? (
            <Link
              href={secondaryCtaHref}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              {secondaryCtaLabel}
            </Link>
          ) : null}

          <Link
            href={primaryCtaHref}
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            {primaryCtaLabel}
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">What you unlock</div>
          <div className="mt-2 text-sm text-white/85">
            {requiredPlan === "SOUTH_LOOP" ? (
              <>Offer Architect (Blueprints) + a structured workspace to start making money.</>
            ) : requiredPlan === "RIVER_NORTH" ? (
              <>Execution Assets + Iteration Engine (run logs + daily check-ins + weekly upgrades).</>
            ) : (
              <>Full access + early unlocks as TruthRadeo expands.</>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Why it matters</div>
          <div className="mt-2 text-sm text-white/85">
            This is the part that turns “ideas” into revenue — consistent execution + measurable iteration.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Fastest path</div>
          <div className="mt-2 text-sm text-white/85">
            Upgrade → come back here → finish this flow in under 10 minutes.
          </div>
        </div>
      </div>
    </section>
  );
}