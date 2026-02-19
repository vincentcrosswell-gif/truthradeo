import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Header />

      <section className="mx-auto w-full max-w-6xl px-6 pt-10 pb-14">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/12 to-white/5 p-8">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Chicago Stage Pricing
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Choose the tier that matches your momentum. “Lifetime” applies to
            Stage 1 (Chicago) access only.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/faq" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              FAQ
            </Link>
            <Link href="/" className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/80 hover:bg-black/40">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <TierCard
            name="South Loop"
            monthly="$29/mo"
            lifetime="$149 lifetime"
            vibe="Foundation"
            bullets={[
              "Creator Snapshot",
              "Basic revenue diagnostic",
              "Core offer outline",
              "Basic execution checklist",
              "Quarterly iteration plan",
            ]}
          />
          <TierCard
            name="River North"
            monthly="$59/mo"
            lifetime="$349 lifetime"
            vibe="Momentum"
            highlight
            bullets={[
              "Everything in South Loop",
              "Advanced diagnostic + priorities",
              "Offer ladder + value stack",
              "DM/email scripts",
              "Launch timeline + 60-day planner",
              "Basic revenue forecast",
            ]}
          />
          <TierCard
            name="The Loop"
            monthly="$119/mo"
            lifetime="$799 lifetime"
            vibe="Scaling"
            bullets={[
              "Everything in River North",
              "Multi-offer ecosystem planning",
              "Advanced modeling structure",
              "Launch calendar cadence",
              "Quarterly review framework",
              "Best for serious scaling runs",
            ]}
          />
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-black/35 p-7">
          <h2 className="text-lg font-semibold">Notes</h2>
          <ul className="mt-3 grid gap-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="text-white/50">•</span>
              Chicago Stage is a revenue engine (not streaming).
            </li>
            <li className="flex gap-2">
              <span className="text-white/50">•</span>
              Lifetime applies to Stage 1 access. Future stages are separate.
            </li>
            <li className="flex gap-2">
              <span className="text-white/50">•</span>
              You can start on a lower tier and upgrade later.
            </li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto w-full max-w-6xl px-6 text-sm text-white/60">
          © {new Date().getFullYear()} TruthRadeo
        </div>
      </footer>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div className="leading-tight">
            <div className="text-xs tracking-wide text-white/60">TruthRadeo</div>
            <div className="text-base font-semibold">Pricing • Chicago</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
                Create account
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

function TierCard({
  name,
  monthly,
  lifetime,
  vibe,
  bullets,
  highlight,
}: {
  name: string;
  monthly: string;
  lifetime: string;
  vibe: string;
  bullets: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border p-6",
        highlight
          ? "border-white/25 bg-gradient-to-b from-white/12 to-white/5"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/60">Tier</div>
          <div className="text-xl font-extrabold">{name}</div>
        </div>
        <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
          {vibe}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-extrabold">{monthly}</div>
        <div className="mt-1 text-sm text-white/60">{lifetime}</div>
      </div>

      <ul className="mt-5 grid gap-2 text-sm text-white/70">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-white/50">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-2">
        <Link
          href="/sign-up"
          className={[
            "inline-flex w-full justify-center rounded-xl px-4 py-2 text-sm font-semibold",
            highlight
              ? "bg-white text-black hover:bg-white/90"
              : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
          ].join(" ")}
        >
          Start with {name}
        </Link>

        <div className="text-center text-xs text-white/50">
          Checkout hookup comes next (Stripe).
        </div>
      </div>
    </div>
  );
}
