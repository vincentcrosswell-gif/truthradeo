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
};

const tiers: Tier[] = [
  {
    name: "South Loop",
    plan: "SOUTH_LOOP",
    monthlyLabel: "Start South Loop (Monthly)",
    lifetimeLabel: "Get South Loop (Lifetime)",
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
    monthlyLabel: "Start River North (Monthly)",
    lifetimeLabel: "Get River North (Lifetime)",
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
    monthlyLabel: "Start The Loop (Monthly)",
    lifetimeLabel: "Get The Loop (Lifetime)",
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

  return (
    <div
      className={[
        "rounded-2xl border p-6 backdrop-blur",
        highlight
          ? "border-white/25 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "border-white/12 bg-white/5",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
        {highlight ? (
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
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
          <Link
            href="/sign-up"
            className={[
              "inline-flex w-full justify-center rounded-xl px-4 py-2 text-sm font-semibold",
              highlight
                ? "bg-white text-black hover:bg-white/90"
                : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
            ].join(" ")}
          >
            Create account to start
          </Link>
          <div className="text-center text-xs text-white/50">
            You’ll pick a plan after sign-up.
          </div>
        </SignedOut>

        <SignedIn>
          <CheckoutButton
            plan={tier.plan}
            cadence="monthly"
            label={tier.monthlyLabel}
            className={[
              "inline-flex w-full justify-center rounded-xl px-4 py-2 text-sm font-semibold",
              highlight
                ? "bg-white text-black hover:bg-white/90"
                : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
            ].join(" ")}
          />
          <CheckoutButton
            plan={tier.plan}
            cadence="lifetime"
            label={tier.lifetimeLabel}
            className="inline-flex w-full justify-center rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/80 hover:bg-black/40"
          />
          <div className="text-center text-xs text-white/50">
            Monthly = recurring. Lifetime = one-time.
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
          Pick a tier based on how aggressively you want TruthRadeo to generate and package your
          revenue plan (Chicago Stage 1).
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.name} tier={t} />
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        <p className="font-semibold text-white">Notes</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Checkout requires Stripe price IDs in env vars.</li>
          <li>Entitlements are granted by webhook events (production-grade flow).</li>
        </ul>
      </div>
    </main>
  );
}