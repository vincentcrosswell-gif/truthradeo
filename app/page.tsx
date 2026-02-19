import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/12 to-white/5 p-8 md:p-12">
          {/* “Festival” glow */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
              <span className="font-semibold text-white/80">Stage 1</span>
              <span>Chicago</span>
              <span className="text-white/30">•</span>
              <span>Revenue Architecture Engine</span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              Turn your music into{" "}
              <span className="text-white/70">predictable revenue</span>.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">
              Chicago Stage doesn’t stream or “discover” your music for you.
              It builds your revenue blueprint: snapshot → diagnostic → offer →
              execution assets → iteration.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
                    Start Chicago Stage
                  </button>
                </SignUpButton>

                <SignInButton mode="modal">
                  <button className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10">
                    I already have an account
                  </button>
                </SignInButton>

                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/15 bg-black/30 px-5 py-3 text-sm text-white/80 hover:bg-black/40"
                >
                  View Pricing
                </Link>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
                >
                  Pricing
                </Link>
                <Link
                  href="/faq"
                  className="rounded-xl border border-white/15 bg-black/30 px-5 py-3 text-sm text-white/80 hover:bg-black/40"
                >
                  FAQ
                </Link>
              </SignedIn>
            </div>

            <div className="mt-8 grid gap-3 text-xs text-white/60 md:grid-cols-3">
              <Pill>Built for creators & scenes</Pill>
              <Pill>Execution assets, not advice</Pill>
              <Pill>Chicago = monetization foundation</Pill>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS CHICAGO */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          <div className="rounded-3xl border border-white/10 bg-black/35 p-7">
            <h2 className="text-xl font-semibold">What Chicago Stage does</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Chicago Stage turns your current situation into a structured revenue plan
              and generates the assets to launch it (copy, scripts, timeline, and a forecast).
            </p>

            <ul className="mt-5 grid gap-2 text-sm text-white/70">
              <li className="flex gap-2">
                <span className="text-white/50">•</span> Creator Snapshot (identity, links, audience, revenue, momentum)
              </li>
              <li className="flex gap-2">
                <span className="text-white/50">•</span> Revenue Diagnostic (leaks, priorities, risk/impact ranking)
              </li>
              <li className="flex gap-2">
                <span className="text-white/50">•</span> Offer Architect (offer types + pricing ladder + value stack)
              </li>
              <li className="flex gap-2">
                <span className="text-white/50">•</span> Execution Assets (offer page, DM/email scripts, launch timeline)
              </li>
              <li className="flex gap-2">
                <span className="text-white/50">•</span> Iteration Plan (what to tweak after results)
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/pricing"
                className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Choose a tier
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <EngineCard
              title="5 Engines • 1 Output"
              desc="Snapshot → Diagnostic → Offer → Assets → Iterate"
              tag="Chicago System"
            />
            <EngineCard
              title="Not a streaming platform"
              desc="Chicago is a revenue engine. No Spotify hosting. No “algorithm promises.”"
              tag="Clear scope"
            />
            <EngineCard
              title="Made for street-to-stage reality"
              desc="Built for artists who actually move: shows, drops, collabs, merch, bookings."
              tag="Festival energy"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8">
          <h2 className="text-xl font-semibold">How it works</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Stage 1 Chicago is the foundation. You complete the Snapshot first,
            then Chicago builds the plan and assets.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Step num="01" title="Snapshot" desc="Capture your current signal." />
            <Step num="02" title="Diagnostic" desc="Find leaks + priorities." />
            <Step num="03" title="Offer" desc="Build the money move." />
            <Step num="04" title="Assets" desc="Copy + scripts + timeline." />
            <Step num="05" title="Iterate" desc="Adjust after results." />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              See Pricing
            </Link>
            <Link
              href="/faq"
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
            >
              Read FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Chicago tiers</h2>
            <p className="mt-1 text-sm text-white/70">
              Pick the tier that matches your momentum.
            </p>
          </div>
          <Link href="/pricing" className="text-sm text-white/70 hover:text-white">
            Full pricing →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <PriceCard
            name="South Loop"
            price="$29/mo"
            lifetime="$149 lifetime"
            bullets={[
              "Snapshot + basic diagnostic",
              "Core offer outline",
              "Basic execution checklist",
              "Quarterly iteration plan",
            ]}
            ctaHref="/pricing"
            ctaText="Start here"
          />

          <PriceCard
            name="River North"
            price="$59/mo"
            lifetime="$349 lifetime"
            bullets={[
              "Advanced diagnostic + priorities",
              "Offer ladder + value stack",
              "DM/email scripts + launch timeline",
              "60-day planner + forecast",
            ]}
            highlight
            ctaHref="/pricing"
            ctaText="Most popular"
          />

          <PriceCard
            name="The Loop"
            price="$119/mo"
            lifetime="$799 lifetime"
            bullets={[
              "Multi-offer ecosystem planning",
              "Advanced modeling + calendar",
              "Quarterly review structure",
              "Best for serious scaling",
            ]}
            ctaHref="/pricing"
            ctaText="Go full send"
          />
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-black/35 p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">FAQ</h2>
              <p className="mt-1 text-sm text-white/70">
                Clear scope. No confusion.
              </p>
            </div>
            <Link href="/faq" className="text-sm text-white/70 hover:text-white">
              All questions →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FAQPreview
              q="Is TruthRadeo a streaming platform?"
              a="No. Chicago Stage is a revenue architecture engine that generates plans and execution assets."
            />
            <FAQPreview
              q="What do I get after completing the Snapshot?"
              a="You’ll move into the Diagnostic and Offer stages (next screens), then generate launch assets."
            />
            <FAQPreview
              q="Do I need Spotify/YouTube APIs connected?"
              a="No. You can paste links, but Chicago doesn’t require external API integrations to function."
            />
            <FAQPreview
              q="What does “lifetime” mean?"
              a="Lifetime applies to Chicago Stage access (Stage 1). Future stages are separate."
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

/* ---------- Shared UI ---------- */

function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div className="leading-tight">
            <div className="text-xs tracking-wide text-white/60">
              TruthRadeo
            </div>
            <div className="text-base font-semibold">Stage 1 • Chicago</div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/faq" className="hover:text-white">
            FAQ
          </Link>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
        </nav>

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

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} TruthRadeo</div>
        <div className="flex flex-wrap gap-4">
          <Link className="hover:text-white" href="/pricing">
            Pricing
          </Link>
          <Link className="hover:text-white" href="/faq">
            FAQ
          </Link>
          <Link className="hover:text-white" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-black/30 px-3 py-2">
      {children}
    </div>
  );
}

function EngineCard({
  title,
  desc,
  tag,
}: {
  title: string;
  desc: string;
  tag: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
      <div className="inline-flex rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
        {tag}
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <div className="text-xs font-semibold text-white/60">{num}</div>
      <div className="mt-2 text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/70">{desc}</div>
    </div>
  );
}

function PriceCard({
  name,
  price,
  lifetime,
  bullets,
  ctaHref,
  ctaText,
  highlight,
}: {
  name: string;
  price: string;
  lifetime: string;
  bullets: string[];
  ctaHref: string;
  ctaText: string;
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
          <div className="text-sm text-white/70">Tier</div>
          <div className="text-xl font-extrabold">{name}</div>
        </div>
        {highlight ? (
          <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/80">
            Popular
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-extrabold">{price}</div>
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

      <Link
        href={ctaHref}
        className={[
          "mt-6 inline-flex w-full justify-center rounded-xl px-4 py-2 text-sm font-semibold",
          highlight
            ? "bg-white text-black hover:bg-white/90"
            : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
        ].join(" ")}
      >
        {ctaText}
      </Link>
    </div>
  );
}

function FAQPreview({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-sm font-semibold">{q}</div>
      <div className="mt-2 text-sm text-white/70">{a}</div>
    </div>
  );
}
