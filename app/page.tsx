import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export const metadata = {
  title: "TruthRadeo • Chicago Stage",
  description:
    "Stage 1 Chicago: Revenue Architecture Engine for music creators. Snapshot → Diagnostic → Offer → Assets → Iterate.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <GraffitiBackdrop />

      {/* Top bar */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-2 text-xs text-white/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              <span className="font-semibold text-white/80">Stage 1</span>
              <span className="text-white/40">•</span>
              <span>Chicago</span>
            </span>
            <span className="text-white/60">
              Snapshot live • Diagnostic + Offer + Assets next
            </span>
          </div>
          <div className="hidden text-white/50 md:block">
            TruthRadeo • Letting Music Soar
          </div>
        </div>
      </div>

      {/* Sticky Nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <div className="absolute inset-0 animate-[tr_pulse_3s_ease-in-out_infinite] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
            <div className="leading-tight">
              <div className="text-xs tracking-wide text-white/60">
                TruthRadeo
              </div>
              <div className="text-base font-extrabold tracking-tight">
                Chicago Stage
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a href="#vibe" className="hover:text-white">
              Vibe
            </a>
            <a href="#deliverables" className="hover:text-white">
              What you get
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white">
              FAQ
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
                className="hidden rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 md:inline-flex"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* HERO (Graffiti Poster) */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-10 md:pt-14">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/35 p-6 md:p-10">
          {/* neon border anim */}
          <div className="pointer-events-none absolute inset-0 rounded-[2.25rem] opacity-70 [background:conic-gradient(from_180deg_at_50%_50%,rgba(255,0,122,0.35),rgba(0,229,255,0.35),rgba(255,214,0,0.35),rgba(255,0,122,0.35))] animate-[tr_spin_10s_linear_infinite]" />
          <div className="pointer-events-none absolute inset-[2px] rounded-[2.15rem] bg-neutral-950/90" />

          {/* content layer */}
          <div className="relative grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <Tag color="pink">STAGE 1</Tag>
                <Tag color="cyan">CHICAGO</Tag>
                <Tag color="yellow">REVENUE ENGINE</Tag>
                <span className="ml-1 inline-flex items-center gap-2 text-xs text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                  for creators who actually want to get paid
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
                <span className="inline-block animate-[tr_float_6s_ease-in-out_infinite]">
                  Graffiti-level clarity
                </span>{" "}
                for your music revenue.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
                Chicago Stage doesn’t stream your music. It turns your current
                creator reality into a structured plan and generates launch-ready
                assets: offer copy, DM/email scripts, timeline, and a simple
                forecast.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <GraffitiPrimary>Start Chicago Stage</GraffitiPrimary>
                  </SignUpButton>

                  <SignInButton mode="modal">
                    <GraffitiSecondary>Sign in</GraffitiSecondary>
                  </SignInButton>

                  <Link href="/pricing">
                    <GraffitiGhost>See Pricing</GraffitiGhost>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard">
                    <GraffitiPrimary>Open Dashboard</GraffitiPrimary>
                  </Link>
                  <Link href="/pricing">
                    <GraffitiSecondary>Pricing</GraffitiSecondary>
                  </Link>
                  <Link href="/faq">
                    <GraffitiGhost>FAQ</GraffitiGhost>
                  </Link>
                </SignedIn>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                <HoloStat
                  label="Time to value"
                  value="5–15 min"
                  sub="Snapshot starts now"
                  accent="cyan"
                />
                <HoloStat
                  label="Output"
                  value="Blueprint + Assets"
                  sub="copy + scripts + plan"
                  accent="pink"
                />
                <HoloStat
                  label="Scope"
                  value="Stage 1 only"
                  sub="foundation first"
                  accent="yellow"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
                <Pill>Artists</Pill>
                <Pill>Producers</Pill>
                <Pill>DJs</Pill>
                <Pill>Bookings</Pill>
                <Pill>Merch</Pill>
                <Pill>Features</Pill>
                <Pill>Brand deals</Pill>
              </div>
            </div>

            {/* right poster / “spray” panel */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.35),transparent_60%)] blur-2xl" />
                <div className="pointer-events-none absolute -right-16 bottom-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,0,122,0.35),transparent_60%)] blur-2xl" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/60">Tonight’s drop</div>
                    <div className="mt-1 text-xl font-extrabold tracking-tight">
                      Creator Snapshot
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      Capture signal → Diagnostic → Offer → Assets.
                    </div>
                  </div>
                  <div className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
                    v1 live
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <SprayRow
                    title="Snapshot"
                    desc="identity • links • audience • revenue"
                    accent="cyan"
                  />
                  <SprayRow
                    title="Diagnostic"
                    desc="leaks • priorities • risk/impact"
                    accent="pink"
                  />
                  <SprayRow
                    title="Offer Architect"
                    desc="offer ladder • pricing • value"
                    accent="yellow"
                  />
                  <SprayRow
                    title="Execution Assets"
                    desc="copy • scripts • timeline"
                    accent="cyan"
                  />
                  <SprayRow
                    title="Iteration Plan"
                    desc="log results • adjust"
                    accent="pink"
                  />
                </div>

                <div className="mt-6">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90">
                        Claim your Chicago Stage
                      </button>
                    </SignUpButton>
                    <div className="mt-2 text-center text-xs text-white/50">
                      no streaming • no gimmicks • just execution
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="block w-full rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
                    >
                      Continue in Dashboard
                    </Link>
                    <div className="mt-2 text-center text-xs text-white/50">
                      your snapshot is saved
                    </div>
                  </SignedIn>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Sticker
                  title="Street-to-stage"
                  desc="Built for creators who move."
                  accent="cyan"
                />
                <Sticker
                  title="Assets, not advice"
                  desc="Copy/paste execution."
                  accent="pink"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIBE SECTION */}
      <section id="vibe" className="mx-auto w-full max-w-6xl px-6 py-12">
        <SectionTitle
          kicker="THE VIBE"
          title="Feels like a mixtape cover. Works like a manager."
          subtitle="Bright visuals for creators — but the output is serious business execution."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-white/10 bg-black/35 p-7">
              <div className="grid gap-4 md:grid-cols-2">
                <VibeCard
                  title="Chicago = Revenue Architecture"
                  desc="Stage 1 builds monetization foundation first."
                  accent="yellow"
                />
                <VibeCard
                  title="No streaming dependency"
                  desc="Works without Spotify/YouTube API integrations."
                  accent="cyan"
                />
                <VibeCard
                  title="Offer clarity"
                  desc="What to sell, how to price, and how to pitch."
                  accent="pink"
                />
                <VibeCard
                  title="Execution-first"
                  desc="Scripts + timeline + forecast targets."
                  accent="cyan"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-xs text-white/60">Creator reactions</div>
              <div className="mt-3 grid gap-3">
                <Quote
                  who="Independent artist"
                  text="“I stopped guessing. Chicago made my offer obvious.”"
                  accent="pink"
                />
                <Quote
                  who="Producer"
                  text="“Pricing ladder alone saved me from undercharging.”"
                  accent="yellow"
                />
                <Quote
                  who="DJ / events"
                  text="“Booking scripts paid for this fast.”"
                  accent="cyan"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                <span className="font-semibold text-white/80">
                  Stage 1 goal:
                </span>{" "}
                make monetization predictable before anything else.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section
        id="deliverables"
        className="mx-auto w-full max-w-6xl px-6 pb-14"
      >
        <SectionTitle
          kicker="WHAT YOU GET"
          title="Tangible outputs creators will pay for."
          subtitle="A blueprint plus assets you can deploy immediately."
        />

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/35 p-7">
          <div className="grid gap-4 md:grid-cols-3">
            <Deliverable
              title="Snapshot Summary"
              desc="Your signal packaged cleanly."
              accent="cyan"
            />
            <Deliverable
              title="Revenue Diagnostic"
              desc="Leaks + priorities + ranking."
              accent="pink"
            />
            <Deliverable
              title="Offer Ladder + Pricing"
              desc="What you sell + how it stacks."
              accent="yellow"
            />
            <Deliverable
              title="Offer Page Copy"
              desc="Headlines, bullets, proof angles."
              accent="pink"
            />
            <Deliverable
              title="DM/Email Scripts"
              desc="Booking + collabs + sales."
              accent="cyan"
            />
            <Deliverable
              title="Launch Timeline"
              desc="7–30 day rollout plan."
              accent="yellow"
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <GraffitiPrimary>Start Snapshot</GraffitiPrimary>
              </SignUpButton>
              <Link href="/pricing">
                <GraffitiSecondary>Compare tiers</GraffitiSecondary>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <GraffitiPrimary>Open Snapshot</GraffitiPrimary>
              </Link>
              <Link href="/pricing">
                <GraffitiSecondary>Compare tiers</GraffitiSecondary>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="HOW IT WORKS"
          title="A loop that turns chaos into execution."
          subtitle="Snapshot → Diagnostic → Offer → Assets → Iterate."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <Step n="01" title="Snapshot" desc="Capture your current signal." />
          <Step n="02" title="Diagnostic" desc="Find leaks + priorities." />
          <Step n="03" title="Offer" desc="Design your money move." />
          <Step n="04" title="Assets" desc="Scripts + copy + timeline." />
          <Step n="05" title="Iterate" desc="Adjust after results." />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="PRICING"
          title="Three tiers. One Chicago mission."
          subtitle="Start where you are — upgrade when you want deeper diagnostics + assets."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Tier
            name="South Loop"
            price="$29/mo"
            lifetime="$149 lifetime"
            tag="Foundation"
            accent="cyan"
            bullets={[
              "Snapshot + basic diagnostic",
              "Core offer outline",
              "Basic execution checklist",
              "Quarterly iteration plan",
            ]}
          />
          <Tier
            name="River North"
            price="$59/mo"
            lifetime="$349 lifetime"
            tag="Momentum"
            accent="pink"
            highlight
            bullets={[
              "Advanced diagnostic + priorities",
              "Offer ladder + pricing ladder",
              "DM/email scripts",
              "Launch timeline + 60-day planner",
              "Basic forecast targets",
            ]}
          />
          <Tier
            name="The Loop"
            price="$119/mo"
            lifetime="$799 lifetime"
            tag="Scaling"
            accent="yellow"
            bullets={[
              "Multi-offer ecosystem planning",
              "Advanced modeling structure",
              "Launch calendar cadence",
              "Quarterly review framework",
              "Best for serious scaling",
            ]}
          />
        </div>

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          “Lifetime” applies to <span className="font-semibold text-white/80">Stage 1 (Chicago)</span> access. Future stages are separate.
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionTitle
          kicker="FAQ"
          title="Clear scope. No confusion."
          subtitle="Chicago Stage is a revenue engine — not streaming, not discovery."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Accordion
            q="Is TruthRadeo a streaming platform?"
            a="No. Chicago Stage does not host music or promise algorithm growth. It builds a revenue blueprint + assets."
          />
          <Accordion
            q="What happens after I sign up?"
            a="You start with the Creator Snapshot in the dashboard. Then Chicago runs Diagnostic → Offer → Assets."
          />
          <Accordion
            q="Do I need Spotify/YouTube APIs connected?"
            a="No. You can paste links, but Chicago doesn’t require external APIs to function."
          />
          <Accordion
            q="What does “lifetime” mean?"
            a="Lifetime applies to Stage 1 (Chicago). Future stages are separate."
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-black/35 p-6">
          <div>
            <div className="text-sm font-semibold">Ready?</div>
            <div className="mt-1 text-sm text-white/70">
              Do the Snapshot. Get the blueprint. Deploy the assets.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <GraffitiPrimary>Start Chicago Stage</GraffitiPrimary>
              </SignUpButton>
              <Link href="/pricing">
                <GraffitiSecondary>Pricing</GraffitiSecondary>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <GraffitiPrimary>Open dashboard</GraffitiPrimary>
              </Link>
              <Link href="/pricing">
                <GraffitiSecondary>Pricing</GraffitiSecondary>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* -------------------- Backdrop + Components -------------------- */

function GraffitiBackdrop() {
  return (
    <>
      {/* Neon haze */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_60%_at_20%_20%,rgba(0,229,255,0.20),transparent_60%),radial-gradient(60%_60%_at_80%_15%,rgba(255,0,122,0.20),transparent_55%),radial-gradient(70%_70%_at_50%_85%,rgba(255,214,0,0.15),transparent_60%)]" />
      {/* Grain */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:3px_3px]" />
      {/* Subtle grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
    </>
  );
}

function SectionTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
        <span className="font-semibold text-white/80">{kicker}</span>
        <span className="text-white/30">•</span>
        <span>Chicago</span>
      </div>
      <h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function Tag({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "pink" | "cyan" | "yellow";
}) {
  const map: Record<typeof color, string> = {
    pink: "border-white/15 bg-[linear-gradient(90deg,rgba(255,0,122,0.35),rgba(255,255,255,0.05))]",
    cyan: "border-white/15 bg-[linear-gradient(90deg,rgba(0,229,255,0.35),rgba(255,255,255,0.05))]",
    yellow:
      "border-white/15 bg-[linear-gradient(90deg,rgba(255,214,0,0.30),rgba(255,255,255,0.05))]",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-wide text-white/90",
        map[color],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1">
      {children}
    </span>
  );
}

function GraffitiPrimary({ children }: { children: React.ReactNode }) {
  return (
    <button className="relative overflow-hidden rounded-2xl px-5 py-3 text-sm font-extrabold text-black">
      <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,229,255,1),rgba(255,214,0,1),rgba(255,0,122,1))] animate-[tr_shift_6s_linear_infinite]" />
      <span className="absolute inset-[2px] rounded-2xl bg-white" />
      <span className="relative">{children}</span>
    </button>
  );
}

function GraffitiSecondary({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10">
      {children}
    </button>
  );
}

function GraffitiGhost({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-sm text-white/80 hover:bg-black/50">
      {children}
    </button>
  );
}

function HoloStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "pink" | "cyan" | "yellow";
}) {
  const glow =
    accent === "cyan"
      ? "bg-[radial-gradient(circle_at_30%_30%,rgba(0,229,255,0.30),transparent_60%)]"
      : accent === "pink"
      ? "bg-[radial-gradient(circle_at_30%_30%,rgba(255,0,122,0.28),transparent_60%)]"
      : "bg-[radial-gradient(circle_at_30%_30%,rgba(255,214,0,0.22),transparent_60%)]";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className={`pointer-events-none absolute inset-0 ${glow} opacity-80`} />
      <div className="relative">
        <div className="text-xs text-white/60">{label}</div>
        <div className="mt-1 text-lg font-black">{value}</div>
        <div className="mt-1 text-xs text-white/50">{sub}</div>
      </div>
    </div>
  );
}

function SprayRow({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: "pink" | "cyan" | "yellow";
}) {
  const dot =
    accent === "cyan"
      ? "bg-[rgba(0,229,255,0.9)]"
      : accent === "pink"
      ? "bg-[rgba(255,0,122,0.9)]"
      : "bg-[rgba(255,214,0,0.9)]";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-black/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="mt-1 text-xs text-white/60">{desc}</div>
        </div>
        <div className={`mt-1 h-3 w-3 rounded-full ${dot}`} />
      </div>
    </div>
  );
}

function Sticker({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: "pink" | "cyan" | "yellow";
}) {
  const bg =
    accent === "cyan"
      ? "bg-[linear-gradient(135deg,rgba(0,229,255,0.18),rgba(255,255,255,0.04))]"
      : accent === "pink"
      ? "bg-[linear-gradient(135deg,rgba(255,0,122,0.18),rgba(255,255,255,0.04))]"
      : "bg-[linear-gradient(135deg,rgba(255,214,0,0.16),rgba(255,255,255,0.04))]";

  return (
    <div
      className={[
        "rounded-[1.75rem] border border-white/10 p-4",
        bg,
        "rotate-[-1deg] hover:rotate-[0deg] transition-transform",
      ].join(" ")}
    >
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-xs text-white/65">{desc}</div>
    </div>
  );
}

function VibeCard({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: "pink" | "cyan" | "yellow";
}) {
  const bar =
    accent === "cyan"
      ? "bg-[rgba(0,229,255,0.8)]"
      : accent === "pink"
      ? "bg-[rgba(255,0,122,0.8)]"
      : "bg-[rgba(255,214,0,0.8)]";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
      <div className="pl-2">
        <div className="text-sm font-extrabold">{title}</div>
        <div className="mt-1 text-sm text-white/70">{desc}</div>
      </div>
    </div>
  );
}

function Quote({
  who,
  text,
  accent,
}: {
  who: string;
  text: string;
  accent: "pink" | "cyan" | "yellow";
}) {
  const glow =
    accent === "cyan"
      ? "bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.18),transparent_65%)]"
      : accent === "pink"
      ? "bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,122,0.18),transparent_65%)]"
      : "bg-[radial-gradient(circle_at_20%_20%,rgba(255,214,0,0.16),transparent_65%)]";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className={`pointer-events-none absolute inset-0 ${glow}`} />
      <div className="relative">
        <div className="text-xs text-white/60">{who}</div>
        <div className="mt-1 text-sm text-white/75">{text}</div>
      </div>
    </div>
  );
}

function Deliverable({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: "pink" | "cyan" | "yellow";
}) {
  const dot =
    accent === "cyan"
      ? "bg-[rgba(0,229,255,0.9)]"
      : accent === "pink"
      ? "bg-[rgba(255,0,122,0.9)]"
      : "bg-[rgba(255,214,0,0.9)]";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="mt-1 text-sm text-white/70">{desc}</div>
        </div>
        <div className={`mt-1 h-3 w-3 rounded-full ${dot}`} />
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5 hover:bg-black/45">
      <div className="text-xs font-extrabold text-white/60">{n}</div>
      <div className="mt-2 text-base font-extrabold">{title}</div>
      <div className="mt-1 text-sm text-white/70">{desc}</div>
    </div>
  );
}

function Tier({
  name,
  price,
  lifetime,
  tag,
  bullets,
  accent,
  highlight,
}: {
  name: string;
  price: string;
  lifetime: string;
  tag: string;
  bullets: string[];
  accent: "pink" | "cyan" | "yellow";
  highlight?: boolean;
}) {
  const glow =
    accent === "cyan"
      ? "bg-[radial-gradient(circle_at_20%_20%,rgba(0,229,255,0.18),transparent_60%)]"
      : accent === "pink"
      ? "bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,122,0.18),transparent_60%)]"
      : "bg-[radial-gradient(circle_at_20%_20%,rgba(255,214,0,0.16),transparent_60%)]";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] border p-6",
        highlight
          ? "border-white/25 bg-white/5"
          : "border-white/10 bg-black/35",
      ].join(" ")}
    >
      <div className={`pointer-events-none absolute inset-0 ${glow}`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Tier</div>
            <div className="text-xl font-black">{name}</div>
          </div>
          <div className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
            {tag}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl font-black">{price}</div>
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
          href="/pricing"
          className={[
            "mt-6 inline-flex w-full justify-center rounded-2xl px-4 py-2 text-sm font-extrabold",
            highlight
              ? "bg-white text-black hover:bg-white/90"
              : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
          ].join(" ")}
        >
          View full pricing
        </Link>
      </div>
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 open:bg-white/10">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div className="text-base font-extrabold">{q}</div>
          <div className="mt-1 text-white/50 transition-transform group-open:rotate-45">
            +
          </div>
        </div>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-white/70">{a}</div>
    </details>
  );
}

function Footer() {
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
