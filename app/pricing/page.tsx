// app/pricing/page.tsx
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import type { Plan } from "@/lib/billing/plans";

type Tier = {
  name: string;
  plan: Plan;
  highlight?: boolean;
  monthlyLabel: string;
  lifetimeLabel: string;
  bullets: string[];
  subtext?: string;
};

const tiers: Tier[] = [
  {
    name: "South Loop",
    plan: "SOUTH_LOOP",
    monthlyLabel: "Start Monthly",
    lifetimeLabel: "Get Lifetime",
    subtext: "Best for getting your first offer live fast.",
    bullets: [
      "Creator Snapshot + Summary",
      "Revenue Diagnostic v1",
      "Offer Architect basics",
      "Starter Chicago roadmap",
    ],
  },
  {
    name: "River North",
    plan: "RIVER_NORTH",
    highlight: true,
    monthlyLabel: "Start Monthly",
    lifetimeLabel: "Get Lifetime",
    subtext: "Best for consistent launches and stronger conversions.",
    bullets: [
      "Everything in South Loop",
      "Execution Assets (DMs, emails, rollout)",
      "More advanced offer outputs",
      "Faster iteration for launches",
    ],
  },
  {
    name: "The Loop",
    plan: "THE_LOOP",
    monthlyLabel: "Start Monthly",
    lifetimeLabel: "Get Lifetime",
    subtext: "Best for power users and future upgrades.",
    bullets: [
      "Everything in River North",
      "Highest tier (future upgrades here)",
      "Advanced system tuning (coming soon)",
      "Priority feature drops",
    ],
  },
];

function TierCard({ tier }: { tier: Tier }) {
  const highlight = !!tier.highlight;

  const primaryBtnClass = [
    "inline-flex w-full justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
    highlight
      ? "bg-white text-black hover:bg-white/90"
      : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
  ].join(" ");

  return (
    <div
      className={[
        "rounded-2xl border p-6 backdrop-blur",
        highlight
          ? "border-white/25 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "border-white/12 bg-white/5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
          {tier.subtext ? (
            <p className="mt-1 text-sm text-white/60">{tier.subtext}</p>
          ) : null}
        </div>

        {highlight ? (
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
            Most Popular
          </span>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {tier.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-white/60">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-2">
        <SignedOut>
          <Link href="/sign-up" className={primaryBtnClass}>
            Create account to start
          </Link>
          <div className="text-center text-xs text-white/50">
            Sign up first, then choose your plan.
          </div>
        </SignedOut>

        <SignedIn>
          <CheckoutButton
            plan={tier.plan}
            cadence="monthly"
            label={tier.monthlyLabel}
            className={primaryBtnClass}
          />
          <CheckoutButton
            plan={tier.plan}
            cadence="lifetime"
            label={tier.lifetimeLabel}
            className="inline-flex w-full justify-center rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/80 transition hover:bg-black/40"
          />
          <div className="text-center text-xs text-white/50">
            Monthly is recurring. Lifetime is a one-time purchase.
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-white">Pricing</h1>
        <p className="max-w-2xl text-white/70">
          Choose the tier that matches how quickly you want to move from idea → offer → execution.
          Built for Chicago Stage 1 creators.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.name} tier={t} />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-white">Need help choosing?</p>
          <p className="mt-1 text-sm text-white/70">
            Start with <span className="text-white">South Loop</span> if you’re launching your first
            offer. Choose <span className="text-white">River North</span> if you want the execution
            assets to move faster.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/80 transition hover:bg-black/40"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}