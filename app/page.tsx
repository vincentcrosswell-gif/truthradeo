import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export const metadata = {
  title: "TruthRadeo • Stage 1 Chicago",
  description:
    "Chicago Stage is a revenue architecture engine for creators. Snapshot → Diagnostic → Offer → Assets → Iterate.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <BackgroundFX />

      <TopAnnouncement />

      <StickyHeader />

      {/* HERO */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/12 via-white/8 to-white/5 p-6 md:p-12">
          <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Tape>STAGE 1</Tape>
                <Tape variant="alt">CHICAGO</Tape>
                <Tape variant="thin">REVENUE ARCHITECTURE</Tape>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">
                Build a revenue blueprint for your music —{" "}
                <span className="text-white/70">
                  and generate the assets to launch it.
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-white/75 md:text-lg">
                TruthRadeo Chicago doesn’t stream your music and it doesn’t
                promise algorithm magic. It’s the “street-to-stage” business
                engine that turns your current creator situation into a
                structured plan and launch-ready execution assets.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <PrimaryButton>Start Chicago Stage</PrimaryButton>
                  </SignUpButton>

                  <SignInButton mode="modal">
                    <SecondaryButton>I already have an account</SecondaryButton>
                  </SignInButton>

                  <Link href="/pricing">
                    <GhostButton>See Pricing</GhostButton>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard">
                    <PrimaryButton>Go to Dashboard</PrimaryButton>
                  </Link>
                  <Link href="/pricing">
                    <SecondaryButton>Pricing</SecondaryButton>
                  </Link>
                  <Link href="/faq">
                    <GhostButton>FAQ</GhostButton>
                  </Link>
                </SignedIn>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-3">
                <MiniStat label="Time to value" value="5–15 min" sub="Snapshot start" />
                <MiniStat label="Output" value="Blueprint + Assets" sub="Not advice" />
                <MiniStat label="Focus" value="Chicago Stage" sub="Revenue foundation" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
                <Pill>Creators</Pill>
                <Pill>Producers</Pill>
                <Pill>DJs</Pill>
                <Pill>Band leaders</Pill>
                <Pill>Event-based artists</Pill>
                <Pill>Merch / booking focused</Pill>
              </div>
            </div>

            {/* HERO RIGHT: “Poster” card */}
            <div className="w-full lg:max-w-sm">
              <div className="rounded-[1.75rem] border border-white/12 bg-black/40 p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/60">Tonight’s drop</div>
                    <div className="text-lg font-bold tracking-tight">
                      Chicago Creator Snapshot
                    </div>
                    <div className="mt-1 text-sm text-white/70">
                      Capture signal → run diagnostic → generate launch assets.
                    </div>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    v1
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <PosterRow title="Snapshot" desc="Identity, links, audience, revenue" />
                  <PosterRow title="Diagnostic" desc="Leaks + priorities + risk/impact" />
                  <PosterRow title="Offer Architect" desc="Offer types + pricing ladder" />
                  <PosterRow title="Execution Assets" desc="Copy + scripts + timeline" />
                  <PosterRow title="Iteration Plan" desc="What to tweak after results" />
                </div>

                <div className="mt-5">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90">
                        Claim your Chicago Stage
                      </button>
                    </SignUpButton>
                    <div className="mt-2 text-center text-xs text-white/50">
                      No streaming • No gimmicks • Just execution
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="block w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black hover:bg-white/90"
                    >
                      Continue in Dashboard
                    </Link>
                    <div className="mt-2 text-center text-xs text-white/50">
                      Your Snapshot lives in your account
                    </div>
                  </SignedIn>
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">Fast clarity</div>
                <div className="mt-1 text-sm text-white/75">
                  “I finally stopped guessing what to sell and how to launch it.”
                </div>
                <div className="mt-2 text-xs text-white/50">
                  — early creator (example)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* SOCIAL PROOF / TRUST */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <TrustCard
            title="Built for real-world creator income"
            desc="Shows, merch, features, beats, brand work, booking strategy — not abstract theory."
            tag="Street-to-stage"
          />
          <TrustCard
            title="Outputs you can deploy immediately"
            desc="Offer page copy, DM/email scripts, launch timeline, and a lightweight forecast."
            tag="Execution assets"
          />
          <TrustCard
            title="Designed as Stage 1 foundation"
            desc="Chicago is the revenue engine first — later stages expand scenes, discovery, and more."
            tag="System staging"
          />
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section id="what" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="WHAT YOU GET"
          title="A clean blueprint + launch-ready assets."
          subtitle="This is the part that makes creators willing to pay: tangible outputs."
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-white/10 bg-black/35 p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-white/60">
                    Chicago Stage deliverables
                  </div>
                  <div className="mt-1 text-xl font-extrabold tracking-tight">
                    Generated assets (not advice)
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    After Snapshot, Chicago builds your Diagnostic and Offer,
                    then generates the assets you actually deploy.
                  </p>
                </div>
                <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Creator-first
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <Deliverable title="Creator Snapshot summary" desc="Your signal packaged cleanly." />
                <Deliverable title="Revenue Diagnostic report" desc="Leaks + priorities + ranking." />
                <Deliverable title="Offer ladder + pricing" desc="What you sell + how it stacks." />
                <Deliverable title="Offer page copy" desc="Headline, bullets, proof angles." />
                <Deliverable title="DM / email scripts" desc="Booking + collabs + customers." />
                <Deliverable title="Launch timeline" desc="7–30 day rollout plan." />
                <Deliverable title="Simple forecast model" desc="Targets + volume assumptions." />
                <Deliverable title="Iteration checklist" desc="What to tweak after results." />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <PrimaryButton>Start Snapshot</PrimaryButton>
                  </SignUpButton>
                  <Link href="/pricing">
                    <SecondaryButton>Compare tiers</SecondaryButton>
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard">
                    <PrimaryButton>Open Snapshot</PrimaryButton>
                  </Link>
                  <Link href="/pricing">
                    <SecondaryButton>Compare tiers</SecondaryButton>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-7">
              <div className="text-xs text-white/60">How Chicago feels</div>
              <div className="mt-1 text-xl font-extrabold tracking-tight">
                Like a manager who ships.
              </div>
              <p className="mt-2 text-sm text-white/70">
                You answer questions once. Chicago converts it into a structured
                revenue plan and scripts you can copy/paste and deploy.
              </p>

              <div className="mt-6 grid gap-3">
                <Quote
                  who="Independent artist"
                  text="“I had followers but no offer. Chicago forced clarity.”"
                />
                <Quote
                  who="Producer"
                  text="“I stopped underpricing — ladder made it obvious.”"
                />
                <Quote
                  who="DJ / events"
                  text="“Booking scripts alone paid for it.”"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Stage 1 focus</div>
                <div className="mt-1 text-sm text-white/75">
                  Monetization foundation first. Everything else comes after.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="HOW IT WORKS"
          title="Snapshot → Diagnostic → Offer → Assets → Iterate"
          subtitle="A simple loop that turns chaotic creator life into a plan you can execute."
        />

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/35 p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-5">
            <StepCard
              n="01"
              title="Snapshot"
              desc="Capture identity, links, audience, revenue, momentum."
            />
            <StepCard
              n="02"
              title="Diagnostic"
              desc="Find leaks, priorities, and the highest-impact next move."
            />
            <StepCard
              n="03"
              title="Offer"
              desc="Build the offer ladder + pricing + value stack."
            />
            <StepCard
              n="04"
              title="Assets"
              desc="Generate copy + scripts + launch timeline."
            />
            <StepCard
              n="05"
              title="Iterate"
              desc="Log results and adjust your next iteration."
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/pricing">
              <PrimaryButton>See tiers</PrimaryButton>
            </Link>
            <Link href="/faq">
              <SecondaryButton>Read FAQ</SecondaryButton>
            </Link>
            <a href="#pricing">
              <GhostButton>Jump to pricing preview</GhostButton>
            </a>
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <SectionTitle
          kicker="PRICING"
          title="Choose your Chicago tier."
          subtitle="Start where you are. Upgrade when you want more structure and outputs."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Tier
            name="South Loop"
            price="$29/mo"
            lifetime="$149 lifetime"
            tag="Foundation"
            bullets={[
              "Snapshot + basic diagnostic",
              "Core offer outline",
              "Basic execution checklist",
              "Quarterly iteration plan",
            ]}
            cta="Start here"
            href="/pricing"
          />
          <Tier
            name="River North"
            price="$59/mo"
            lifetime="$349 lifetime"
            tag="Momentum"
            highlight
            bullets={[
              "Advanced diagnostic + priorities",
              "Offer ladder + pricing ladder",
              "DM/email scripts",
              "Launch timeline + 60-day planner",
              "Basic forecast targets",
            ]}
            cta="Most popular"
            href="/pricing"
          />
          <Tier
            name="The Loop"
            price="$119/mo"
            lifetime="$799 lifetime"
            tag="Scaling"
            bullets={[
              "Multi-offer ecosystem planning",
              "Advanced modeling structure",
              "Launch calendar cadence",
              "Quarterly review framework",
              "Best for serious scaling",
            ]}
            cta="Go full send"
            href="/pricing"
          />
        </div>

        <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/70">
              “Lifetime” applies to **Stage 1 (Chicago)** access. Future stages
              are separate.
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing">
                <SecondaryButton>Full pricing page</SecondaryButton>
              </Link>
              <SignedOut>
                <SignUpButton mode="modal">
                  <PrimaryButton>Start now</PrimaryButton>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <PrimaryButton>Open dashboard</PrimaryButton>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionTitle
          kicker="FAQ"
          title="Clear scope, no confusion."
          subtitle="Chicago Stage is a revenue engine — not streaming, not discovery."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Accordion
            q="Is TruthRadeo a streaming platform?"
            a="No. Chicago Stage does not host music or promise algorithm growth. It builds your revenue blueprint and generates execution assets."
          />
          <Accordion
            q="What happens after I sign up?"
            a="You begin with the Creator Snapshot in the dashboard. Then Chicago runs a diagnostic and builds your offer + assets."
          />
          <Accordion
            q="Do I need Spotify/YouTube APIs connected?"
            a="No. You can paste links, but Chicago doesn’t require external APIs to function."
          />
          <Accordion
            q="What does “lifetime” mean?"
            a="Lifetime applies to Stage 1 (Chicago) access. Future stages are separate and unlock later."
          />
          <Accordion
            q="Can I upgrade tiers later?"
            a="Yes. Start with South Loop for the foundation and upgrade when you want deeper diagnostics, scripts, planning, and forecasting."
          />
          <Accordion
            q="Who is Chicago Stage for?"
            a="Creators who want clearer offers, better pricing, and deployable scripts/assets for sales, booking, and releases."
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-black/35 p-6">
          <div>
            <div className="text-sm font-semibold">Ready to start?</div>
            <div className="mt-1 text-sm text-white/70">
              Do the Snapshot. Get the blueprint. Deploy the assets.
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <PrimaryButton>Start Chicago Stage</PrimaryButton>
              </SignUpButton>
              <Link href="/pricing">
                <SecondaryButton>Pricing</SecondaryButton>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard">
                <PrimaryButton>Open dashboard</PrimaryButton>
              </Link>
              <Link href="/pricing">
                <SecondaryButton>Pricing</SecondaryButton>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ------------------------ VISUAL FX ------------------------ */

function BackgroundFX() {
  return (
    <>
      {/* subtle noise / gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_20%,rgba(255,255,255,0.10),transparent_60%),radial-gradient(70%_70%_at_20%_80%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(70%_70%_at_80%_80%,rgba(255,255,255,0.06),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:48px_48px]" />
    </>
  );
}

function TopAnnouncement() {
  return (
    <div className="border-b border-white/10 bg-black/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-2 text-xs text-white/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/80">
            Chicago Stage
          </span>
          <span className="text-white/60">
            Stage 1 is live: Snapshot is up. Diagnostic + Offer + Assets next.
          </span>
        </div>
        <div className="hidden text-white/50 md:block">
          TruthRadeo • Letting Music Soar
        </div>
      </div>
    </div>
  );
}

function StickyHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div className="leading-tight">
            <div className="text-xs tracking-wide text-white/60">TruthRadeo</div>
            <div className="text-base font-semibold">Stage 1 • Chicago</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#what" className="hover:text-white">
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
  );
}

function Marquee() {
  return (
    <div className="border-y border-white/10 bg-white/[0.03]">
      <div className="mx-auto w-full max-w-6xl px-6 py-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35">
          <div className="flex animate-[marquee_18s_linear_infinite] whitespace-nowrap py-3 text-xs text-white/60">
            <span className="mx-6">Snapshot → Diagnostic → Offer → Assets → Iterate</span>
            <span className="mx-6">Chicago Stage: Revenue Architecture Engine</span>
            <span className="mx-6">Execution assets • DM scripts • Offer copy • Timeline</span>
            <span className="mx-6">Built for shows • merch • bookings • drops</span>
            <span className="mx-6">Snapshot → Diagnostic → Offer → Assets → Iterate</span>
            <span className="mx-6">Chicago Stage: Revenue Architecture Engine</span>
            <span className="mx-6">Execution assets • DM scripts • Offer copy • Timeline</span>
            <span className="mx-6">Built for shows • merch • bookings • drops</span>
          </div>
        </div>
      </div>

      {/* keyframes */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------ COMPONENTS ------------------------ */

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
        <span>Chicago Stage</span>
      </div>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function PosterRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-white/60">{desc}</div>
        </div>
        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-white/60" />
      </div>
    </div>
  );
}

function TrustCard({
  title,
  desc,
  tag,
}: {
  title: string;
  desc: string;
  tag: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-6 hover:bg-black/45">
      <div className="inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
        {tag}
      </div>
      <div className="mt-3 text-base font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/70">{desc}</div>
    </div>
  );
}

function Deliverable({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs text-white/60">{desc}</div>
    </div>
  );
}

function Quote({ who, text }: { who: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-xs text-white/60">{who}</div>
      <div className="mt-1 text-sm text-white/75">{text}</div>
    </div>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs font-semibold text-white/60">{n}</div>
      <div className="mt-2 text-base font-semibold">{title}</div>
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
  cta,
  href,
  highlight,
}: {
  name: string;
  price: string;
  lifetime: string;
  tag: string;
  bullets: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[2rem] border p-6",
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
        <div className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
          {tag}
        </div>
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
        href={href}
        className={[
          "mt-6 inline-flex w-full justify-center rounded-xl px-4 py-2 text-sm font-semibold",
          highlight
            ? "bg-white text-black hover:bg-white/90"
            : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
        ].join(" ")}
      >
        {cta}
      </Link>
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-6 open:bg-white/10">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div className="text-base font-semibold">{q}</div>
          <div className="mt-1 text-white/50 transition-transform group-open:rotate-45">
            +
          </div>
        </div>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-white/70">{a}</div>
    </details>
  );
}

/* ------------------------ SMALL UI ------------------------ */

function Tape({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "alt" | "thin";
}) {
  const cls =
    variant === "alt"
      ? "border-white/15 bg-white/10 text-white/90"
      : variant === "thin"
      ? "border-white/10 bg-black/30 text-white/70"
      : "border-white/15 bg-black/40 text-white/90";
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide",
        cls,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
      {children}
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10">
      {children}
    </button>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-white/80 hover:bg-black/40">
      {children}
    </button>
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
