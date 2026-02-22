"use client";

import * as React from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

type ThemeKey = "hiphop" | "edm" | "rnb" | "rock" | "indie";

const THEMES: Record<
  ThemeKey,
  {
    label: string;
    a1: string;
    a2: string;
    a3: string;
    bg1: string;
    bg2: string;
    poster: string;
    vibe: string;
  }
> = {
  hiphop: {
    label: "Hip-Hop",
    a1: "#00FF85",
    a2: "#FF2BD6",
    a3: "#FFD400",
    bg1: "#07070A",
    bg2: "#0D0D18",
    poster: "Money moves. Street logic.",
    vibe: "BASS • BARS • BOOKINGS",
  },
  edm: {
    label: "EDM",
    a1: "#00E5FF",
    a2: "#7C3AED",
    a3: "#FF4D00",
    bg1: "#060712",
    bg2: "#0A0A1E",
    poster: "Build a drop… for your income.",
    vibe: "SETS • PACKS • CLUB MONEY",
  },
  rnb: {
    label: "R&B",
    a1: "#FF5FA2",
    a2: "#FFD6A6",
    a3: "#9AE6B4",
    bg1: "#07070A",
    bg2: "#130B12",
    poster: "Soft sound. Hard revenue.",
    vibe: "VOCALS • SESSIONS • FANS",
  },
  rock: {
    label: "Rock",
    a1: "#FF1B1B",
    a2: "#FFD400",
    a3: "#00E5FF",
    bg1: "#07070A",
    bg2: "#120A0A",
    poster: "Loud art. Loud pricing.",
    vibe: "SHOWS • MERCH • CHAOS → SYSTEM",
  },
  indie: {
    label: "Indie",
    a1: "#A3E635",
    a2: "#60A5FA",
    a3: "#F472B6",
    bg1: "#06070B",
    bg2: "#0B1220",
    poster: "Weird wins. Consistent cash.",
    vibe: "STORY • COMMUNITY • DIRECT SALES",
  },
};

const LANES = [
  {
    key: "shows",
    title: "Shows / Bookings",
    oneLiner: "Stop begging for gigs. Pitch like a business.",
    bullets: [
      "Booking DM scripts + follow-ups",
      "Rate sheet / value stack",
      "30-day outreach calendar",
    ],
    sample:
      "SUBJECT: [CITY] — 30-min set + promo kit\n\nHey [NAME], I’m [ARTIST]. I’m pushing a new drop + can bring [X] local draw. I’m booking [DATES]. Here’s the clean offer: 30 min set + promo pack + after-movie clip. Rate: $___ (flex for door split). Want me on the next lineup?",
  },
  {
    key: "services",
    title: "Services",
    oneLiner: "Turn skill into invoices (mixing, features, production).",
    bullets: [
      "Offer ladder (starter → pro → premium)",
      "Scope + turnaround template",
      "Objection-handling replies",
    ],
    sample:
      "OFFER: Mix + Master (48hr)\n\nStarter: $___ (1 song)\nPro: $___ (2 songs + alt versions)\nPremium: $___ (EP + vocal polish + revisions)\n\nFast delivery. Clear revisions. Pay link + file handoff included.",
  },
  {
    key: "products",
    title: "Digital Products",
    oneLiner: "Packs, presets, drumkits, loops — sell while you sleep.",
    bullets: ["Offer page copy", "5-email launch sequence", "14-day social rollout"],
    sample:
      "HEADLINE: The pack that fixes your drums in 5 minutes\n\nIncludes: 120 one-shots, 40 loops, 12 bouncy 808s, 10 bonus MIDI\n\nIf you make [GENRE], this is your shortcut. Instant download. Limited intro price.",
  },
  {
    key: "memberships",
    title: "Membership / Community",
    oneLiner: "Recurring money > random spikes.",
    bullets: ["Monthly value stack", "Retention hooks", "Launch + month-2 plan"],
    sample:
      "MEMBERSHIP: Studio Club\n\n$___/mo — weekly behind-the-scenes, monthly live feedback, exclusive drops, private Q&A, early tickets.\n\nJoin if you want consistent access + real proximity (without the parasocial mess).",
  },
  {
    key: "content",
    title: "Content → Funnel",
    oneLiner: "Make content that sells (without selling your soul).",
    bullets: ["Hook library (20 angles)", "CTA scripts", "Weekly posting cadence"],
    sample:
      "HOOK: ‘I used to undercharge until I did this…’\n\nVideo: 7–12 seconds showing the before/after pricing ladder.\nCTA: ‘Comment “PRICE” and I’ll send the template.’\nDM follow-up: ‘Here’s the template + the offer stack I used.’",
  },
] as const;

const GRAFFITI_OBJECTIONS = [
  {
    front: "“I don’t have fans.”",
    back:
      "Good. Sell to clients first.\n\nLane: services / features / mixes\nGoal: 3 paid clients in 30 days\nScript: ‘Fast turnaround. Clear revisions. Pay link included.’",
    accent: "a1",
  },
  {
    front: "“I hate selling.”",
    back:
      "Then don’t “sell.”\n\nInvite + filter.\n\n‘If you want [RESULT], I have 3 slots this week. Want details?’",
    accent: "a2",
  },
  {
    front: "“I’m undercharging.”",
    back:
      "Raise price with a ladder.\n\nStarter: accessible\nPro: your default\nPremium: your flex\n\nMore value → fewer clients → same money.",
    accent: "a3",
  },
  {
    front: "“I’m busy / no time.”",
    back:
      "Run the minimum loop.\n\n20 DMs/week\n2 posts/week\n1 story sequence\n\nConsistency beats ‘grind mode.’",
    accent: "a1",
  },
  {
    front: "“My music isn’t ‘big’.”",
    back:
      "Income ≠ fame.\n\nOffer: access, service, product.\nYou can be unknown and still paid.",
    accent: "a2",
  },
  {
    front: "“Streams don’t pay.”",
    back:
      "Correct.\n\nSo build direct revenue:\nservices / booking / digital products / membership\n\nTruthRadeo builds the machine.",
    accent: "a3",
  },
] as const;

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useGlobalStageFX(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;

    let raf = 0;
    let mx = 0.5;
    let my = 0.35;

    const update = () => {
      const max = Math.max(
        1,
        document.body.scrollHeight - window.innerHeight
      );
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      root.style.setProperty("--tr-scroll", String(p));
      root.style.setProperty("--tr-mx", String(mx));
      root.style.setProperty("--tr-my", String(my));
      raf = requestAnimationFrame(update);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX / Math.max(1, window.innerWidth);
      my = e.clientY / Math.max(1, window.innerHeight);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);
}

function useInView<T extends HTMLElement>(opts?: IntersectionObserverInit) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            el.setAttribute("data-inview", "true");
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px", ...opts }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [opts]);

  return ref;
}

function Reveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const ref = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("tr-reveal", reduced && "tr-reveal--off", className)}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [theme, setTheme] = React.useState<ThemeKey>("hiphop");
  const [laneKey, setLaneKey] = React.useState<(typeof LANES)[number]["key"]>(
    "shows"
  );
  const [soundEnabled, setSoundEnabled] = React.useState(false);

  const reduced = usePrefersReducedMotion();
  useGlobalStageFX(!reduced);

  const t = THEMES[theme];
  const lane = LANES.find((l) => l.key === laneKey) ?? LANES[0];

  const themeStyle =
    {
      "--tr-a1": t.a1,
      "--tr-a2": t.a2,
      "--tr-a3": t.a3,
      "--tr-bg1": t.bg1,
      "--tr-bg2": t.bg2,
    } as React.CSSProperties;

  return (
    <main
      style={themeStyle}
      className="relative min-h-screen overflow-x-hidden bg-[color:var(--tr-bg1)] text-white"
    >
      <Backdrop />
      <CursorHalo />
      <TopTicker vibe={t.vibe} />
      <Nav theme={theme} setTheme={setTheme} />

      <Hero theme={t} />

      {/* STORY ARC */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHead
          kicker="REALITY CHECK"
          title="Your music can be fire and you can still be broke."
          subtitle="Chicago Stage is built for the gap between ‘talent’ and ‘income.’"
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <Reveal>
            <PosterCard
              tag="PROBLEM"
              title="Streams ≠ rent"
              desc="Platforms reward attention. You need direct revenue."
              stamp="NO CAP"
            />
          </Reveal>
          <Reveal>
            <PosterCard
              tag="SHIFT"
              title="Pick one money lane"
              desc="Bookings, services, products, membership — choose one to run."
              stamp="FOCUS"
            />
          </Reveal>
          <Reveal>
            <PosterCard
              tag="SYSTEM"
              title="Execute → log → iterate"
              desc="We don’t promise viral. We build a loop that improves."
              stamp="REPEAT"
            />
          </Reveal>
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="THE HOOK"
          title="SaaS for broke artists who hate vague advice."
          subtitle="Snapshot → money lane → assets → 30-day plan. Then iterate."
        />

        <div className="mt-7 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="h-full">
              <div className="tr-card relative h-full overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/35 p-7">
                <div className="pointer-events-none absolute -left-20 -top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--tr-a1)_35%,transparent),transparent_60%)] blur-2xl" />
                <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--tr-a2)_35%,transparent),transparent_60%)] blur-2xl" />

                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Stage 1</Badge>
                  <Badge accent>Chicago</Badge>
                  <span className="text-xs text-white/55">
                    no streaming • no fake growth promises
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black tracking-tight md:text-3xl">
                  You don’t leave with motivation.
                  <span className="tr-glitchfont ml-2 text-[color:var(--tr-a3)]">
                    You leave with assets.
                  </span>
                </h3>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <Pad
                    title="Revenue Diagnostic"
                    desc="Find the leak. Fix the first thing."
                    icon="01"
                  />
                  <Pad
                    title="Offer Architect"
                    desc="What to sell + pricing ladder."
                    icon="02"
                  />
                  <Pad
                    title="Execution Assets"
                    desc="Offer copy + DMs + email sequence."
                    icon="03"
                  />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <MiniStat
                    label="Time to value"
                    value="5–15 minutes"
                    sub="Snapshot → plan"
                  />
                  <MiniStat
                    label="Typical output"
                    value="10–25 copy blocks"
                    sub="scripts, headlines, cadence"
                  />
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <PrimaryButton>Build my money plan</PrimaryButton>
                    </SignUpButton>
                    <Link href="/pricing">
                      <SecondaryButton>See tiers</SecondaryButton>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <PrimaryButton>Open Dashboard</PrimaryButton>
                    </Link>
                    <Link href="/dashboard">
                      <SecondaryButton>Start Snapshot</SecondaryButton>
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <div className="tr-card tr-noise relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-7">
                <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_10%_10%,color-mix(in_oklab,var(--tr-a1)_30%,transparent),transparent_55%),radial-gradient(circle_at_90%_20%,color-mix(in_oklab,var(--tr-a2)_28%,transparent),transparent_55%),radial-gradient(circle_at_50%_95%,color-mix(in_oklab,var(--tr-a3)_22%,transparent),transparent_60%)]" />

                <div className="relative">
                  <div className="text-xs text-white/60">A real example output</div>
                  <div className="mt-2 text-lg font-extrabold tracking-tight">
                    The “Money Lane” Card
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    One lane. One offer. One rollout. No chaos.
                  </p>

                  <div className="mt-5 grid gap-3">
                    <ListRow title="Lane" value="Services (mixing + features)" />
                    <ListRow title="Offer" value="48hr mix + master" />
                    <ListRow title="Price" value="$149 → $249 → $399" />
                    <ListRow title="Primary channel" value="IG DM + email" />
                    <ListRow
                      title="Weekly plan"
                      value="20 DMs • 2 posts • 1 story sequence"
                    />
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="text-xs text-white/60">No-cap promise</div>
                    <div className="mt-2 text-sm text-white/75">
                      We don’t do “go viral.” We do “get paid.”
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Reveal>
                <Sticker title="Youthful vibe" desc="Street colors. Poster energy." />
              </Reveal>
              <Reveal>
                <Sticker title="Serious outputs" desc="Copy, scripts, ladders, cadence." />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* GRAFFITI WALL */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="GRAFFITI WALL"
          title="Objection killers (flip the cards)."
          subtitle="The stuff people say right before they stay broke."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GRAFFITI_OBJECTIONS.map((c) => (
            <Reveal key={c.front}>
              <FlipCard front={c.front} back={c.back} accent={c.accent} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* LANES */}
      <section id="lanes" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="PICK YOUR LANE"
          title="Different creators. Different money moves."
          subtitle="Choose a lane and see what TruthRadeo generates."
        />

        <div className="mt-7 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="grid gap-3">
              {LANES.map((l) => {
                const active = l.key === laneKey;
                return (
                  <button
                    key={l.key}
                    type="button"
                    onClick={() => setLaneKey(l.key)}
                    className={cn(
                      "tr-card text-left rounded-[1.75rem] border px-5 py-4 transition",
                      active
                        ? "border-white/30 bg-black/45"
                        : "border-white/10 bg-black/25 hover:border-white/20 hover:bg-black/35"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-extrabold">{l.title}</div>
                        <div className="mt-1 text-xs text-white/65">{l.oneLiner}</div>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11px] font-extrabold",
                          active
                            ? "border-white/25 bg-white/10 text-white"
                            : "border-white/10 bg-white/5 text-white/70"
                        )}
                      >
                        PREVIEW
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {l.bullets.map((b) => (
                        <span
                          key={b}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal className="h-full">
              <div className="tr-card tr-noise relative h-full overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-6 md:p-7">
                <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--tr-a1)_30%,transparent),transparent_60%),radial-gradient(circle_at_85%_25%,color-mix(in_oklab,var(--tr-a2)_30%,transparent),transparent_60%),radial-gradient(circle_at_50%_110%,color-mix(in_oklab,var(--tr-a3)_22%,transparent),transparent_65%)]" />

                <div className="relative">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-white/60">Generated sample</div>
                      <div className="mt-1 text-xl font-black tracking-tight">
                        {lane.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70 md:inline-flex">
                        copy/paste ready
                      </span>
                      <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 text-xs text-white/70">
                        Chicago Stage
                      </span>
                    </div>
                  </div>

                  <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/45 p-4 text-[12px] leading-relaxed text-white/85">
                    {lane.sample}
                  </pre>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <PrimaryButton>Generate mine</PrimaryButton>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <SecondaryButton>Sign in</SecondaryButton>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard/assets">
                        <PrimaryButton>Go to Execution Assets</PrimaryButton>
                      </Link>
                      <Link href="/dashboard">
                        <SecondaryButton>Update Snapshot</SecondaryButton>
                      </Link>
                    </SignedIn>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SOUND PADS */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="SOUND PADS"
          title="Make the page feel like a studio."
          subtitle="Optional synth hits (tap pads). No audio files. Web Audio only."
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/70">
            Sound is <span className="font-extrabold">{soundEnabled ? "ON" : "OFF"}</span>.
            Toggle it if you want the vibe.
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className={cn(
              "rounded-2xl border px-4 py-2 text-sm font-extrabold transition",
              soundEnabled
                ? "border-white/25 bg-white/10"
                : "border-white/12 bg-black/30 hover:bg-black/45"
            )}
          >
            {soundEnabled ? "Disable sound" : "Enable sound"}
          </button>
        </div>

        <Reveal>
          <SoundPads enabled={soundEnabled} />
        </Reveal>
      </section>

      {/* SPRINT */}
      <section id="sprint" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="THE 30-DAY SPRINT"
          title="Your rent doesn’t care about your ‘brand journey.’"
          subtitle="So we run a clean 4-week loop. Execute → measure → improve."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Reveal>
            <SprintCard
              week="Week 1"
              title="Build the offer"
              items={["Snapshot", "Diagnostic", "Offer ladder", "Pricing"]}
            />
          </Reveal>
          <Reveal>
            <SprintCard
              week="Week 2"
              title="Launch the outreach"
              items={["DM scripts", "Email sequence", "Booking pitch", "CTA & links"]}
            />
          </Reveal>
          <Reveal>
            <SprintCard
              week="Week 3"
              title="Ship content + proof"
              items={["14-day content plan", "Proof angles", "Testimonials", "Follow-ups"]}
            />
          </Reveal>
          <Reveal>
            <SprintCard
              week="Week 4"
              title="Iterate and scale"
              items={["Log results", "Adjust price", "Refine offer", "Second wave"]}
            />
          </Reveal>
        </div>

        <Reveal className="mt-6">
          <div className="tr-card rounded-[2rem] border border-white/10 bg-black/35 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Realistic promise</div>
                <div className="mt-1 text-sm text-white/70">
                  If you can execute, Chicago Stage gives you the structure.
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <PrimaryButton>Start the Snapshot</PrimaryButton>
                  </SignUpButton>
                  <Link href="/pricing">
                    <SecondaryButton>Pricing</SecondaryButton>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <PrimaryButton>Open Dashboard</PrimaryButton>
                  </Link>
                  <Link href="/pricing">
                    <SecondaryButton>Manage plan</SecondaryButton>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="PRICING"
          title="Pick your intensity. Upgrade when you’re ready."
          subtitle="Lifetime applies to Stage 1 (Chicago) only."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <Reveal>
            <PriceCard
              name="South Loop"
              vibe="Start building"
              price="29/mo"
              lifetime="149 lifetime"
              bullets={[
                "Snapshot + Summary",
                "Revenue Diagnostic v1",
                "Starter offer outline",
                "Basic 30-day plan",
              ]}
            />
          </Reveal>
          <Reveal>
            <PriceCard
              featured
              name="River North"
              vibe="Move money"
              price="59/mo"
              lifetime="349 lifetime"
              bullets={[
                "Advanced diagnostic",
                "Pricing ladder",
                "DM + email scripts",
                "Execution assets generator",
                "Iteration loop",
              ]}
            />
          </Reveal>
          <Reveal>
            <PriceCard
              name="The Loop"
              vibe="Scale"
              price="119/mo"
              lifetime="799 lifetime"
              bullets={[
                "Multi-offer ecosystem",
                "Deeper modeling",
                "Launch calendar",
                "Quarterly review kit",
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="FAQ"
          title="Scope is clear. No confusion."
          subtitle="Chicago Stage is revenue architecture — not streaming, not discovery."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Reveal>
            <Faq
              q="Is TruthRadeo a streaming platform?"
              a="No. Chicago Stage doesn’t host music. It builds a revenue plan + execution assets."
            />
          </Reveal>
          <Reveal>
            <Faq
              q="Do I need Spotify/YouTube APIs?"
              a="No. You can paste links, but Chicago doesn’t require any external API to function."
            />
          </Reveal>
          <Reveal>
            <Faq
              q="What happens after I sign up?"
              a="You go to the dashboard, complete the Creator Snapshot, and TruthRadeo generates your outputs."
            />
          </Reveal>
          <Reveal>
            <Faq
              q="What does “lifetime” mean?"
              a="Lifetime is lifetime access to Stage 1 (Chicago). Future stages are separate."
            />
          </Reveal>
        </div>

        <Reveal className="mt-8">
          <div className="tr-card tr-confetti rounded-[2.25rem] border border-white/10 bg-black/35 p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="tr-glitchfont text-[color:var(--tr-a1)]">
                  Ready to stop guessing?
                </div>
                <div className="mt-2 text-sm text-white/70">
                  Snapshot → Diagnostic → Offer → Assets → Iterate.
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <PrimaryButton>Start Chicago Stage</PrimaryButton>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <SecondaryButton>Sign in</SecondaryButton>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <PrimaryButton>Open Dashboard</PrimaryButton>
                  </Link>
                  <Link href="/pricing">
                    <SecondaryButton>Pricing</SecondaryButton>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}

/* ------------------------- sections & ui ------------------------- */

function Nav({
  theme,
  setTheme,
}: {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <div className="absolute inset-0 animate-[tr_drift_9s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--tr-a2)_35%,transparent),transparent_55%),radial-gradient(circle_at_80%_60%,color-mix(in_oklab,var(--tr-a1)_30%,transparent),transparent_55%),radial-gradient(circle_at_55%_90%,color-mix(in_oklab,var(--tr-a3)_22%,transparent),transparent_55%)]" />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
          </div>
          <div className="leading-tight">
            <div className="text-[11px] tracking-wide text-white/55">TruthRadeo</div>
            <div className="text-base font-black tracking-tight">Chicago Stage</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a className="hover:text-white" href="#proof">Why</a>
          <a className="hover:text-white" href="#lanes">Lanes</a>
          <a className="hover:text-white" href="#sprint">30-day sprint</a>
          <a className="hover:text-white" href="#pricing">Pricing</a>
          <a className="hover:text-white" href="#faq">FAQ</a>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeSwitch theme={theme} setTheme={setTheme} />
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
  );
}

function Hero({
  theme,
}: {
  theme: { label: string; poster: string; vibe: string };
}) {
  const heroRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  React.useEffect(() => {
    const el = heroRef.current;
    if (!el || reduced) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(1, rect.width);
      const y = (e.clientY - rect.top) / Math.max(1, rect.height);
      el.style.setProperty("--mx", String(x));
      el.style.setProperty("--my", String(y));
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-10 md:pt-14">
      <div
        ref={heroRef}
        className="tr-noise tr-hero relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-black/35"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2.75rem] opacity-70 [background:conic-gradient(from_180deg_at_50%_50%,color-mix(in_oklab,var(--tr-a2)_35%,transparent),color-mix(in_oklab,var(--tr-a1)_35%,transparent),color-mix(in_oklab,var(--tr-a3)_35%,transparent),color-mix(in_oklab,var(--tr-a2)_35%,transparent))] animate-[tr_spin_16s_linear_infinite]" />
        <div className="pointer-events-none absolute inset-[2px] rounded-[2.6rem] bg-[color:var(--tr-bg2)] opacity-90" />

        <div className="pointer-events-none absolute -left-6 top-10 rotate-[-8deg] animate-[tr_float_7s_ease-in-out_infinite] rounded-3xl border border-white/15 bg-black/45 px-4 py-3 text-xs font-extrabold tracking-wide text-white/80">
          <span className="tr-graffiti text-[color:var(--tr-a2)]">NO VIRAL</span> • JUST CASH
        </div>
        <div className="pointer-events-none absolute -right-8 top-14 rotate-[10deg] animate-[tr_float_8s_ease-in-out_infinite] rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-extrabold text-white/80">
          <span className="text-[color:var(--tr-a1)]">STAGE 1</span> CHICAGO
        </div>
        <div className="pointer-events-none absolute -right-10 bottom-12 rotate-[-6deg] animate-[tr_float_9s_ease-in-out_infinite] rounded-[2rem] border border-white/15 bg-black/45 px-4 py-3 text-xs font-extrabold text-white/80">
          30-DAY SPRINT
        </div>

        <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                <span className="h-2 w-2 rounded-full bg-[color:var(--tr-a1)]" />
                <span className="font-extrabold text-white/85">LIVE</span>
                <span className="text-white/30">•</span>
                <span className="font-semibold">Stage 1</span>
                <span className="text-white/30">•</span>
                <span className="font-semibold">Chicago</span>
              </span>
              <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1 text-xs text-white/70">
                {theme.label} mode
              </span>

              <span className="ml-auto hidden rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70 md:inline-flex">
                scroll-reactive stage lighting
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
              <span className="tr-graffiti inline-block text-[color:var(--tr-a2)]">
                Get paid
              </span>{" "}
              with your music.
              <span className="text-white/70"> (For real.)</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              {theme.poster} TruthRadeo Chicago Stage turns your current creator
              reality into a clear offer, pricing ladder, scripts, and a weekly
              30-day plan — then gives you an iteration loop.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <SignedOut>
                <SignUpButton mode="modal">
                  <PrimaryButton>Build my revenue plan</PrimaryButton>
                </SignUpButton>
                <Link href="/pricing">
                  <SecondaryButton>See pricing</SecondaryButton>
                </Link>
                <SignInButton mode="modal">
                  <GhostButton>Sign in</GhostButton>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <PrimaryButton>Open dashboard</PrimaryButton>
                </Link>
                <Link href="/dashboard">
                  <SecondaryButton>Start Snapshot</SecondaryButton>
                </Link>
                <Link href="/pricing">
                  <GhostButton>Pricing</GhostButton>
                </Link>
              </SignedIn>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <HoloChip label="Time to value" value="5–15 min" />
              <HoloChip label="Output" value="Copy + scripts" />
              <HoloChip label="Result" value="A money lane" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/60">
              <Pill>booking scripts</Pill>
              <Pill>offer page copy</Pill>
              <Pill>DM follow-ups</Pill>
              <Pill>5-email launch</Pill>
              <Pill>pricing ladder</Pill>
              <Pill>30-day cadence</Pill>
            </div>
          </div>

          <div className="lg:col-span-5">
            <MixtapeCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ThemeSwitch({
  theme,
  setTheme,
}: {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}) {
  return (
    <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 md:flex">
      {(Object.keys(THEMES) as ThemeKey[]).map((k) => {
        const active = k === theme;
        return (
          <button
            key={k}
            type="button"
            onClick={() => setTheme(k)}
            className={cn(
              "rounded-xl px-3 py-2 text-xs font-extrabold transition",
              active
                ? "bg-white text-black"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {THEMES[k].label}
          </button>
        );
      })}
    </div>
  );
}

function Backdrop() {
  return (
    <>
      {/* scroll-reactive background (CSS uses --tr-scroll, --tr-mx, --tr-my) */}
      <div className="pointer-events-none fixed inset-0 -z-10 tr-stagebg" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.10] [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_14px)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 tr-scanlines" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 animate-[tr_flicker_7s_linear_infinite] [background:radial-gradient(circle_at_50%_15%,transparent_0%,rgba(0,0,0,0.35)_40%,rgba(0,0,0,0.80)_100%)]" />
    </>
  );
}

function CursorHalo() {
  const reduced = usePrefersReducedMotion();
  React.useEffect(() => {
    if (reduced) return;
    const el = document.documentElement;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / Math.max(1, window.innerWidth);
      const y = e.clientY / Math.max(1, window.innerHeight);
      el.style.setProperty("--tr-cx", String(x));
      el.style.setProperty("--tr-cy", String(y));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return <div className="pointer-events-none fixed inset-0 -z-10 tr-cursorhalo" />;
}

function TopTicker({ vibe }: { vibe: string }) {
  return (
    <div className="border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-2">
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[color:var(--tr-a1)]" />
            <span className="font-extrabold text-white/85">NOW PLAYING</span>
            <span className="text-white/30">•</span>
            <span className="font-semibold">Chicago Stage</span>
          </span>
          <span className="hidden md:inline">{vibe}</span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            no streaming
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            no gimmicks
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            execution assets
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-white/10 bg-black/35 py-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/80 to-transparent" />
        <div className="tr-marquee flex min-w-[200%] items-center gap-6 whitespace-nowrap px-6 text-sm text-white/70">
          <Ticker>“I’m broke.” → offer + pricing + scripts</Ticker>
          <Ticker>“Streams don’t pay.” → direct revenue lane</Ticker>
          <Ticker>“I hate selling.” → DM + email copy done</Ticker>
          <Ticker>“I’m undercharging.” → pricing ladder</Ticker>
          <Ticker>“I’m stuck.” → 30-day plan</Ticker>
          <Ticker>“I’m broke.” → offer + pricing + scripts</Ticker>
          <Ticker>“Streams don’t pay.” → direct revenue lane</Ticker>
          <Ticker>“I hate selling.” → DM + email copy done</Ticker>
          <Ticker>“I’m undercharging.” → pricing ladder</Ticker>
          <Ticker>“I’m stuck.” → 30-day plan</Ticker>
        </div>
      </div>
    </div>
  );
}

function SectionHead({
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
        <span className="font-extrabold text-white/85">{kicker}</span>
        <span className="text-white/30">•</span>
        <span className="text-white/70">Chicago</span>
      </div>
      <h2 className="mt-3 text-2xl font-black tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-white/70 md:text-base">
        {subtitle}
      </p>
    </div>
  );
}

function Badge({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-wide",
        accent
          ? "border-white/20 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--tr-a2)_35%,transparent),rgba(255,255,255,0.04))] text-white"
          : "border-white/12 bg-white/5 text-white/80"
      )}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="tr-btn relative overflow-hidden rounded-2xl px-5 py-3 text-sm font-extrabold text-black">
      <span className="absolute inset-0 bg-[linear-gradient(90deg,var(--tr-a1),var(--tr-a3),var(--tr-a2))] animate-[tr_shift_7s_linear_infinite]" />
      <span className="absolute inset-[2px] rounded-2xl bg-white" />
      <span className="relative">{children}</span>
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="tr-btn rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10">
      {children}
    </button>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="tr-btn rounded-2xl border border-white/10 bg-black/40 px-5 py-3 text-sm text-white/80 hover:bg-black/50">
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1">
      {children}
    </span>
  );
}

function Ticker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--tr-a1)]" />
      <span>{children}</span>
    </span>
  );
}

function HoloChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="tr-card relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--tr-a1)_22%,transparent),transparent_60%)]" />
      <div className="relative">
        <div className="text-xs text-white/60">{label}</div>
        <div className="mt-1 text-lg font-black">{value}</div>
      </div>
    </div>
  );
}

function PosterCard({
  tag,
  title,
  desc,
  stamp,
}: {
  tag: string;
  title: string;
  desc: string;
  stamp: string;
}) {
  return (
    <div className="tr-card tr-tilt relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-6">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--tr-a2)_18%,transparent),transparent_60%),radial-gradient(circle_at_85%_30%,color-mix(in_oklab,var(--tr-a1)_18%,transparent),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/80">
            {tag}
          </span>
          <span className="tr-graffiti rotate-[-6deg] text-[color:var(--tr-a3)]">
            {stamp}
          </span>
        </div>
        <div className="mt-4 text-xl font-black tracking-tight">{title}</div>
        <div className="mt-2 text-sm text-white/70">{desc}</div>
      </div>
    </div>
  );
}

function FlipCard({
  front,
  back,
  accent,
}: {
  front: string;
  back: string;
  accent: "a1" | "a2" | "a3";
}) {
  const accentColor =
    accent === "a1"
      ? "var(--tr-a1)"
      : accent === "a2"
      ? "var(--tr-a2)"
      : "var(--tr-a3)";

  return (
    <div className="tr-flipgroup relative h-[210px]">
      <div className="tr-flipcard absolute inset-0 rounded-[2rem] border border-white/10 bg-black/35 p-6">
        <div className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle_at_20%_10%, color-mix(in_oklab, " +
              accentColor +
              " 24%, transparent), transparent 60%)",
          }}
        />
        <div className="relative h-full">
          <div className="text-xs text-white/60">tap / hover</div>
          <div className="mt-4 tr-graffiti text-2xl leading-tight"
            style={{ color: accentColor }}
          >
            {front}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between text-xs text-white/55">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              objection
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              flip
            </span>
          </div>
        </div>
      </div>

      <div className="tr-flipback absolute inset-0 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle_at_80%_15%, color-mix(in_oklab, " +
              accentColor +
              " 22%, transparent), transparent 62%)",
          }}
        />
        <div className="relative h-full">
          <div className="text-xs text-white/60">answer</div>
          <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-white/85">
            {back}
          </pre>
          <div className="absolute bottom-0 left-0 right-0 text-xs text-white/55">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1">
              <span className="h-2 w-2 rounded-full" style={{ background: accentColor }} />
              deploy tonight
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MixtapeCard() {
  return (
    <div className="tr-card tr-tilt relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-6">
      <div className="pointer-events-none absolute -left-24 top-0 h-60 w-60 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tr-a1)_30%,transparent),transparent_60%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tr-a2)_30%,transparent),transparent_60%)] blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Mixtape card</div>
            <div className="mt-1 text-xl font-extrabold tracking-tight">
              Snapshot → Cash Plan
            </div>
            <div className="mt-2 text-sm text-white/70">
              Get a plan that fits your real time + audience.
            </div>
          </div>
          <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
            v1
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          <Track title="1. Revenue Diagnostic" desc="find the leak + the fix" />
          <Track title="2. Offer Architect" desc="what to sell + pricing ladder" />
          <Track title="3. Execution Assets" desc="DMs + emails + offer page" />
          <Track title="4. 30-day plan" desc="weekly actions you can follow" />
          <Track title="5. Iteration loop" desc="log results, improve, repeat" />
        </div>

        <div className="mt-6">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="tr-sheen w-full rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-black hover:bg-white/90">
                Start the Snapshot (free)
              </button>
            </SignUpButton>
            <div className="mt-2 text-center text-xs text-white/50">
              no streaming • no gimmicks • just execution
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
    </div>
  );
}

function Track({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 hover:bg-black/45">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="mt-1 text-xs text-white/60">{desc}</div>
        </div>
        <div className="mt-1 h-3 w-3 rounded-full bg-[color:var(--tr-a1)]" />
      </div>
    </div>
  );
}

function Pad({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <div className="tr-card tr-tilt group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 p-5 transition hover:border-white/20 hover:bg-black/45">
      <div className="pointer-events-none absolute -right-16 -top-14 h-40 w-40 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tr-a2)_28%,transparent),transparent_65%)] blur-2xl opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="mt-1 text-xs text-white/60">{desc}</div>
        </div>
        <div className="tr-glitchfont rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
          {icon}
        </div>
      </div>
    </div>
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
    <div className="tr-card tr-tilt relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_25%_25%,color-mix(in_oklab,var(--tr-a3)_18%,transparent),transparent_60%)]" />
      <div className="relative">
        <div className="text-xs text-white/60">{label}</div>
        <div className="mt-1 text-lg font-black">{value}</div>
        <div className="mt-1 text-xs text-white/50">{sub}</div>
      </div>
    </div>
  );
}

function Sticker({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="tr-card tr-tilt relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_30%,color-mix(in_oklab,var(--tr-a1)_20%,transparent),transparent_60%)]" />
      <div className="relative">
        <div className="text-sm font-extrabold">{title}</div>
        <div className="mt-1 text-xs text-white/60">{desc}</div>
      </div>
    </div>
  );
}

function ListRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="text-xs text-white/55">{title}</div>
      <div className="text-xs font-semibold text-white/80">{value}</div>
    </div>
  );
}

function SprintCard({
  week,
  title,
  items,
}: {
  week: string;
  title: string;
  items: string[];
}) {
  return (
    <div className="tr-card tr-tilt relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-6">
      <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tr-a2)_22%,transparent),transparent_60%)] blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div className="tr-graffiti text-sm text-[color:var(--tr-a1)]">{week}</div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            sprint
          </div>
        </div>
        <div className="mt-2 text-xl font-black tracking-tight">{title}</div>
        <ul className="mt-4 grid gap-2 text-sm text-white/75">
          {items.map((it) => (
            <li key={it} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--tr-a3)]" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PriceCard({
  name,
  vibe,
  price,
  lifetime,
  bullets,
  featured,
}: {
  name: string;
  vibe: string;
  price: string;
  lifetime: string;
  bullets: string[];
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "tr-card tr-tilt relative overflow-hidden rounded-[2.25rem] border p-7",
        featured ? "border-white/25 bg-black/55" : "border-white/10 bg-black/35"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--tr-a1)_18%,transparent),transparent_60%),radial-gradient(circle_at_85%_30%,color-mix(in_oklab,var(--tr-a2)_18%,transparent),transparent_60%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/60">{vibe}</div>
            <div className="mt-1 text-xl font-black tracking-tight">{name}</div>
          </div>
          {featured ? (
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white">
              MOST POPULAR
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-extrabold text-white/75">
              STAGE 1
            </span>
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <div className="text-3xl font-black">{price}</div>
          <div className="text-sm text-white/60">{lifetime}</div>
        </div>

        <ul className="mt-5 grid gap-2 text-sm text-white/75">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--tr-a1)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            href="/pricing"
            className={cn(
              "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold",
              featured
                ? "bg-white text-black hover:bg-white/90"
                : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
            )}
          >
            Choose {name}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="tr-card tr-tilt rounded-[2rem] border border-white/10 bg-black/35 p-6">
      <div className="text-sm font-extrabold">{q}</div>
      <div className="mt-2 text-sm text-white/70">{a}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/35">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="text-sm text-white/60">TruthRadeo</div>
          <div className="mt-2 text-2xl font-black tracking-tight">
            Chicago Stage: Revenue Architecture
          </div>
          <div className="mt-2 text-sm text-white/70">
            Built for creators who want to turn the art into income — without
            building a whole startup around themselves.
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="text-sm font-extrabold">Explore</div>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <Link className="hover:text-white" href="/pricing">Pricing</Link>
            <Link className="hover:text-white" href="/faq">FAQ</Link>
            <Link className="hover:text-white" href="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="text-sm font-extrabold">Principles</div>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            <span>no streaming</span>
            <span>assets-first</span>
            <span>explainable logic</span>
            <span>iteration loop</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-xs text-white/55">
          <span>© {new Date().getFullYear()} TruthRadeo</span>
          <span>Made in Chicago • powered by execution</span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------- Sound Pads ------------------------- */

function SoundPads({ enabled }: { enabled: boolean }) {
  const ctxRef = React.useRef<AudioContext | null>(null);

  const hit = React.useCallback(
    (freq: number) => {
      if (!enabled) return;

      const root = document.documentElement;
      root.setAttribute("data-bass", "1");
      window.setTimeout(() => root.removeAttribute("data-bass"), 140);

      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!ctxRef.current) ctxRef.current = new AudioCtx();

      const ctx = ctxRef.current!;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 0.05);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    },
    [enabled]
  );

  const pads = [
    { label: "808", freq: 55 },
    { label: "CLAP", freq: 220 },
    { label: "HAT", freq: 440 },
    { label: "SNARE", freq: 330 },
    { label: "BELL", freq: 660 },
    { label: "LEAD", freq: 880 },
    { label: "KICK", freq: 72 },
    { label: "FX", freq: 520 },
  ];

  return (
    <div className="tr-card tr-noise relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/35 p-6">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--tr-a1)_24%,transparent),transparent_60%),radial-gradient(circle_at_85%_25%,color-mix(in_oklab,var(--tr-a2)_22%,transparent),transparent_60%),radial-gradient(circle_at_50%_120%,color-mix(in_oklab,var(--tr-a3)_18%,transparent),transparent_65%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs text-white/60">tap the pads</div>
            <div className="mt-1 text-lg font-black tracking-tight">
              Studio Mode (mini)
            </div>
          </div>
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70">
            {enabled ? "sound on" : "sound off"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pads.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => hit(p.freq)}
              className={cn(
                "tr-pad rounded-[1.75rem] border px-5 py-5 text-left transition",
                enabled
                  ? "border-white/18 bg-white/5 hover:bg-white/10"
                  : "border-white/10 bg-black/30 hover:bg-black/45"
              )}
            >
              <div className="text-xs text-white/60">pad</div>
              <div className="mt-1 tr-graffiti text-2xl text-[color:var(--tr-a1)]">
                {p.label}
              </div>
              <div className="mt-2 text-xs text-white/65">
                {enabled ? "tap → hit" : "enable sound to play"}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 text-xs text-white/55">
          Tip: if audio is blocked, click once anywhere, then tap again.
        </div>
      </div>
    </div>
  );
}