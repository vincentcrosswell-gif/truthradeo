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

/* -------------------- theme + mood -------------------- */

type ThemeKey = "hiphop" | "edm" | "rnb" | "rock" | "indie";
type MoodKey = "poster" | "neon" | "velvet" | "brutal";

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
    displayFontVar: string; // CSS var reference string
    headFontVar: string;
    angle: string;
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
    displayFontVar: "var(--font-graffiti)",
    headFontVar: "var(--font-sans)",
    angle: "118deg",
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
    displayFontVar: "var(--font-orbitron)",
    headFontVar: "var(--font-orbitron)",
    angle: "135deg",
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
    displayFontVar: "var(--font-playfair)",
    headFontVar: "var(--font-playfair)",
    angle: "112deg",
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
    displayFontVar: "var(--font-blackops)",
    headFontVar: "var(--font-blackops)",
    angle: "120deg",
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
    displayFontVar: "var(--font-marker)",
    headFontVar: "var(--font-sans)",
    angle: "109deg",
  },
};

const MOODS: Record<
  MoodKey,
  {
    label: string;
    rHero: string;
    rCard: string;
    rChip: string;
    borderStyle: "solid" | "dashed" | "double";
    grain: string; // 0..1
  }
> = {
  poster: {
    label: "Poster",
    rHero: "2.75rem",
    rCard: "2.25rem",
    rChip: "1.25rem",
    borderStyle: "solid",
    grain: "0.08",
  },
  neon: {
    label: "Neon",
    rHero: "2.35rem",
    rCard: "1.85rem",
    rChip: "1.05rem",
    borderStyle: "solid",
    grain: "0.06",
  },
  velvet: {
    label: "Velvet",
    rHero: "3.15rem",
    rCard: "2.75rem",
    rChip: "1.35rem",
    borderStyle: "solid",
    grain: "0.05",
  },
  brutal: {
    label: "Brutal",
    rHero: "0.85rem",
    rCard: "0.85rem",
    rChip: "0.85rem",
    borderStyle: "dashed",
    grain: "0.10",
  },
};

/* -------------------- content blocks -------------------- */

const LANES = [
  {
    key: "shows",
    title: "Shows / Bookings",
    oneLiner: "Stop begging for gigs. Pitch like a business.",
    bullets: ["Booking DM scripts", "Rate sheet", "30-day outreach plan"],
    sample:
      "SUBJECT: [CITY] — 30-min set + promo kit\n\nHey [NAME], I’m [ARTIST]. I can bring [X] local draw + content. Booking [DATES]. Offer: 30 min set + promo pack + after-movie clip. Rate: $___ (flex for door split). Want me on the next lineup?",
  },
  {
    key: "services",
    title: "Services",
    oneLiner: "Turn skill into invoices (mixing, features, production).",
    bullets: ["Pricing ladder", "Scope template", "Objection replies"],
    sample:
      "OFFER: Mix + Master (48hr)\n\nStarter: $___ (1 song)\nPro: $___ (2 songs + alt versions)\nPremium: $___ (EP + vocal polish)\n\nFast delivery. Clear revisions. Pay link + file handoff included.",
  },
  {
    key: "products",
    title: "Digital Products",
    oneLiner: "Packs, presets, drumkits — sell while you sleep.",
    bullets: ["Offer page copy", "Launch emails", "14-day rollout"],
    sample:
      "HEADLINE: The pack that fixes your drums in 5 minutes\n\nIncludes: 120 one-shots, 40 loops, 12 808s, bonus MIDI\n\nIf you make [GENRE], this is your shortcut. Instant download. Limited intro price.",
  },
  {
    key: "memberships",
    title: "Membership",
    oneLiner: "Recurring money > random spikes.",
    bullets: ["Monthly value stack", "Retention hooks", "Month-2 plan"],
    sample:
      "MEMBERSHIP: Studio Club\n\n$___/mo — weekly behind-the-scenes, monthly feedback, exclusive drops, private Q&A.\n\nJoin if you want consistent access + real proximity.",
  },
] as const;

const OBJECTIONS = [
  {
    front: "“I don’t have fans.”",
    back:
      "Good. Sell to clients first.\n\nLane: services / features / mixes\nGoal: 3 paid clients in 30 days\nScript: ‘Fast turnaround. Clear revisions. Pay link included.’",
    accent: "a1",
  },
  {
    front: "“I hate selling.”",
    back:
      "Then don’t ‘sell.’\n\nInvite + filter.\n\n‘If you want [RESULT], I have 3 slots this week. Want details?’",
    accent: "a2",
  },
  {
    front: "“I’m undercharging.”",
    back:
      "Raise price with a ladder.\n\nStarter: accessible\nPro: your default\nPremium: your flex\n\nMore value → fewer clients → same money.",
    accent: "a3",
  },
  {
    front: "“No time.”",
    back:
      "Run the minimum loop.\n\n20 DMs/week\n2 posts/week\n1 story sequence\n\nConsistency beats ‘grind mode.’",
    accent: "a1",
  },
  {
    front: "“Streams don’t pay.”",
    back:
      "Correct.\n\nSo build direct revenue:\nservices / booking / products / membership\n\nTruthRadeo builds the machine.",
    accent: "a3",
  },
] as const;

/* -------------------- helpers -------------------- */

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
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

/** global scroll lighting vars */
function useGlobalStageFX(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const root = document.documentElement;

    let raf = 0;
    let mx = 0.5;
    let my = 0.35;

    const update = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const p = clamp01(window.scrollY / max);
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

/** scene engine: computes active scene index + progress + curtain intensity */
function useSceneEngine(enabled: boolean, onActive?: (id: string) => void) {
  React.useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      root.style.setProperty("--tr-scene", "0");
      root.style.setProperty("--tr-sceneProg", "0");
      root.style.setProperty("--tr-curtain", "0");
      return;
    }

    let raf = 0;

    const getScenes = () =>
      Array.from(document.querySelectorAll<HTMLElement>("section[data-scene]"));

    let scenes = getScenes();
    let tops: Array<{ id: string; top: number }> = [];

    const recalc = () => {
      scenes = getScenes();
      tops = scenes.map((el) => ({
        id: el.getAttribute("data-scene") || "",
        top: el.offsetTop,
      }));
      tops.sort((a, b) => a.top - b.top);
    };

    const update = () => {
      if (!tops.length) recalc();

      const focusY = window.scrollY + window.innerHeight * 0.28;

      let idx = 0;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i].top <= focusY) idx = i;
      }

      const cur = tops[idx];
      const next = tops[idx + 1];

      const curTop = cur?.top ?? 0;
      const nextTop = next?.top ?? (curTop + window.innerHeight);

      const progRaw =
        nextTop > curTop ? (focusY - curTop) / (nextTop - curTop) : 0;
      const prog = clamp01(progRaw);

      // Curtains should be strongest near boundaries (prog near 0 or 1)
      // curtain = 1 at ends, 0 near middle
      const curtain = clamp01(Math.abs(prog - 0.5) * 2);

      root.style.setProperty("--tr-scene", String(idx));
      root.style.setProperty("--tr-sceneProg", String(prog));
      root.style.setProperty("--tr-curtain", String(curtain));

      if (cur?.id) {
        root.setAttribute("data-scene-active", cur.id);
        onActive?.(cur.id);
      }

      raf = requestAnimationFrame(update);
    };

    const onResize = () => recalc();

    recalc();
    raf = requestAnimationFrame(update);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled, onActive]);
}

function useInView<T extends HTMLElement>(opts?: IntersectionObserverInit) {
  const ref = React.useRef<T | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) el.setAttribute("data-inview", "true");
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

/* -------------------- main -------------------- */

export default function LandingPage() {
  const [theme, setTheme] = React.useState<ThemeKey>("hiphop");
  const [mood, setMood] = React.useState<MoodKey>("poster");
  const [laneKey, setLaneKey] =
    React.useState<(typeof LANES)[number]["key"]>("shows");

  const [sceneMode, setSceneMode] = React.useState(true);
  const [hardSnap, setHardSnap] = React.useState(false);
  const [activeScene, setActiveScene] = React.useState("hero");
  const [soundEnabled, setSoundEnabled] = React.useState(false);

  const reduced = usePrefersReducedMotion();
  useGlobalStageFX(!reduced);
  useSceneEngine(!reduced && sceneMode, (id) => setActiveScene(id));

  // toggle html data attributes for scene mode
  React.useEffect(() => {
    const root = document.documentElement;
    if (sceneMode) root.setAttribute("data-scene", "1");
    else root.removeAttribute("data-scene");
  }, [sceneMode]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (!sceneMode) {
      root.removeAttribute("data-snap");
      return;
    }
    if (hardSnap) root.setAttribute("data-snap", "hard");
    else root.removeAttribute("data-snap");
  }, [sceneMode, hardSnap]);

  const t = THEMES[theme];
  const m = MOODS[mood];
  const lane = LANES.find((l) => l.key === laneKey) ?? LANES[0];

  const themeStyle =
    {
      "--tr-a1": t.a1,
      "--tr-a2": t.a2,
      "--tr-a3": t.a3,
      "--tr-bg1": t.bg1,
      "--tr-bg2": t.bg2,

      "--tr-font-display": t.displayFontVar,
      "--tr-font-head": t.headFontVar,
      "--tr-font-body": "var(--font-sans)",

      "--tr-r-hero": m.rHero,
      "--tr-r-card": m.rCard,
      "--tr-r-chip": m.rChip,
      "--tr-border-style": m.borderStyle,
      "--tr-grain": m.grain,
      "--tr-angle": t.angle,
    } as React.CSSProperties;

  const scenes = [
    { id: "hero", label: "Intro" },
    { id: "proof", label: "Why" },
    { id: "lanes", label: "Lanes" },
    { id: "ladder", label: "Ladder" },
    { id: "sprint", label: "Sprint" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <main
      style={themeStyle}
      className="relative min-h-screen overflow-x-hidden bg-[color:var(--tr-bg1)] text-white"
    >
      <Backdrop />
      <CursorHalo />
      <div className="tr-curtains" />
      <TopTicker vibe={t.vibe} />

      <Nav
        theme={theme}
        setTheme={setTheme}
        mood={mood}
        setMood={setMood}
        sceneMode={sceneMode}
        setSceneMode={setSceneMode}
        hardSnap={hardSnap}
        setHardSnap={setHardSnap}
      />

      {sceneMode && (
        <SceneDots
          scenes={scenes}
          activeId={activeScene}
          onJump={(id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
        />
      )}

      {/* -------------------- SCENES -------------------- */}

      <section id="hero" data-scene="hero" className="mx-auto w-full max-w-6xl px-6 pt-10 md:pt-14">
        <Hero
          theme={t}
          moodLabel={m.label}
          sceneMode={sceneMode}
          hardSnap={hardSnap}
          setHardSnap={setHardSnap}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />
      </section>

      <section id="proof" data-scene="proof" className="mx-auto w-full max-w-6xl px-6 py-16">
        <SectionHead
          kicker="REALITY CHECK"
          title="Your music can be fire and you can still be broke."
          subtitle="Chicago Stage is built for the gap between ‘talent’ and ‘income.’"
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <Reveal>
            <PosterCard tag="PROBLEM" title="Streams ≠ rent" desc="Platforms reward attention. You need direct revenue." stamp="NO CAP" />
          </Reveal>
          <Reveal>
            <PosterCard tag="SHIFT" title="Pick one money lane" desc="Bookings, services, products, membership — choose one to run." stamp="FOCUS" />
          </Reveal>
          <Reveal>
            <PosterCard tag="SYSTEM" title="Execute → log → iterate" desc="We don’t promise viral. We build a loop that improves." stamp="REPEAT" />
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal className="h-full">
              <Card className="h-full p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Stage 1</Badge>
                  <Badge accent>Chicago</Badge>
                  <span className="text-xs text-white/55">
                    no streaming • no fake growth promises
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black tracking-tight md:text-3xl">
                  You don’t leave with motivation.
                  <span className="tr-display ml-2 text-[color:var(--tr-a3)]">
                    You leave with assets.
                  </span>
                </h3>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <MiniPad title="Revenue Diagnostic" desc="Find the leak. Fix the first thing." icon="01" />
                  <MiniPad title="Offer Architect" desc="What to sell + pricing ladder." icon="02" />
                  <MiniPad title="Execution Assets" desc="Offer copy + DMs + emails." icon="03" />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <MiniStat label="Time to value" value="5–15 minutes" sub="Snapshot → plan" />
                  <MiniStat label="Typical output" value="10–25 blocks" sub="scripts, headlines, cadence" />
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
              </Card>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <Card className="p-7 tr-noise">
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
                  <ListRow title="Weekly plan" value="20 DMs • 2 posts • 1 story sequence" />
                </div>

                <div className="mt-6 rounded-[var(--tr-r-chip)] border border-white/10 bg-black/35 p-4 tr-border">
                  <div className="text-xs text-white/60">No-cap promise</div>
                  <div className="mt-2 text-sm text-white/75">
                    We don’t do “go viral.” We do “get paid.”
                  </div>
                </div>
              </Card>
            </Reveal>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Reveal><Sticker title="Youthful vibe" desc="Street colors. Poster energy." /></Reveal>
              <Reveal><Sticker title="Serious outputs" desc="Copy, scripts, ladders, cadence." /></Reveal>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SectionHead
            kicker="GRAFFITI WALL"
            title="Objection killers (flip the cards)."
            subtitle="The stuff people say right before they stay broke."
          />
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {OBJECTIONS.map((c) => (
              <Reveal key={c.front}>
                <FlipCard front={c.front} back={c.back} accent={c.accent} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="lanes" data-scene="lanes" className="mx-auto w-full max-w-6xl px-6 pb-16">
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
                      "tr-card tr-tilt tr-border text-left border px-5 py-4 transition",
                      "rounded-[var(--tr-r-card)]",
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
                          "rounded-[var(--tr-r-chip)] border px-3 py-1 text-[11px] font-extrabold tr-border",
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
                          className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 tr-border"
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
              <Card className="h-full p-7 tr-noise">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/60">Generated sample</div>
                    <div className="mt-1 text-xl font-black tracking-tight">
                      {lane.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden rounded-[var(--tr-r-chip)] border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70 md:inline-flex tr-border">
                      copy/paste ready
                    </span>
                    <span className="rounded-[var(--tr-r-chip)] border border-white/12 bg-black/35 px-3 py-1 text-xs text-white/70 tr-border">
                      Chicago Stage
                    </span>
                  </div>
                </div>

                <pre className="mt-4 whitespace-pre-wrap rounded-[var(--tr-r-card)] border border-white/10 bg-black/45 p-4 text-[12px] leading-relaxed text-white/85 tr-border">
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
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="ladder" data-scene="ladder" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="OFFER LADDER BUILDER"
          title="Build a pricing ladder in 60 seconds."
          subtitle="This is the landing-page dopamine hit: tweak the ladder → copy/paste your rate card + DM pitch."
        />

        <Reveal className="mt-7">
          <OfferLadderBuilder defaultLane={laneKey} />
        </Reveal>
      </section>

      <section id="sprint" data-scene="sprint" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="THE 30-DAY SPRINT"
          title="Your rent doesn’t care about your ‘brand journey.’"
          subtitle="So we run a clean 4-week loop. Execute → measure → improve."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Reveal><SprintCard week="Week 1" title="Build the offer" items={["Snapshot", "Diagnostic", "Offer ladder", "Pricing"]} /></Reveal>
          <Reveal><SprintCard week="Week 2" title="Launch the outreach" items={["DM scripts", "Email sequence", "Booking pitch", "CTA & links"]} /></Reveal>
          <Reveal><SprintCard week="Week 3" title="Ship content + proof" items={["14-day content plan", "Proof angles", "Testimonials", "Follow-ups"]} /></Reveal>
          <Reveal><SprintCard week="Week 4" title="Iterate and scale" items={["Log results", "Adjust price", "Refine offer", "Second wave"]} /></Reveal>
        </div>

        <Reveal className="mt-6">
          <Card className="p-6">
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
          </Card>
        </Reveal>
      </section>

      <section id="pricing" data-scene="pricing" className="mx-auto w-full max-w-6xl px-6 pb-16">
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

      <section id="faq" data-scene="faq" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <SectionHead
          kicker="FAQ"
          title="Scope is clear. No confusion."
          subtitle="Chicago Stage is revenue architecture — not streaming, not discovery."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Reveal><Faq q="Is TruthRadeo a streaming platform?" a="No. Chicago Stage doesn’t host music. It builds a revenue plan + execution assets." /></Reveal>
          <Reveal><Faq q="Do I need Spotify/YouTube APIs?" a="No. You can paste links, but Chicago doesn’t require any external API to function." /></Reveal>
          <Reveal><Faq q="What happens after I sign up?" a="Go to Dashboard → complete the Creator Snapshot → get outputs." /></Reveal>
          <Reveal><Faq q="What does “lifetime” mean?" a="Lifetime access to Stage 1 (Chicago). Future stages are separate." /></Reveal>
        </div>

        <Reveal className="mt-8">
          <Card className="p-7 tr-noise">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="tr-display text-[color:var(--tr-a1)] text-xl">
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
          </Card>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}

/* -------------------- UI: background layers -------------------- */

function Backdrop() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 tr-stagebg" />
      <div className="pointer-events-none fixed inset-0 -z-10 tr-scenestripes" />
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

/* -------------------- Top ticker + nav -------------------- */

function TopTicker({ vibe }: { vibe: string }) {
  return (
    <div className="border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-2">
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-2 rounded-[var(--tr-r-chip)] border border-white/15 bg-white/5 px-3 py-1 tr-border">
            <span className="h-2 w-2 rounded-full bg-[color:var(--tr-a1)]" />
            <span className="font-extrabold text-white/85">NOW PLAYING</span>
            <span className="text-white/30">•</span>
            <span className="font-semibold">Chicago Stage</span>
          </span>
          <span className="hidden md:inline">{vibe}</span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 tr-border">
            no streaming
          </span>
          <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 tr-border">
            assets-first
          </span>
          <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 tr-border">
            iteration loop
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

function Nav({
  theme,
  setTheme,
  mood,
  setMood,
  sceneMode,
  setSceneMode,
  hardSnap,
  setHardSnap,
}: {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
  mood: MoodKey;
  setMood: (m: MoodKey) => void;
  sceneMode: boolean;
  setSceneMode: (v: boolean) => void;
  hardSnap: boolean;
  setHardSnap: (v: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-[var(--tr-r-chip)] border border-white/15 bg-white/5 tr-border">
            <div className="absolute inset-0 animate-[tr_float_7s_ease-in-out_infinite] bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--tr-a2)_35%,transparent),transparent_55%),radial-gradient(circle_at_80%_60%,color-mix(in_oklab,var(--tr-a1)_30%,transparent),transparent_55%),radial-gradient(circle_at_55%_90%,color-mix(in_oklab,var(--tr-a3)_22%,transparent),transparent_55%)]" />
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
          <a className="hover:text-white" href="#ladder">Ladder</a>
          <a className="hover:text-white" href="#pricing">Pricing</a>
          <a className="hover:text-white" href="#faq">FAQ</a>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <GenreSwitch theme={theme} setTheme={setTheme} />
          <MoodSwitch mood={mood} setMood={setMood} />

          <button
            type="button"
            onClick={() => setSceneMode(!sceneMode)}
            className={cn(
              "rounded-[var(--tr-r-chip)] border px-3 py-2 text-xs font-extrabold tr-border",
              sceneMode ? "border-white/25 bg-white/10" : "border-white/12 bg-black/30 hover:bg-black/45"
            )}
            title="Scene Mode enables scroll-snap + stage transitions"
          >
            {sceneMode ? "Scene: ON" : "Scene: OFF"}
          </button>

          <button
            type="button"
            onClick={() => setHardSnap(!hardSnap)}
            className={cn(
              "hidden md:inline-flex rounded-[var(--tr-r-chip)] border px-3 py-2 text-xs font-extrabold tr-border",
              !sceneMode
                ? "border-white/10 bg-white/5 text-white/40"
                : hardSnap
                ? "border-white/25 bg-white/10"
                : "border-white/12 bg-black/30 hover:bg-black/45"
            )}
            disabled={!sceneMode}
            title="Hard snap = mandatory snapping"
          >
            {hardSnap ? "Snap: HARD" : "Snap: SOFT"}
          </button>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-[var(--tr-r-chip)] border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 tr-border">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="tr-sheen rounded-[var(--tr-r-chip)] bg-white px-4 py-2 text-sm font-extrabold text-black hover:bg-white/90">
                Start free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden rounded-[var(--tr-r-chip)] border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 md:inline-flex tr-border"
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

function GenreSwitch({ theme, setTheme }: { theme: ThemeKey; setTheme: (t: ThemeKey) => void }) {
  return (
    <div className="hidden items-center gap-2 rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 p-1 md:flex tr-border">
      {(Object.keys(THEMES) as ThemeKey[]).map((k) => {
        const active = k === theme;
        return (
          <button
            key={k}
            type="button"
            onClick={() => setTheme(k)}
            className={cn(
              "rounded-[var(--tr-r-chip)] px-3 py-2 text-xs font-extrabold transition",
              active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {THEMES[k].label}
          </button>
        );
      })}
    </div>
  );
}

function MoodSwitch({ mood, setMood }: { mood: MoodKey; setMood: (m: MoodKey) => void }) {
  return (
    <div className="hidden items-center gap-2 rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 p-1 md:flex tr-border">
      {(Object.keys(MOODS) as MoodKey[]).map((k) => {
        const active = k === mood;
        return (
          <button
            key={k}
            type="button"
            onClick={() => setMood(k)}
            className={cn(
              "rounded-[var(--tr-r-chip)] px-3 py-2 text-xs font-extrabold transition",
              active ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            {MOODS[k].label}
          </button>
        );
      })}
    </div>
  );
}

function SceneDots({
  scenes,
  activeId,
  onJump,
}: {
  scenes: Array<{ id: string; label: string }>;
  activeId: string;
  onJump: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex">
      {scenes.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onJump(s.id)}
            className={cn(
              "h-3 w-3 rounded-full border transition",
              active
                ? "border-white/60 bg-[color:var(--tr-a1)]"
                : "border-white/20 bg-black/40 hover:border-white/40"
            )}
            title={s.label}
          />
        );
      })}
    </div>
  );
}

/* -------------------- Hero -------------------- */

function Hero({
  theme,
  moodLabel,
  sceneMode,
  hardSnap,
  setHardSnap,
  soundEnabled,
  setSoundEnabled,
}: {
  theme: { label: string; poster: string; vibe: string };
  moodLabel: string;
  sceneMode: boolean;
  hardSnap: boolean;
  setHardSnap: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
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
    <div
      ref={heroRef}
      className={cn(
        "tr-noise tr-hero relative overflow-hidden border border-white/10 bg-black/35 tr-border",
        "rounded-[var(--tr-r-hero)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:conic-gradient(from_180deg_at_50%_50%,color-mix(in_oklab,var(--tr-a2)_35%,transparent),color-mix(in_oklab,var(--tr-a1)_35%,transparent),color-mix(in_oklab,var(--tr-a3)_35%,transparent),color-mix(in_oklab,var(--tr-a2)_35%,transparent))] animate-[tr_spin_16s_linear_infinite]" />
      <div className="pointer-events-none absolute inset-[2px] rounded-[calc(var(--tr-r-hero)-0.15rem)] bg-[color:var(--tr-bg2)] opacity-90" />

      <div className="pointer-events-none absolute -left-6 top-10 rotate-[-8deg] animate-[tr_float_7s_ease-in-out_infinite] rounded-[var(--tr-r-chip)] border border-white/15 bg-black/45 px-4 py-3 text-xs font-extrabold tracking-wide text-white/80 tr-border">
        <span className="tr-display text-[color:var(--tr-a2)]">NO VIRAL</span> • JUST CASH
      </div>

      <div className="pointer-events-none absolute -right-8 top-14 rotate-[10deg] animate-[tr_float_8s_ease-in-out_infinite] rounded-[999px] border border-white/15 bg-white/5 px-5 py-3 text-xs font-extrabold text-white/80 tr-border">
        <span className="text-[color:var(--tr-a1)]">STAGE 1</span> CHICAGO
      </div>

      <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-[var(--tr-r-chip)] border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 tr-border">
              <span className="h-2 w-2 rounded-full bg-[color:var(--tr-a1)]" />
              <span className="font-extrabold text-white/85">LIVE</span>
              <span className="text-white/30">•</span>
              <span className="font-semibold">Stage 1</span>
              <span className="text-white/30">•</span>
              <span className="font-semibold">Chicago</span>
            </span>

            <span className="rounded-[var(--tr-r-chip)] border border-white/12 bg-black/30 px-3 py-1 text-xs text-white/70 tr-border">
              {theme.label} • {moodLabel}
            </span>

            <span className="ml-auto hidden rounded-[var(--tr-r-chip)] border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70 md:inline-flex tr-border">
              {sceneMode ? (hardSnap ? "scene mode • hard snap" : "scene mode • soft snap") : "scene mode off"}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
            <span className="tr-display inline-block text-[color:var(--tr-a2)]">
              Get paid
            </span>{" "}
            with your music.
            <span className="text-white/70"> (For real.)</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            {theme.poster} TruthRadeo turns your creator reality into an offer,
            pricing ladder, scripts, and a 30-day plan — then gives you an
            iteration loop.
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

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/60">
            <Pill>booking scripts</Pill>
            <Pill>offer page copy</Pill>
            <Pill>DM follow-ups</Pill>
            <Pill>email sequence</Pill>
            <Pill>pricing ladder</Pill>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "ml-1 rounded-[var(--tr-r-chip)] border px-3 py-1 font-extrabold tr-border",
                soundEnabled ? "border-white/25 bg-white/10" : "border-white/10 bg-black/35 hover:bg-black/45"
              )}
              title="Optional Web Audio vibe (used in Ladder Builder)"
            >
              sound {soundEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <MixtapeCard />
        </div>
      </div>
    </div>
  );
}

/* -------------------- Offer Ladder Builder -------------------- */

function OfferLadderBuilder({ defaultLane }: { defaultLane: (typeof LANES)[number]["key"] }) {
  const [lane, setLane] = React.useState(defaultLane);
  const [base, setBase] = React.useState(149);
  const [proMult, setProMult] = React.useState(1.7);
  const [premMult, setPremMult] = React.useState(2.7);
  const [turnaround, setTurnaround] = React.useState<"48hr" | "72hr" | "7d">("48hr");
  const [revisions, setRevisions] = React.useState(2);
  const [slots, setSlots] = React.useState(3);
  const [includeContract, setIncludeContract] = React.useState(true);

  const [soundOn, setSoundOn] = React.useState(false);
  const ctxRef = React.useRef<AudioContext | null>(null);

  const round5 = (n: number) => Math.round(n / 5) * 5;
  const starter = round5(base);
  const pro = round5(base * proMult);
  const premium = round5(base * premMult);

  const laneLabel = LANES.find((l) => l.key === lane)?.title ?? "Lane";

  const turnaroundLabel =
    turnaround === "48hr" ? "48 hours" : turnaround === "72hr" ? "72 hours" : "7 days";

  const rateCard = [
    `RATE CARD — ${laneLabel}`,
    ``,
    `Starter — $${starter}`,
    `• turnaround: ${turnaroundLabel}`,
    `• revisions: ${revisions}`,
    includeContract ? `• includes: scope + terms` : `• includes: scope`,
    ``,
    `Pro — $${pro}`,
    `• faster delivery + priority`,
    `• revisions: ${Math.max(revisions, 2)}`,
    `• add: alt versions / stems / polish`,
    ``,
    `Premium — $${premium}`,
    `• best result + most attention`,
    `• revisions: ${Math.max(revisions, 3)}`,
    `• add: extras + consultation`,
  ].join("\n");

  const dmScript = [
    `DM SCRIPT (copy/paste)`,
    ``,
    `Yo — if you want ${laneLabel.toLowerCase()} done clean + fast, I have ${slots} slots this week.`,
    `Starter starts at $${starter}. Pro is $${pro}. Premium is $${premium}.`,
    `Want me to send the details + pay link?`,
  ].join("\n");

  const offerPage = [
    `OFFER PAGE COPY (short)`,
    ``,
    `Headline: Get a pro result without the chaos.`,
    `Subhead: Fast turnaround, clear revisions, clean handoff.`,
    ``,
    `Packages`,
    `• Starter $${starter} — ${turnaroundLabel} — ${revisions} revisions`,
    `• Pro $${pro} — priority — ${Math.max(revisions, 2)} revisions`,
    `• Premium $${premium} — best result — ${Math.max(revisions, 3)} revisions`,
    ``,
    `CTA: Book a slot → (pay link)`,
  ].join("\n");

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const hit = (freq: number) => {
    if (!soundOn) return;
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    if (!ctxRef.current) ctxRef.current = new AudioCtx();
    const ctx = ctxRef.current!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  };

  return (
    <div className="tr-card tr-noise tr-border rounded-[var(--tr-r-hero)] border border-white/10 bg-black/35 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-white/60">interactive mini-tool</div>
          <div className="mt-1 text-xl font-black tracking-tight">
            Ladder Builder
          </div>
          <div className="mt-1 text-sm text-white/70">
            Choose your lane → set a base → TruthRadeo-style ladder appears.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSoundOn((v) => !v)}
          className={cn(
            "rounded-[var(--tr-r-chip)] border px-3 py-2 text-xs font-extrabold tr-border",
            soundOn ? "border-white/25 bg-white/10" : "border-white/12 bg-black/30 hover:bg-black/45"
          )}
          title="Optional synth hits"
        >
          sound {soundOn ? "ON" : "OFF"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="grid gap-3">
            <LabelRow label="Lane">
              <select
                value={lane}
                onChange={(e) => {
                  setLane(e.target.value as any);
                  hit(220);
                }}
                className="w-full rounded-[var(--tr-r-chip)] border border-white/10 bg-black/45 px-3 py-2 text-sm text-white tr-border"
              >
                {LANES.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.title}
                  </option>
                ))}
              </select>
            </LabelRow>

            <LabelRow label="Base price">
              <input
                type="number"
                value={base}
                min={10}
                onChange={(e) => {
                  setBase(Number(e.target.value || 0));
                  hit(110);
                }}
                className="w-full rounded-[var(--tr-r-chip)] border border-white/10 bg-black/45 px-3 py-2 text-sm text-white tr-border"
              />
            </LabelRow>

            <LabelRow label={`Pro multiplier (${proMult.toFixed(2)}×)`}>
              <input
                type="range"
                min={1.2}
                max={2.5}
                step={0.05}
                value={proMult}
                onChange={(e) => {
                  setProMult(Number(e.target.value));
                  hit(440);
                }}
                className="w-full"
              />
            </LabelRow>

            <LabelRow label={`Premium multiplier (${premMult.toFixed(2)}×)`}>
              <input
                type="range"
                min={2.0}
                max={4.0}
                step={0.05}
                value={premMult}
                onChange={(e) => {
                  setPremMult(Number(e.target.value));
                  hit(660);
                }}
                className="w-full"
              />
            </LabelRow>

            <LabelRow label="Turnaround">
              <div className="flex flex-wrap gap-2">
                {(["48hr", "72hr", "7d"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setTurnaround(v);
                      hit(330);
                    }}
                    className={cn(
                      "rounded-[var(--tr-r-chip)] border px-3 py-2 text-xs font-extrabold tr-border",
                      v === turnaround
                        ? "border-white/25 bg-white/10"
                        : "border-white/10 bg-black/30 hover:bg-black/45"
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </LabelRow>

            <LabelRow label={`Revisions (${revisions})`}>
              <input
                type="range"
                min={0}
                max={6}
                step={1}
                value={revisions}
                onChange={(e) => {
                  setRevisions(Number(e.target.value));
                  hit(520);
                }}
                className="w-full"
              />
            </LabelRow>

            <LabelRow label={`Slots this week (${slots})`}>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={slots}
                onChange={(e) => {
                  setSlots(Number(e.target.value));
                  hit(72);
                }}
                className="w-full"
              />
            </LabelRow>

            <label className="mt-1 flex items-center gap-2 text-sm text-white/75">
              <input
                type="checkbox"
                checked={includeContract}
                onChange={() => {
                  setIncludeContract((v) => !v);
                  hit(880);
                }}
              />
              Include scope + terms (cleaner clients)
            </label>

            <div className="mt-3 grid gap-2">
              <Link
                href="/dashboard"
                className="rounded-[var(--tr-r-chip)] bg-white px-4 py-3 text-center text-sm font-extrabold text-black hover:bg-white/90"
              >
                Make this “official” in the Dashboard
              </Link>
              <div className="text-xs text-white/55">
                Landing tool is for hype + clarity. Dashboard generates the full asset pack.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="grid gap-4">
            <OutputBlock
              title="Rate Card"
              subtitle="Post this. DM this. Put it in your bio link."
              text={rateCard}
              onCopy={() => copy(rateCard)}
            />
            <OutputBlock
              title="DM Pitch"
              subtitle="Short, confident, slot-based."
              text={dmScript}
              onCopy={() => copy(dmScript)}
            />
            <OutputBlock
              title="Offer Page Copy"
              subtitle="Short landing copy (you can expand later)."
              text={offerPage}
              onCopy={() => copy(offerPage)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LabelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--tr-r-card)] border border-white/10 bg-black/30 p-4 tr-border">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function OutputBlock({
  title,
  subtitle,
  text,
  onCopy,
}: {
  title: string;
  subtitle: string;
  text: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-[var(--tr-r-card)] border border-white/10 bg-black/35 p-5 tr-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="mt-1 text-xs text-white/60">{subtitle}</div>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-[var(--tr-r-chip)] border border-white/12 bg-white/5 px-3 py-2 text-xs font-extrabold hover:bg-white/10 tr-border"
        >
          Copy
        </button>
      </div>

      <pre className="mt-4 whitespace-pre-wrap rounded-[var(--tr-r-chip)] border border-white/10 bg-black/55 p-4 text-[12px] leading-relaxed text-white/85 tr-border">
        {text}
      </pre>
    </div>
  );
}

/* -------------------- components -------------------- */

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "tr-card tr-tilt tr-border relative overflow-hidden border border-white/10 bg-white/5",
        "rounded-[var(--tr-r-card)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_10%_10%,color-mix(in_oklab,var(--tr-a1)_30%,transparent),transparent_55%),radial-gradient(circle_at_90%_20%,color-mix(in_oklab,var(--tr-a2)_28%,transparent),transparent_55%),radial-gradient(circle_at_50%_95%,color-mix(in_oklab,var(--tr-a3)_22%,transparent),transparent_60%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function SectionHead({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-[var(--tr-r-chip)] border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70 tr-border">
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

function Badge({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-3 py-1 text-[11px] font-extrabold tracking-wide tr-border",
        "rounded-[var(--tr-r-chip)]",
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
    <button className="tr-btn relative overflow-hidden rounded-[var(--tr-r-chip)] px-5 py-3 text-sm font-extrabold text-black">
      <span className="absolute inset-0 bg-[linear-gradient(90deg,var(--tr-a1),var(--tr-a3),var(--tr-a2))] animate-[tr_shift_7s_linear_infinite]" />
      <span className="absolute inset-[2px] rounded-[var(--tr-r-chip)] bg-white" />
      <span className="relative">{children}</span>
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="tr-btn rounded-[var(--tr-r-chip)] border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 tr-border">
      {children}
    </button>
  );
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="tr-btn rounded-[var(--tr-r-chip)] border border-white/10 bg-black/40 px-5 py-3 text-sm text-white/80 hover:bg-black/50 tr-border">
      {children}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-black/35 px-3 py-1 tr-border">
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
    <div className="tr-card tr-tilt tr-border rounded-[var(--tr-r-card)] border border-white/10 bg-black/35 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
  );
}

function PosterCard({ tag, title, desc, stamp }: { tag: string; title: string; desc: string; stamp: string }) {
  return (
    <div className="tr-card tr-tilt tr-border rounded-[var(--tr-r-card)] border border-white/10 bg-black/35 p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-xs font-extrabold text-white/80 tr-border">
          {tag}
        </span>
        <span className="tr-display rotate-[-6deg] text-[color:var(--tr-a3)]">
          {stamp}
        </span>
      </div>
      <div className="mt-4 text-xl font-black tracking-tight">{title}</div>
      <div className="mt-2 text-sm text-white/70">{desc}</div>
    </div>
  );
}

function MiniPad({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="tr-card tr-tilt tr-border rounded-[var(--tr-r-card)] border border-white/10 bg-black/30 p-5 hover:border-white/20 hover:bg-black/45">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">{title}</div>
          <div className="mt-1 text-xs text-white/60">{desc}</div>
        </div>
        <div className="tr-display rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 tr-border">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="tr-card tr-tilt tr-border rounded-[var(--tr-r-card)] border border-white/10 bg-black/30 p-5">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-black">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

function Sticker({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="tr-card tr-tilt tr-border rounded-[var(--tr-r-card)] border border-white/10 bg-white/5 p-5">
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-xs text-white/60">{desc}</div>
    </div>
  );
}

function ListRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[var(--tr-r-chip)] border border-white/10 bg-black/35 p-4 tr-border">
      <div className="text-xs text-white/55">{title}</div>
      <div className="text-xs font-semibold text-white/80">{value}</div>
    </div>
  );
}

function FlipCard({ front, back, accent }: { front: string; back: string; accent: "a1" | "a2" | "a3" }) {
  const accentColor =
    accent === "a1" ? "var(--tr-a1)" : accent === "a2" ? "var(--tr-a2)" : "var(--tr-a3)";

  return (
    <div className="tr-flipgroup relative h-[210px]">
      <div className="tr-flipcard absolute inset-0 rounded-[var(--tr-r-card)] border border-white/10 bg-black/35 p-6 tr-border">
        <div className="text-xs text-white/60">tap / hover</div>
        <div className="mt-4 tr-display text-2xl leading-tight" style={{ color: accentColor }}>
          {front}
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-white/55">
          <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 tr-border">
            objection
          </span>
          <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 tr-border">
            flip
          </span>
        </div>
      </div>

      <div className="tr-flipback absolute inset-0 rounded-[var(--tr-r-card)] border border-white/10 bg-white/5 p-6 tr-border">
        <div className="text-xs text-white/60">answer</div>
        <pre className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-white/85">
          {back}
        </pre>
        <div className="absolute bottom-6 left-6 right-6 text-xs text-white/55">
          <span className="inline-flex items-center gap-2 rounded-[var(--tr-r-chip)] border border-white/10 bg-black/35 px-3 py-1 tr-border">
            <span className="h-2 w-2 rounded-full" style={{ background: accentColor }} />
            deploy tonight
          </span>
        </div>
      </div>
    </div>
  );
}

function SprintCard({ week, title, items }: { week: string; title: string; items: string[] }) {
  return (
    <div className="tr-card tr-tilt tr-border rounded-[var(--tr-r-card)] border border-white/10 bg-black/35 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="tr-display text-sm text-[color:var(--tr-a1)]">{week}</div>
        <div className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 tr-border">
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
        "tr-card tr-tilt tr-border relative overflow-hidden rounded-[var(--tr-r-card)] border p-7",
        featured ? "border-white/25 bg-black/55" : "border-white/10 bg-black/35"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-white/60">{vibe}</div>
          <div className="mt-1 text-xl font-black tracking-tight">{name}</div>
        </div>
        {featured ? (
          <span className="rounded-[var(--tr-r-chip)] border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white tr-border">
            MOST POPULAR
          </span>
        ) : (
          <span className="rounded-[var(--tr-r-chip)] border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-extrabold text-white/75 tr-border">
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
            "inline-flex w-full items-center justify-center rounded-[var(--tr-r-chip)] px-4 py-3 text-sm font-extrabold tr-border",
            featured
              ? "bg-white text-black hover:bg-white/90"
              : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
          )}
        >
          Choose {name}
        </Link>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="tr-card tr-tilt tr-border rounded-[var(--tr-r-card)] border border-white/10 bg-black/35 p-6">
      <div className="text-sm font-extrabold">{q}</div>
      <div className="mt-2 text-sm text-white/70">{a}</div>
    </div>
  );
}

function MixtapeCard() {
  return (
    <div className="tr-card tr-tilt tr-border relative overflow-hidden rounded-[var(--tr-r-card)] border border-white/10 bg-white/5 p-6">
      <div className="text-xs text-white/60">Mixtape card</div>
      <div className="mt-1 text-xl font-extrabold tracking-tight">
        Snapshot → Cash Plan
      </div>
      <div className="mt-2 text-sm text-white/70">
        Get a plan that fits your real time + audience.
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
            <button className="tr-sheen w-full rounded-[var(--tr-r-chip)] bg-white px-4 py-3 text-sm font-extrabold text-black hover:bg-white/90">
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
            className="block w-full rounded-[var(--tr-r-chip)] bg-white px-4 py-3 text-center text-sm font-extrabold text-black hover:bg-white/90"
          >
            Continue in Dashboard
          </Link>
          <div className="mt-2 text-center text-xs text-white/50">
            your snapshot is saved
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

function Track({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[var(--tr-r-chip)] border border-white/10 bg-black/35 p-4 hover:bg-black/45 tr-border">
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