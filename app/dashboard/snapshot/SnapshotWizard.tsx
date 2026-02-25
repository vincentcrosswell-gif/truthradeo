"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Snapshot = {
  artistName: string;
  cityArea: string; // "City, State"
  genre: string;
  vibeTags: string;
  primaryGoal: string;

  spotify: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  website: string;

  audienceSize: string; // range bucket
  emailList: string; // range bucket
  monthlyListeners: string; // range bucket

  currentIncomeStreams: string;
  currentOffer: string;
  priceRange: string; // range bucket

  upcomingRelease: string;
  performanceFrequency: string; // dropdown
  collabTargets: string;

  biggestBlocker: string; // dropdown or other
};

const STORAGE_KEY = "truthradeo_chicago_snapshot_v1";

const steps = [
  { id: "identity", label: "Identity" },
  { id: "links", label: "Links" },
  { id: "audience", label: "Audience" },
  { id: "revenue", label: "Revenue" },
  { id: "momentum", label: "Momentum" },
  { id: "blockers", label: "Blockers" },
] as const;

type StepId = (typeof steps)[number]["id"];

const STEP_META: Record<
  StepId,
  {
    station: string;
    subtitle: string;
    helper: string;
    accentBar: string;
    accentSoft: string;
    accentRing: string;
    badgeTone: "emerald" | "cyan" | "amber" | "pink" | "rose" | "indigo";
  }
> = {
  identity: {
    station: "Clark/Lake",
    subtitle: "Artist identity + city signal",
    helper:
      "Start the route with who you are, where you’re based, and what kind of energy you bring.",
    accentBar: "from-emerald-400 to-lime-400",
    accentSoft:
      "from-emerald-400/14 via-lime-400/10 to-transparent border-emerald-300/10",
    accentRing: "ring-emerald-300/20",
    badgeTone: "emerald",
  },
  links: {
    station: "Lakefront",
    subtitle: "Platform links + presence map",
    helper:
      "Drop your public links so Chicago can build smarter diagnostics and execution assets later.",
    accentBar: "from-cyan-400 to-blue-500",
    accentSoft:
      "from-cyan-400/14 via-blue-500/10 to-transparent border-cyan-300/10",
    accentRing: "ring-cyan-300/20",
    badgeTone: "cyan",
  },
  audience: {
    station: "UIC-Halsted",
    subtitle: "Audience size + capture",
    helper:
      "Use rough buckets — speed matters more than perfect numbers right now.",
    accentBar: "from-indigo-400 to-sky-400",
    accentSoft:
      "from-indigo-400/14 via-sky-400/10 to-transparent border-indigo-300/10",
    accentRing: "ring-indigo-300/20",
    badgeTone: "indigo",
  },
  revenue: {
    station: "Merch Mart",
    subtitle: "Current income + pricing",
    helper:
      "Tell Chicago how money is currently moving (or not moving) so the next offer can be realistic.",
    accentBar: "from-amber-300 to-orange-500",
    accentSoft:
      "from-amber-300/14 via-orange-500/10 to-transparent border-amber-300/10",
    accentRing: "ring-amber-300/20",
    badgeTone: "amber",
  },
  momentum: {
    station: "River North",
    subtitle: "Release rhythm + performance frequency",
    helper:
      "Momentum is your heartbeat. Even one upcoming move is enough to start the engine.",
    accentBar: "from-fuchsia-400 to-pink-500",
    accentSoft:
      "from-fuchsia-400/14 via-pink-500/10 to-transparent border-fuchsia-300/10",
    accentRing: "ring-fuchsia-300/20",
    badgeTone: "pink",
  },
  blockers: {
    station: "South Loop",
    subtitle: "Main friction point",
    helper:
      "Choose the loudest blocker. Chicago will use this to shape your roadmap and execution recommendations.",
    accentBar: "from-rose-400 to-red-500",
    accentSoft:
      "from-rose-400/14 via-red-500/10 to-transparent border-rose-300/10",
    accentRing: "ring-rose-300/20",
    badgeTone: "rose",
  },
};

/** -----------------------------
 *  Options
 *  -----------------------------
 */
const GENRE_OPTIONS = [
  "Hip-Hop / Rap",
  "Drill",
  "R&B",
  "Pop",
  "House",
  "EDM",
  "Indie",
  "Rock",
  "Jazz",
  "Gospel",
  "Afrobeats",
  "Latin",
  "Country",
  "Alternative",
  "Other",
];

const GOAL_OPTIONS = [
  "Book more shows / gigs",
  "Sell more merch",
  "Sell beats / production",
  "Sell features / verses",
  "Grow streams / listeners",
  "Build an email list / fanbase",
  "Launch a paid offer / membership",
  "Land brand deals / sponsorships",
  "Other",
];

const RANGE_OPTIONS = [
  "0–99",
  "100–499",
  "500–999",
  "1k–4.9k",
  "5k–9.9k",
  "10k–24.9k",
  "25k–49.9k",
  "50k–99.9k",
  "100k+",
];

const EMAIL_OPTIONS = ["0", "1–49", "50–199", "200–499", "500–999", "1k–4.9k", "5k+"];

const PRICE_OPTIONS = [
  "$0 (not selling yet)",
  "$1–$25",
  "$26–$50",
  "$51–$100",
  "$101–$150",
  "$151–$300",
  "$301–$500",
  "$500+",
];

const PERFORMANCE_OPTIONS = [
  "Not performing right now",
  "1 show per quarter",
  "1 show per month",
  "2–3 shows per month",
  "Weekly",
  "Multiple times per week",
];

const BLOCKER_OPTIONS = [
  "No clear offer",
  "Inconsistent releases",
  "Low engagement",
  "No audience capture (email/SMS)",
  "No booking strategy",
  "No content strategy",
  "No time / burnout",
  "No budget",
  "No team / collaborators",
  "Other",
];

const STEP_FIELDS: Record<StepId, (keyof Snapshot)[]> = {
  identity: ["artistName", "cityArea", "genre", "vibeTags", "primaryGoal"],
  links: ["spotify", "youtube", "instagram", "tiktok", "website"],
  audience: ["audienceSize", "emailList", "monthlyListeners"],
  revenue: ["currentIncomeStreams", "currentOffer", "priceRange"],
  momentum: ["upcomingRelease", "performanceFrequency", "collabTargets"],
  blockers: ["biggestBlocker"],
};

const VIBE_PRESETS = [
  "gritty",
  "late-night",
  "club energy",
  "soulful",
  "DIY",
  "melodic",
  "raw",
  "uplifting",
  "street",
  "experimental",
];

function inList(value: string, list: string[]) {
  const v = (value || "").trim();
  return list.includes(v);
}

function isFilled(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function normalizeUrl(value: string) {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return `https://${v}`;
}

export default function SnapshotWizard() {
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [savedToast, setSavedToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [flashStep, setFlashStep] = useState<StepId | null>(null);

  const emptySnapshot: Snapshot = {
    artistName: "",
    cityArea: "",

    genre: "",
    vibeTags: "",
    primaryGoal: "",

    spotify: "",
    youtube: "",
    instagram: "",
    tiktok: "",
    website: "",

    audienceSize: "",
    emailList: "",
    monthlyListeners: "",

    currentIncomeStreams: "",
    currentOffer: "",
    priceRange: "",

    upcomingRelease: "",
    performanceFrequency: "",
    collabTargets: "",

    biggestBlocker: "",
  };

  const [data, setData] = useState<Snapshot>(emptySnapshot);

  // "Other" UI state
  const [genreChoice, setGenreChoice] = useState<string>("");
  const [genreOther, setGenreOther] = useState<string>("");

  const [goalChoice, setGoalChoice] = useState<string>("");
  const [goalOther, setGoalOther] = useState<string>("");

  const [blockerChoice, setBlockerChoice] = useState<string>("");
  const [blockerOther, setBlockerOther] = useState<string>("");

  const step = steps[stepIndex];
  const stepMeta = STEP_META[step.id];

  // Load local draft
  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setData((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore corrupted local drafts
    }
  }, []);

  // Derive "Other" state from current data
  useEffect(() => {
    if (data.genre) {
      if (inList(data.genre, GENRE_OPTIONS)) {
        setGenreChoice(data.genre);
        setGenreOther("");
      } else {
        setGenreChoice("Other");
        setGenreOther(data.genre);
      }
    } else {
      setGenreChoice("");
      setGenreOther("");
    }

    if (data.primaryGoal) {
      if (inList(data.primaryGoal, GOAL_OPTIONS)) {
        setGoalChoice(data.primaryGoal);
        setGoalOther("");
      } else {
        setGoalChoice("Other");
        setGoalOther(data.primaryGoal);
      }
    } else {
      setGoalChoice("");
      setGoalOther("");
    }

    if (data.biggestBlocker) {
      if (inList(data.biggestBlocker, BLOCKER_OPTIONS)) {
        setBlockerChoice(data.biggestBlocker);
        setBlockerOther("");
      } else {
        setBlockerChoice("Other");
        setBlockerOther(data.biggestBlocker);
      }
    } else {
      setBlockerChoice("");
      setBlockerOther("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.genre, data.primaryGoal, data.biggestBlocker]);

  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / steps.length) * 100),
    [stepIndex]
  );

  const completionByStep = useMemo(() => {
    const result: Record<StepId, { filled: number; total: number; percent: number }> = {
      identity: { filled: 0, total: STEP_FIELDS.identity.length, percent: 0 },
      links: { filled: 0, total: STEP_FIELDS.links.length, percent: 0 },
      audience: { filled: 0, total: STEP_FIELDS.audience.length, percent: 0 },
      revenue: { filled: 0, total: STEP_FIELDS.revenue.length, percent: 0 },
      momentum: { filled: 0, total: STEP_FIELDS.momentum.length, percent: 0 },
      blockers: { filled: 0, total: STEP_FIELDS.blockers.length, percent: 0 },
    };

    (Object.keys(STEP_FIELDS) as StepId[]).forEach((id) => {
      const fields = STEP_FIELDS[id];
      const filled = fields.reduce((count, key) => count + (isFilled(data[key]) ? 1 : 0), 0);
      result[id] = {
        filled,
        total: fields.length,
        percent: Math.round((filled / fields.length) * 100),
      };
    });

    return result;
  }, [data]);

  const totalFilledFields = useMemo(() => {
    const allFields = Object.values(STEP_FIELDS).flat();
    return allFields.reduce((count, key) => count + (isFilled(data[key]) ? 1 : 0), 0);
  }, [data]);

  const totalFieldCount = Object.values(STEP_FIELDS).flat().length;
  const overallDraftPercent = Math.round((totalFilledFields / totalFieldCount) * 100);

  function update<K extends keyof Snapshot>(key: K, value: Snapshot[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 1200);
  }

  async function saveToServer() {
    setServerError(null);

    const res = await fetch("/api/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let msg = "Could not save snapshot to server.";
      try {
        const j = await res.json();
        if (j?.error) msg = String(j.error);
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return res.json();
  }

  async function resetSnapshot() {
    if (isSubmitting) return;

    const ok = window.confirm(
      "Reset your Snapshot?\n\nThis deletes your saved Snapshot from the database (Chicago Pulse) and clears your local draft."
    );
    if (!ok) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/snapshot/reset", { method: "POST" });
      if (!res.ok) {
        let msg = "Could not reset snapshot.";
        try {
          const j = await res.json();
          if (j?.error) msg = String(j.error);
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      localStorage.removeItem(STORAGE_KEY);

      setStepIndex(0);
      setData(emptySnapshot);

      setGenreChoice("");
      setGenreOther("");
      setGoalChoice("");
      setGoalOther("");
      setBlockerChoice("");
      setBlockerOther("");

      setSavedToast(false);
      setFlashStep(null);
      router.refresh();
    } catch (e: any) {
      setServerError(e?.message ?? "Reset failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function celebrateCurrentStep() {
    setFlashStep(step.id);
    window.setTimeout(() => setFlashStep(null), 800);
  }

  function next() {
    saveLocal();
    celebrateCurrentStep();
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setServerError(null);

    try {
      saveLocal();
      celebrateCurrentStep();
      await saveToServer();
      router.push("/dashboard/snapshot/summary");
    } catch (e: any) {
      setServerError(e?.message ?? "Something went wrong saving your snapshot.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function addVibePreset(tag: string) {
    const current = data.vibeTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (current.some((v) => v.toLowerCase() === tag.toLowerCase())) return;

    const nextTags = [...current, tag];
    update("vibeTags", nextTags.join(", "));
  }

  const vibePreview = data.vibeTags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

  const routeCompletedCount = (Object.keys(completionByStep) as StepId[]).filter(
    (id) => completionByStep[id].percent === 100
  ).length;

  return (
    <div className="grid gap-5">
      {/* ROUTE / HEADER */}
      <section className="tr-noise tr-sheen relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/40 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(217,70,239,0.14),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(250,204,21,0.10),transparent_45%)]" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                <ToneBadge tone="cyan">Stage 1</ToneBadge>
                <ToneBadge tone="pink">Chicago</ToneBadge>
                <ToneBadge tone="gold">Snapshot Route</ToneBadge>
                <ToneBadge tone="emerald">Live Draft</ToneBadge>
              </div>
              <h1 className="tr-display mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Creator Snapshot Wizard
              </h1>
              <p className="mt-1 text-sm text-white/70">
                Move station by station. Save anytime. Finish the route to unlock Summary, Diagnostic,
                and the rest of Chicago Stage.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-right">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/50">Draft completion</div>
              <div className="mt-1 text-lg font-black tracking-tight text-white">{overallDraftPercent}%</div>
              <div className="text-xs text-white/60">
                {totalFilledFields}/{totalFieldCount} fields filled
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/55">CTA Line Progress</div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    Step {stepIndex + 1} of {steps.length} • {step.label}
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] tracking-widest text-white/70">
                  {progress}%
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 transition-all"
                  style={{ width: `${Math.max(progress, 6)}%` }}
                />
              </div>

              <div className="relative mt-4 overflow-x-auto pb-1">
                <div className="min-w-[760px]">
                  <div className="pointer-events-none absolute left-6 right-6 top-5 h-[2px] bg-gradient-to-r from-cyan-400/50 via-fuchsia-400/40 to-amber-300/40" />
                  <div className="relative grid grid-cols-6 gap-2">
                    {steps.map((s, idx) => {
                      const meta = STEP_META[s.id];
                      const isCurrent = idx === stepIndex;
                      const completion = completionByStep[s.id];
                      const isDone = completion.percent === 100;
                      const isFlashing = flashStep === s.id;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStepIndex(idx)}
                          className={[
                            "group relative rounded-2xl border p-2.5 text-left transition",
                            isCurrent
                              ? "border-white/20 bg-white/10"
                              : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                            isFlashing ? "ring-2 ring-white/20" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-2">
                            <div className="relative mt-0.5 shrink-0">
                              <div
                                className={[
                                  "grid h-7 w-7 place-items-center rounded-full border text-[10px] font-bold",
                                  isDone
                                    ? "border-white/25 bg-emerald-400/20 text-emerald-100"
                                    : isCurrent
                                    ? `border-white/25 bg-gradient-to-br ${meta.accentBar} text-black`
                                    : "border-white/20 bg-black/40 text-white/80",
                                ].join(" ")}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              {isFlashing ? (
                                <span className="pointer-events-none absolute inset-0 rounded-full border border-white/30 animate-ping" />
                              ) : null}
                            </div>

                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-white truncate">{s.label}</div>
                              <div className="text-[10px] text-white/55 truncate">{meta.station}</div>
                            </div>
                          </div>

                          <div className="mt-2 h-1.5 rounded-full bg-white/10">
                            <div
                              className={`h-1.5 rounded-full bg-gradient-to-r ${meta.accentBar}`}
                              style={{ width: `${Math.max(10, completion.percent)}%` }}
                            />
                          </div>

                          <div className="mt-1 text-[10px] text-white/55">
                            {completion.filled}/{completion.total} fields
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Route Summary</div>
              <div className="mt-2 grid gap-2 text-xs">
                <StatChip label="Completed stations" value={`${routeCompletedCount}/${steps.length}`} />
                <StatChip label="Current station" value={STEP_META[step.id].station} />
                <StatChip label="Local draft" value={savedToast ? "Saved ✓" : "Ready"} />
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white/70">
                Station goal: <span className="text-white">{stepMeta.subtitle}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {/* FORM PANEL */}
        <div
          className={`relative overflow-hidden rounded-[1.5rem] border bg-gradient-to-b ${stepMeta.accentSoft} p-4 sm:p-5`}
        >
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stepMeta.accentBar}`} />
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <ToneBadge tone={stepMeta.badgeTone}>Step {stepIndex + 1}</ToneBadge>
                  <ToneBadge tone="neutral">{stepMeta.station}</ToneBadge>
                </div>
                <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                  {step.label}
                </h2>
                <p className="mt-1 text-sm text-white/70">{stepMeta.helper}</p>
              </div>

              <div className="flex items-center gap-2">
                {savedToast ? (
                  <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/85">
                    Draft saved ✓
                  </div>
                ) : (
                  <button
                    onClick={saveLocal}
                    disabled={isSubmitting}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-40"
                  >
                    Save Draft
                  </button>
                )}

                <button
                  onClick={resetSnapshot}
                  disabled={isSubmitting}
                  className="rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-sm text-red-100 hover:bg-red-500/20 disabled:opacity-40"
                  title="Deletes your snapshot from the database + clears local draft"
                >
                  Reset
                </button>
              </div>
            </div>

            {serverError ? (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                <div className="font-semibold">Save failed</div>
                <div className="mt-1 text-red-100/90">{serverError}</div>
                <div className="mt-2 text-red-100/70">
                  Your local draft is still safe. Try again when ready.
                </div>
              </div>
            ) : null}

            {/* STEP PANEL */}
            <div className="mt-5 grid gap-4">
              <StepIntro
                title={stepMeta.subtitle}
                helper={stepMeta.helper}
                accentBar={stepMeta.accentBar}
                completion={completionByStep[step.id]}
              />

              {step.id === "identity" && (
                <div className="grid gap-4">
                  <PosterPanel title="Artist Card" subtitle="Name, city, genre, goals">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Artist / Project name"
                        value={data.artistName}
                        onChange={(v) => update("artistName", v)}
                        placeholder="e.g., Southside Nova"
                      />

                      <LocationPicker
                        value={data.cityArea}
                        onChange={(v) => update("cityArea", v)}
                      />

                      <SelectField
                        label="Primary genre"
                        value={genreChoice}
                        onChange={(v) => {
                          setGenreChoice(v);
                          if (v !== "Other") {
                            setGenreOther("");
                            update("genre", v);
                          } else {
                            update("genre", genreOther || "");
                          }
                        }}
                        options={GENRE_OPTIONS}
                        placeholderOption="Select a genre..."
                      />

                      {genreChoice === "Other" ? (
                        <Field
                          label="Type your genre"
                          value={genreOther}
                          onChange={(v) => {
                            setGenreOther(v);
                            update("genre", v);
                          }}
                          placeholder="e.g., Alt R&B / Jersey Club / Hyperpop"
                        />
                      ) : (
                        <Field
                          label="Vibe tags (comma-separated)"
                          value={data.vibeTags}
                          onChange={(v) => update("vibeTags", v)}
                          placeholder="e.g., gritty, euphoric, late-night"
                        />
                      )}

                      {genreChoice === "Other" ? (
                        <Field
                          label="Vibe tags (comma-separated)"
                          value={data.vibeTags}
                          onChange={(v) => update("vibeTags", v)}
                          placeholder="e.g., gritty, euphoric, late-night"
                        />
                      ) : null}

                      <SelectField
                        className="md:col-span-2"
                        label="Primary goal for the next 60 days"
                        value={goalChoice}
                        onChange={(v) => {
                          setGoalChoice(v);
                          if (v !== "Other") {
                            setGoalOther("");
                            update("primaryGoal", v);
                          } else {
                            update("primaryGoal", goalOther || "");
                          }
                        }}
                        options={GOAL_OPTIONS}
                        placeholderOption="Select a goal..."
                      />

                      {goalChoice === "Other" ? (
                        <Field
                          className="md:col-span-2"
                          label="Type your goal"
                          value={goalOther}
                          onChange={(v) => {
                            setGoalOther(v);
                            update("primaryGoal", v);
                          }}
                          placeholder="e.g., book 4 shows + sell 50 merch units"
                        />
                      ) : null}
                    </div>
                  </PosterPanel>

                  <PosterPanel title="Vibe Presets" subtitle="Quick chips to build your mood tags">
                    <div className="flex flex-wrap gap-2">
                      {VIBE_PRESETS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addVibePreset(tag)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85 hover:border-white/20 hover:bg-white/10"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-2.5">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">Current vibe stack</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(vibePreview.length ? vibePreview : ["No vibe tags yet"]).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </PosterPanel>
                </div>
              )}

              {step.id === "links" && (
                <PosterPanel title="Platform Links" subtitle="Drop what you already have live">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Spotify link"
                      value={data.spotify}
                      onChange={(v) => update("spotify", v)}
                      placeholder="spotify.com/artist/..."
                    />
                    <Field
                      label="YouTube link"
                      value={data.youtube}
                      onChange={(v) => update("youtube", v)}
                      placeholder="youtube.com/@..."
                    />
                    <Field
                      label="Instagram"
                      value={data.instagram}
                      onChange={(v) => update("instagram", v)}
                      placeholder="instagram.com/..."
                    />
                    <Field
                      label="TikTok"
                      value={data.tiktok}
                      onChange={(v) => update("tiktok", v)}
                      placeholder="tiktok.com/@..."
                    />
                    <Field
                      className="md:col-span-2"
                      label="Website / Link hub"
                      value={data.website}
                      onChange={(v) => update("website", v)}
                      placeholder="yourname.com or linktr.ee/..."
                    />
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <LinkPreviewRow label="Spotify" value={data.spotify} />
                    <LinkPreviewRow label="YouTube" value={data.youtube} />
                    <LinkPreviewRow label="Instagram" value={data.instagram} />
                    <LinkPreviewRow label="TikTok" value={data.tiktok} />
                  </div>
                </PosterPanel>
              )}

              {step.id === "audience" && (
                <PosterPanel title="Audience Signal" subtitle="Use rough buckets, not perfect analytics">
                  <div className="grid gap-4 md:grid-cols-3">
                    <SelectField
                      label="Total followers (rough)"
                      value={data.audienceSize}
                      onChange={(v) => update("audienceSize", v)}
                      options={RANGE_OPTIONS}
                      placeholderOption="Select a range..."
                    />
                    <SelectField
                      label="Email list size"
                      value={data.emailList}
                      onChange={(v) => update("emailList", v)}
                      options={EMAIL_OPTIONS}
                      placeholderOption="Select a range..."
                    />
                    <SelectField
                      label="Monthly listeners / views"
                      value={data.monthlyListeners}
                      onChange={(v) => update("monthlyListeners", v)}
                      options={RANGE_OPTIONS}
                      placeholderOption="Select a range..."
                    />
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <MiniSummary label="Followers" value={data.audienceSize || "—"} />
                    <MiniSummary label="Email" value={data.emailList || "—"} />
                    <MiniSummary label="Monthly" value={data.monthlyListeners || "—"} />
                  </div>
                </PosterPanel>
              )}

              {step.id === "revenue" && (
                <PosterPanel title="Revenue Snapshot" subtitle="What is the money side looking like right now?">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextArea
                      label="Current income streams"
                      value={data.currentIncomeStreams}
                      onChange={(v) => update("currentIncomeStreams", v)}
                      placeholder="e.g., shows, beats, features, merch, brand deals"
                    />
                    <TextArea
                      label="Current offer (if any)"
                      value={data.currentOffer}
                      onChange={(v) => update("currentOffer", v)}
                      placeholder="e.g., $150 feature verse, $40 merch drop"
                    />
                    <SelectField
                      className="md:col-span-2"
                      label="Typical price range (if selling anything)"
                      value={data.priceRange}
                      onChange={(v) => update("priceRange", v)}
                      options={PRICE_OPTIONS}
                      placeholderOption="Select a range..."
                    />
                  </div>
                </PosterPanel>
              )}

              {step.id === "momentum" && (
                <PosterPanel title="Momentum / Release Rhythm" subtitle="This becomes your Chicago run timing">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Upcoming release / milestone"
                      value={data.upcomingRelease}
                      onChange={(v) => update("upcomingRelease", v)}
                      placeholder="e.g., EP on March 15"
                    />

                    <SelectField
                      label="Performance frequency"
                      value={data.performanceFrequency}
                      onChange={(v) => update("performanceFrequency", v)}
                      options={PERFORMANCE_OPTIONS}
                      placeholderOption="Select one..."
                    />

                    <TextArea
                      className="md:col-span-2"
                      label="Collab targets (artists, venues, brands)"
                      value={data.collabTargets}
                      onChange={(v) => update("collabTargets", v)}
                      placeholder="e.g., venues: SubT, artists: ___, brands: ___"
                    />
                  </div>
                </PosterPanel>
              )}

              {step.id === "blockers" && (
                <div className="grid gap-4">
                  <PosterPanel title="Main Blocker" subtitle="Pick the loudest friction point right now">
                    <div className="grid gap-4">
                      <SelectField
                        label="Biggest blocker right now"
                        value={blockerChoice}
                        onChange={(v) => {
                          setBlockerChoice(v);
                          if (v !== "Other") {
                            setBlockerOther("");
                            update("biggestBlocker", v);
                          } else {
                            update("biggestBlocker", blockerOther || "");
                          }
                        }}
                        options={BLOCKER_OPTIONS}
                        placeholderOption="Select the main blocker..."
                      />

                      {blockerChoice === "Other" ? (
                        <TextArea
                          label="Type your blocker"
                          value={blockerOther}
                          onChange={(v) => {
                            setBlockerOther(v);
                            update("biggestBlocker", v);
                          }}
                          placeholder="e.g., inconsistent drops, weak offer, no funnel, no booking strategy"
                        />
                      ) : null}
                    </div>
                  </PosterPanel>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
                    <div className="font-semibold text-white/85">Next stop after Snapshot</div>
                    <div className="mt-1">
                      Chicago runs your <span className="text-white">Revenue Diagnostic</span>, then helps you
                      build a monetization offer + execution assets.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CONTROLS */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <button
                onClick={back}
                disabled={stepIndex === 0 || isSubmitting}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-40"
              >
                ← Back
              </button>

              <div className="flex items-center gap-2">
                <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 sm:block">
                  {completionByStep[step.id].filled}/{completionByStep[step.id].total} fields
                </div>

                {stepIndex < steps.length - 1 ? (
                  <button
                    onClick={next}
                    disabled={isSubmitting}
                    className={`rounded-xl bg-gradient-to-r ${stepMeta.accentBar} px-5 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-40`}
                  >
                    Save & Continue →
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={isSubmitting}
                    className={`rounded-xl bg-gradient-to-r ${stepMeta.accentBar} px-5 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-40`}
                  >
                    {isSubmitting ? "Saving..." : "Finish Snapshot ✓"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT RAIL / LIVE DRAFT */}
        <aside className="grid gap-4">
          <div className="tr-noise rounded-[1.3rem] border border-white/10 bg-black/35 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">Live Draft</div>
                <div className="mt-1 text-sm font-semibold text-white">Chicago Snapshot Card</div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] tracking-widest text-white/70">
                PREVIEW
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-3">
              <div className="text-xs uppercase tracking-[0.14em] text-white/50">Artist</div>
              <div className="mt-1 text-base font-black tracking-tight text-white">
                {data.artistName?.trim() || "Untitled Artist"}
              </div>
              <div className="mt-1 text-xs text-white/65">
                {data.cityArea?.trim() || "City not set"} • {data.genre?.trim() || "Genre TBD"}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(vibePreview.length ? vibePreview : ["No vibe tags"]).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 grid gap-2 text-xs">
                <StatChip label="Goal" value={data.primaryGoal || "—"} />
                <StatChip label="Followers" value={data.audienceSize || "—"} />
                <StatChip label="Price" value={data.priceRange || "—"} />
                <StatChip label="Blocker" value={data.biggestBlocker || "—"} />
              </div>
            </div>
          </div>

          <div className="rounded-[1.3rem] border border-white/10 bg-black/35 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">Station Checklist</div>
            <div className="mt-2 grid gap-2">
              {steps.map((s, idx) => {
                const c = completionByStep[s.id];
                const meta = STEP_META[s.id];
                const current = idx === stepIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStepIndex(idx)}
                    className={[
                      "rounded-xl border p-2 text-left transition",
                      current
                        ? "border-white/20 bg-white/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">{s.label}</span>
                      <span
                        className={`rounded-full border border-white/10 px-2 py-0.5 text-[10px] ${
                          c.percent === 100
                            ? "bg-emerald-400/10 text-emerald-100"
                            : current
                            ? "bg-cyan-400/10 text-cyan-100"
                            : "bg-white/5 text-white/60"
                        }`}
                      >
                        {c.percent}%
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-white/55">{meta.station}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${meta.accentBar}`}
                        style={{ width: `${Math.max(8, c.percent)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.3rem] border border-white/10 bg-black/35 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">What unlocks next</div>
            <div className="mt-2 space-y-2 text-xs text-white/75">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-semibold text-white">Snapshot Summary</span> → Chicago roadmap + local signal recap
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-semibold text-white">Diagnostic</span> → scorecards + bottlenecks
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="font-semibold text-white">Offers</span> → monetization blueprint + execution assets
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

/** -----------------------------
 *  Components
 *  -----------------------------
 */

function StepIntro({
  title,
  helper,
  accentBar,
  completion,
}: {
  title: string;
  helper: string;
  accentBar: string;
  completion: { filled: number; total: number; percent: number };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-white/50">Station objective</div>
          <div className="mt-1 text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-white/65">{helper}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">This step</div>
          <div className="text-sm font-semibold text-white">{completion.percent}%</div>
          <div className="text-[10px] text-white/55">
            {completion.filled}/{completion.total} fields
          </div>
        </div>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-white/10">
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${accentBar}`}
          style={{ width: `${Math.max(8, completion.percent)}%` }}
        />
      </div>
    </div>
  );
}

function PosterPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-xs uppercase tracking-[0.14em] text-white/50">{title}</div>
          <div className="mt-1 text-xs text-white/65">{subtitle}</div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] tracking-widest text-white/65">
          CHI
        </span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ToneBadge({
  tone,
  children,
}: {
  tone: "emerald" | "cyan" | "amber" | "pink" | "rose" | "gold" | "indigo" | "neutral";
  children: ReactNode;
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
      : tone === "cyan"
      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
      : tone === "amber"
      ? "border-amber-300/20 bg-amber-400/10 text-amber-100"
      : tone === "pink"
      ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
      : tone === "rose"
      ? "border-rose-300/20 bg-rose-400/10 text-rose-100"
      : tone === "gold"
      ? "border-yellow-300/20 bg-yellow-300/10 text-yellow-100"
      : tone === "indigo"
      ? "border-indigo-300/20 bg-indigo-400/10 text-indigo-100"
      : "border-white/10 bg-white/5 text-white/80";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] ${cls}`}>
      {children}
    </span>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <span className="text-white/60">{label}</span>
      <span className="max-w-[160px] text-right text-white/85">{value}</span>
    </div>
  );
}

function MiniSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">{label}</div>
      <div className="mt-1 text-xs font-semibold text-white">{value}</div>
    </div>
  );
}

function LinkPreviewRow({ label, value }: { label: string; value: string }) {
  const clean = value.trim();
  const href = clean ? normalizeUrl(clean) : "";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">{label}</div>
      {clean ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate text-xs text-cyan-200 hover:underline"
          title={href}
        >
          {clean}
        </a>
      ) : (
        <div className="mt-1 text-xs text-white/45">Not set</div>
      )}
    </div>
  );
}

function LocationPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [status, setStatus] = useState<string>("");

  async function useMyLocation() {
    setStatus("Detecting your city...");
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation not supported. Type your city instead.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const res = await fetch("/api/geo/reverse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          });

          const json = await res.json();

          if (!res.ok) {
            setStatus("Could not detect city. Type it manually.");
            return;
          }

          const display = String(json?.display ?? "").trim();
          if (display) {
            onChange(display);
            setStatus("City detected ✓");
            window.setTimeout(() => setStatus(""), 1500);
          } else {
            setStatus("Could not detect city. Type it manually.");
          }
        } catch {
          setStatus("Could not detect city. Type it manually.");
        }
      },
      () => {
        setStatus("Location permission denied. Type your city manually.");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white/80">Your city (auto-detect)</span>
        <button
          type="button"
          onClick={useMyLocation}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          Use my location
        </button>
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., Chicago, IL"
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
      />

      {status ? (
        <div className="text-xs text-white/60">{status}</div>
      ) : (
        <div className="text-xs text-white/55">
          We only use location to fill your city — we don’t store coordinates.
        </div>
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholderOption,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholderOption?: string;
  className?: string;
}) {
  return (
    <label className={["grid gap-2", className ?? ""].join(" ")}>
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
      >
        {placeholderOption ? (
          <option value="" className="bg-black">
            {placeholderOption}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-black">
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={["grid gap-2", className ?? ""].join(" ")}>
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={["grid gap-2", className ?? ""].join(" ")}>
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
      />
    </label>
  );
}