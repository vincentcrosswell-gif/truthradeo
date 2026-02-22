import type React from "react";
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
    "TruthRadeo Stage 1 (Chicago): turn your current creator reality into an offer + scripts + rollout plan + iteration loop.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Backdrop />

      {/* Top strip */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2 text-xs text-white/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-[rgba(0,229,255,0.9)]" />
              <span className="font-extrabold text-white/85">LIVE</span>
              <span className="text-white/35">•</span>
              <span className="font-semibold text-white/70">Stage 1</span>
              <span className="text-white/35">•</span>
              <span className="text-white/70">Chicago</span>
            </span>
            <span className="text-white/60">
              built for artists trying to get paid this month
            </span>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              no streaming
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              no gimmicks
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              assets you can deploy
            </span>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <div className="absolute inset-0 animate-[tr_pulse_3s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,122,0.35),transparent_55%),radial-gradient(circle_at_80%_60%,rgba(0,229,255,0.30),transparent_55%),radial-gradient(circle_at_55%_90%,rgba(255,214,0,0.22),transparent_55%)]" />
              <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] tracking-wide text-white/55">
                TruthRadeo
              </div>
              <div className="text-base font-black tracking-tight">
                Chicago Stage
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <a className="hover:text-white" href="#pain">
              Money pain
            </a>
            <a className="hover:text-white" href="#what">
              What you get
            </a>
            <a className="hover:text-white" href="#loop">
              The loop
            </a>
            <a className="hover:text-white" href="#pricing">
              Pricing
            </a>
            <a className="hover:text-white" href="#faq">
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
                <button className="tr-sheen rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-black hover:bg-white/90">
                  Start free
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

      {/* HERO */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-10 md:pt-14">
        <div className="tr-noise relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/35">
          {/* animated border */}
          <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-70 [background:conic-gradient(from_180deg_at_50%_50%,rgba(255,0,122,0.35),rgba(0,229,255,0.35),rgba(255,214,0,0.35),rgba(255,0,122,0.35))] animate-[tr_spin_12s_linear_infinite]" />
          <div className="pointer-events-none absolute inset-[2px] rounded-[2.35rem] bg-neutral-950/90" />

          <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <Tag tone="pink">STAGE 1</Tag>
                <Tag tone="cyan">CHICAGO</Tag>
                <Tag tone="yellow">GET PAID ENGINE</Tag>
                <span className="ml-1 inline-flex items-center gap-2 text-xs text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  for artists, producers, DJs, managers
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
                <span className="tr-graffiti inline-block animate-[tr_wobble_5s_ease-in-out_infinite]">
                  Stop starving
                </span>
                <span className="text-white/80">.</span>
                <br />
                Turn your music into a
                <span className="relative ml-2 inline-block">
                  <span className="absolute -inset-2 -z-10 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,214,0,0.22),transparent_60%),radial-gradient(circle_at_80%_60%,rgba(0,229,255,0.20),transparent_55%),radial-gradient(circle_at_55%_90%,rgba(255,0,122,0.18),transparent_55%)]" />
                  <span className="tr-graffiti">money move</span>
                </span>
                .
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
                TruthRadeo doesn’t promise algorithm magic. Chicago Stage turns
                what you already have (skills, vibe, audience, time) into:
                <span className="font-semibold text-white/85">
                  {" "}a sellable offer + pricing + scripts + rollout plan
                </span>
                — then gives you an iteration loop to improve it.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <PrimaryCTA>Build my revenue plan</PrimaryCTA>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <SecondaryCTA>Sign in</SecondaryCTA>
                  </SignInButton>
                  <Link href="/pricing">
                    <GhostCTA>See pricing</GhostCTA>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <PrimaryCTA>Open dashboard</PrimaryCTA>
                  </Link>
                  <Link href="/dashboard">
                    <SecondaryCTA>Start Snapshot</SecondaryCTA>
                  </Link>
                  <Link href="/pricing">
                    <GhostCTA>Pricing</GhostCTA>
                  </Link>
                </SignedIn>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                <HoloStat
                  label="Time to value"
                  value="5–15 min"
                  sub="Snapshot → plan"
                  accent="cyan"
                />
                <HoloStat
                  label="You leave with"
                  value="Copy + scripts"
                  sub="DMs, emails, pitch"
                  accent="pink"
                />
                <HoloStat
                  label="Outcome"
                  value="A money lane"
                  sub="offer + rollout"
                  accent="yellow"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
                <Chip>booking scripts</Chip>
                <Chip>merch offer</Chip>
                <Chip>features</Chip>
                <Chip>beats / packs</Chip>
                <Chip>studio sessions</Chip>
                <Chip>content → funnel</Chip>
                <Chip>brand collabs</Chip>
              </div>
            </div>

            {/* right panel */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="pointer-events-none absolute -left-20 top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.33),transparent_60%)] blur-2xl" />
                <div className="pointer-events-none absolute -right-20 bottom-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,0,122,0.30),transparent_60%)] blur-2xl" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/60">
                      Chicago output stack
                    </div>
                    <div className="mt-1 text-xl font-extrabold tracking-tight">
                      Snapshot → Cash Plan
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      You don’t leave with motivation. You leave with assets.
                    </div>
                  </div>
                  <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
                    v1
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  <SprayRow
                    title="Revenue Diagnostic"
                    desc="where you’re leaking money + what to fix first"
                    accent="pink"
                  />
                  <SprayRow
                    title="Offer Architect"
                    desc="what to sell + pricing ladder + value stack"
                    accent="yellow"
                  />
                  <SprayRow
                    title="Execution Assets"
                    desc="offer page copy + DMs + email launch sequence"
                    accent="cyan"
                  />
                  <SprayRow
                    title="30-day plan"
                    desc="weekly actions + a clean rollout calendar"
                    accent="pink"
                  />
                  <SprayRow
                    title="Iteration Loop"
                    desc="log results, improve, repeat"
                    accent="yellow"
                  />
                </div>

                <div className="mt-6">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="tr-sheen w-full rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black hover:bg-white/90">
                        Start the Snapshot (free)
                      </button>
                    </SignUpButton>
                    <div className="mt-2 text-center text-xs text-white/50">
                      no streaming • no b.s. • just execution
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="block w-full rounded-2xl bg-white px-4 py-3 text-center text-sm font-extrabold text-black hover:bg-white/90"
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
                  title="Street energy"
                  desc="youthful vibe, serious output"
                  accent="cyan"
                />
                <Sticker
                  title="Money clarity"
                  desc="pricing + scripts + plan"
                  accent="pink"
                />
              </div>
            </div>
          </div>

          {/* moving ticker */}
          <div className="border-t border-white/10 bg-black/40">
            <div className="relative overflow-hidden py-3">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/80 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/80 to-transparent" />
              <div className="flex gap-6 whitespace-nowrap text-sm text-white/70">
                <div className="tr-marquee flex min-w-[200%] items-center gap-6">
                  <TickerItem>"I need rent money." → offer + scripts</TickerItem>
                  <TickerItem>"My streams don’t pay." → direct revenue lanes</TickerItem>
                  <TickerItem>"I hate selling." → DMs + emails done for you</TickerItem>
                  <TickerItem>"I’m undercharging." → pricing ladder</TickerItem>
                  <TickerItem>"I’m stuck." → weekly action plan</TickerItem>
                  <TickerItem>"I need rent money." → offer + scripts</TickerItem>
                  <TickerItem>"My streams don’t pay." → direct revenue lanes</TickerItem>
                  <TickerItem>"I hate selling." → DMs + emails done for you</TickerItem>
                  <TickerItem>"I’m undercharging." → pricing ladder</TickerItem>
                  <TickerItem>"I’m stuck." → weekly action plan</TickerItem>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MONEY PAIN */}
      <section id="pain" className="mx-auto w-full max-w-6xl px-6 py-12">
        <SectionTitle
          kicker="THE PROBLEM"
          title="Talent is common. Rent is not forgiving."
          subtitle="Most creators aren’t failing because the music is bad. They’re failing because the money path is vague."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-white/10 bg-black/35 p-7">
              <div className="grid gap-4 md:grid-cols-2">
                <PainCard
                  title="Streaming ≠ income"
                  desc="You can have plays and still be broke. Chicago builds direct revenue moves."
                  accent="cyan"
                />
                <PainCard
                  title="No offer = no money"
                  desc="If you can’t say what you sell in one sentence, you’re losing time and cash."
                  accent="pink"
                />
                <PainCard
                  title="Undercharging"
                  desc="Most artists price from fear. Chicago gives a pricing ladder that fits your reality."
                  accent="yellow"
                />
                <PainCard
                  title="Chaos execution"
                  desc="Posting randomly is a strategy for burnout. Chicago gives a weekly plan you can follow."
                  accent="pink"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs text-white/60">TruthRadeo promise</div>
                <div className="mt-2 text-sm text-white/75">
                  We don’t make you famous. We make your music operation
                  <span className="font-semibold text-white/85"> sellable</span>.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="tr-noise relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,214,0,0.22),transparent_60%)] blur-2xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.18),transparent_60%)] blur-2xl" />

              <div className="text-xs text-white/60">What Chicago feels like</div>
              <div className="mt-3 grid gap-3">
                <Quote
                  who="Independent artist"
                  text="“I finally had something to sell that didn’t feel cringe.”"
                  accent="pink"
                />
                <Quote
                  who="Producer"
                  text="“Pricing ladder stopped me from undercharging.”"
                  accent="yellow"
                />
                <Quote
                  who="DJ / events"
                  text="“The booking scripts paid for this fast.”"
                  accent="cyan"
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <PrimaryCTA>Start the Snapshot</PrimaryCTA>
                  </SignUpButton>
                  <Link href="/pricing">
                    <SecondaryCTA>Compare tiers</SecondaryCTA>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <PrimaryCTA>Open Snapshot</PrimaryCTA>
                  </Link>
                  <Link href="/pricing">
                    <SecondaryCTA>Compare tiers</SecondaryCTA>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section id="what" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="WHAT YOU GET"
          title="A blueprint plus assets you can copy/paste."
          subtitle="Not advice. Not theory. You leave with deliverables."
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
              title="Offer Ladder"
              desc="What you sell + how it stacks."
              accent="yellow"
            />
            <Deliverable
              title="Offer Page Copy"
              desc="Headlines, bullets, proof angles."
              accent="pink"
            />
            <Deliverable
              title="DM + Email Scripts"
              desc="Booking, collabs, sales."
              accent="cyan"
            />
            <Deliverable
              title="30-day Rollout"
              desc="Weekly actions + clean cadence."
              accent="yellow"
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <PrimaryCTA>Generate my assets</PrimaryCTA>
              </SignUpButton>
              <Link href="/pricing">
                <SecondaryCTA>See tiers</SecondaryCTA>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <PrimaryCTA>Open Snapshot</PrimaryCTA>
              </Link>
              <Link href="/pricing">
                <SecondaryCTA>See tiers</SecondaryCTA>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* LOOP */}
      <section id="loop" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="THE LOOP"
          title="A system that turns chaos into income."
          subtitle="Snapshot → Diagnostic → Offer → Assets → Iterate."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <Step n="01" title="Snapshot" desc="Capture your reality." />
          <Step n="02" title="Diagnostic" desc="Find the money leak." />
          <Step n="03" title="Offer" desc="Choose your lane." />
          <Step n="04" title="Assets" desc="Get scripts + copy." />
          <Step n="05" title="Iterate" desc="Improve after results." />
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="PRICING"
          title="Three tiers. One goal: get you paid."
          subtitle="Start where you are — upgrade when you want deeper diagnostics + more assets."
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
              "30–60 day rollout plan",
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
          “Lifetime” applies to{" "}
          <span className="font-semibold text-white/80">Stage 1 (Chicago)</span>{" "}
          access. Future stages are separate.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <SignedOut>
            <SignUpButton mode="modal">
              <PrimaryCTA>Start now</PrimaryCTA>
            </SignUpButton>
            <Link href="/pricing">
              <SecondaryCTA>View pricing page</SecondaryCTA>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <PrimaryCTA>Open dashboard</PrimaryCTA>
            </Link>
            <Link href="/pricing">
              <SecondaryCTA>Manage plan</SecondaryCTA>
            </Link>
          </SignedIn>
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
                <PrimaryCTA>Start Chicago Stage</PrimaryCTA>
              </SignUpButton>
              <Link href="/pricing">
                <SecondaryCTA>Pricing</SecondaryCTA>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <PrimaryCTA>Open dashboard</PrimaryCTA>
              </Link>
              <Link href="/pricing">
                <SecondaryCTA>Pricing</SecondaryCTA>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* -------------------- Backdrop + UI bits -------------------- */

function Backdrop() {
  return (
    <>
      {/* neon haze */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_60%_at_18%_18%,rgba(0,229,255,0.20),transparent_60%),radial-gradient(60%_60%_at_80%_15%,rgba(255,0,122,0.20),transparent_55%),radial-gradient(70%_70%_at_50%_85%,rgba(255,214,0,0.15),transparent_60%)]" />
      {/* faint graffiti strokes */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.08] [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_14px)]" />
      {/* soft grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:74px_74px]" />
      {/* flicker vignette */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 animate-[tr_flicker_6s_linear_infinite] [background:radial-gradient(circle_at_50%_15%,transparent_0%,rgba(0,0,0,0.35)_40%,rgba(0,0,0,0.75)_100%)]" />
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
        <span className="font-extrabold text-white/80">{kicker}</span>
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
  tone,
}: {
  children: React.ReactNode;
  tone: "pink" | "cyan" | "yellow";
}) {
  const map: Record<typeof tone, string> = {
    pink: "border-white/15 bg-[linear-gradient(90deg,rgba(255,0,122,0.38),rgba(255,255,255,0.05))]",
    cyan: "border-white/15 bg-[linear-gradient(90deg,rgba(0,229,255,0.36),rgba(255,255,255,0.05))]",
    yellow:
      "border-white/15 bg-[linear-gradient(90deg,rgba(255,214,0,0.30),rgba(255,255,255,0.05))]",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-wide text-white/90",
        map[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1">
      {children}
    </span>
  );
}

function PrimaryCTA({ children }: { children: React.ReactNode }) {
  return (
    <button className="relative overflow-hidden rounded-2xl px-5 py-3 text-sm font-extrabold text-black">
      <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,229,255,1),rgba(255,214,0,1),rgba(255,0,122,1))] animate-[tr_shift_7s_linear_infinite]" />
      <span className="absolute inset-[2px] rounded-2xl bg-white" />
      <span className="relative">{children}</span>
    </button>
  );
}

function SecondaryCTA({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10">
      {children}
    </button>
  );
}

function GhostCTA({ children }: { children: React.ReactNode }) {
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
          <div className="text-sm font-extrabold">{title}</div>
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
        "animate-[tr_float_7s_ease-in-out_infinite]",
      ].join(" ")}
    >
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-xs text-white/65">{desc}</div>
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

function PainCard({
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
      ? "bg-[rgba(0,229,255,0.85)]"
      : accent === "pink"
      ? "bg-[rgba(255,0,122,0.85)]"
      : "bg-[rgba(255,214,0,0.85)]";

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

function Deliverable({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: "pink" | "cyan" | "yellow";
}) {
  const glow =
    accent === "cyan"
      ? "bg-[radial-gradient(circle_at_25%_15%,rgba(0,229,255,0.16),transparent_60%)]"
      : accent === "pink"
      ? "bg-[radial-gradient(circle_at_25%_15%,rgba(255,0,122,0.16),transparent_60%)]"
      : "bg-[radial-gradient(circle_at_25%_15%,rgba(255,214,0,0.14),transparent_60%)]";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className={`pointer-events-none absolute inset-0 ${glow}`} />
      <div className="relative">
        <div className="text-sm font-extrabold">{title}</div>
        <div className="mt-1 text-sm text-white/70">{desc}</div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="tr-noise relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs font-extrabold text-white/60">{n}</div>
      <div className="mt-2 text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-sm text-white/70">{desc}</div>
    </div>
  );
}

function Tier({
  name,
  price,
  lifetime,
  tag,
  accent,
  bullets,
  highlight,
}: {
  name: string;
  price: string;
  lifetime: string;
  tag: string;
  accent: "pink" | "cyan" | "yellow";
  bullets: string[];
  highlight?: boolean;
}) {
  const glow =
    accent === "cyan"
      ? "bg-[radial-gradient(circle_at_30%_15%,rgba(0,229,255,0.20),transparent_65%)]"
      : accent === "pink"
      ? "bg-[radial-gradient(circle_at_30%_15%,rgba(255,0,122,0.20),transparent_65%)]"
      : "bg-[radial-gradient(circle_at_30%_15%,rgba(255,214,0,0.18),transparent_65%)]";

  const ring = highlight
    ? "ring-2 ring-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_20px_70px_-20px_rgba(255,0,122,0.35)]"
    : "";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-7",
        ring,
      ].join(" ")}
    >
      <div className={`pointer-events-none absolute inset-0 ${glow}`} />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold">{name}</div>
            <div className="mt-1 text-3xl font-black tracking-tight">
              {price}
            </div>
            <div className="mt-1 text-sm text-white/60">{lifetime}</div>
          </div>
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
            {tag}
          </span>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-white/75">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2 w-2 flex-none rounded-full bg-white/70" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <SignedOut>
            <SignUpButton mode="modal">
              <PrimaryCTA>Start</PrimaryCTA>
            </SignUpButton>
            <Link href="/pricing">
              <SecondaryCTA>Details</SecondaryCTA>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/pricing">
              <PrimaryCTA>Choose plan</PrimaryCTA>
            </Link>
            <Link href="/dashboard">
              <SecondaryCTA>Dashboard</SecondaryCTA>
            </Link>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/5 p-5">
      <summary className="cursor-pointer list-none text-sm font-extrabold text-white/85">
        <span className="flex items-center justify-between gap-3">
          {q}
          <span className="rounded-full border border-white/10 bg-black/40 px-2 py-1 text-xs text-white/60 group-open:rotate-180 transition-transform">
            ▾
          </span>
        </span>
      </summary>
      <div className="mt-3 text-sm text-white/70">{a}</div>
    </details>
  );
}

function TickerItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="h-2 w-2 rounded-full bg-white/60" />
      <span className="text-white/70">{children}</span>
    </span>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/35">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="text-sm font-extrabold">TruthRadeo</div>
          <p className="mt-2 max-w-md text-sm text-white/70">
            Chicago Stage is a revenue architecture engine for music creators.
            Snapshot → Diagnostic → Offer → Assets → Iterate.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Stage 1: Chicago
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              no streaming
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              execution assets
            </span>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <FooterLink href="/pricing" title="Pricing" desc="Tiers + billing" />
            <FooterLink href="/faq" title="FAQ" desc="What this is / isn’t" />
            <FooterLink
              href="/dashboard"
              title="Dashboard"
              desc="Your Snapshot + tools"
            />
            <FooterLink href="/" title="Chicago" desc="Stage 1 landing" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
            <span>© {new Date().getFullYear()} TruthRadeo</span>
            <span className="font-mono text-[11px] text-white/45">
              built in Next.js • deployed on Vercel
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="tr-sheen block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
    >
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-sm text-white/70">{desc}</div>
    </Link>
  );
}