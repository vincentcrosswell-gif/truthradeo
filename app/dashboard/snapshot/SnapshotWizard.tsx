"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Snapshot = {
  artistName: string;
  cityArea: string; // now treated as "City, State" (auto-detect or manual)
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

/** -----------------------------
 *  Options (dense + consistent)
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

function inList(value: string, list: string[]) {
  const v = (value || "").trim();
  return list.includes(v);
}

export default function SnapshotWizard() {
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [savedToast, setSavedToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

  /**
   * Local UI state for "Other" fields so we don't lose user input.
   * We still store the final chosen value into `data.*` fields for DB/Pulse.
   */
  const [genreChoice, setGenreChoice] = useState<string>("");
  const [genreOther, setGenreOther] = useState<string>("");

  const [goalChoice, setGoalChoice] = useState<string>("");
  const [goalOther, setGoalOther] = useState<string>("");

  const [blockerChoice, setBlockerChoice] = useState<string>("");
  const [blockerOther, setBlockerOther] = useState<string>("");

  const step = steps[stepIndex];

  // Load from localStorage
  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setData((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore
    }
  }, []);

  // Derive "Other" UI state from loaded data once we have it
  useEffect(() => {
    // Genre
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

    // Goal
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

    // Blocker
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

  const progress = useMemo(() => {
    return Math.round(((stepIndex + 1) / steps.length) * 100);
  }, [stepIndex]);

  function update<K extends keyof Snapshot>(key: K, value: Snapshot[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1200);
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

      // Clear local draft
      localStorage.removeItem(STORAGE_KEY);

      // Reset wizard + form
      setStepIndex(0);
      setData(emptySnapshot);

      // Reset "Other" UI state
      setGenreChoice("");
      setGenreOther("");
      setGoalChoice("");
      setGoalOther("");
      setBlockerChoice("");
      setBlockerOther("");

      setSavedToast(false);

      // Refresh so Chicago Pulse updates immediately
      router.refresh();
    } catch (e: any) {
      setServerError(e?.message ?? "Reset failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function next() {
    saveLocal();
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
      await saveToServer();
      router.push("/dashboard/snapshot/summary");
    } catch (e: any) {
      setServerError(e?.message ?? "Something went wrong saving your snapshot.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      {/* Progress / stepper */}
      <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Stage 1 • Chicago</div>
            <div className="text-base font-semibold">
              Step {stepIndex + 1} of {steps.length}:{" "}
              <span className="text-white/80">{step.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-white/60">{progress}%</div>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-white/70"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setStepIndex(idx)}
              className={[
                "rounded-full border px-3 py-1 text-xs",
                idx === stepIndex
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-white/10 bg-black/20 text-white/60 hover:text-white",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Capture the signal
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Quick inputs → clean blueprint. You can edit later.
            </p>
          </div>

          {/* Save + Reset controls */}
          <div className="flex items-center gap-2">
            {savedToast ? (
              <div className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/80">
                Saved ✓
              </div>
            ) : (
              <button
                onClick={saveLocal}
                disabled={isSubmitting}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-40"
              >
                Save
              </button>
            )}

            <button
              onClick={resetSnapshot}
              disabled={isSubmitting}
              className="rounded-xl border border-white/15 bg-red-500/10 px-4 py-2 text-sm text-red-100 hover:bg-red-500/20 disabled:opacity-40"
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
              Your draft is still in local storage. Try again when ready.
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {step.id === "identity" && (
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
          )}

          {step.id === "links" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Spotify link"
                value={data.spotify}
                onChange={(v) => update("spotify", v)}
                placeholder="https://..."
              />
              <Field
                label="YouTube link"
                value={data.youtube}
                onChange={(v) => update("youtube", v)}
                placeholder="https://..."
              />
              <Field
                label="Instagram"
                value={data.instagram}
                onChange={(v) => update("instagram", v)}
                placeholder="https://..."
              />
              <Field
                label="TikTok"
                value={data.tiktok}
                onChange={(v) => update("tiktok", v)}
                placeholder="https://..."
              />
              <Field
                className="md:col-span-2"
                label="Website / Link hub"
                value={data.website}
                onChange={(v) => update("website", v)}
                placeholder="https://..."
              />
            </div>
          )}

          {step.id === "audience" && (
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
          )}

          {step.id === "revenue" && (
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
          )}

          {step.id === "momentum" && (
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
                placeholder="e.g., venues: SubT, artists: ____"
              />
            </div>
          )}

          {step.id === "blockers" && (
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

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                <div className="font-semibold text-white/80">Next up:</div>
                <div className="mt-1">
                  After Snapshot, Chicago runs your{" "}
                  <span className="text-white">Revenue Diagnostic</span> and
                  builds an offer + execution assets.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={back}
            disabled={stepIndex === 0 || isSubmitting}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-40"
          >
            Back
          </button>

          {stepIndex < steps.length - 1 ? (
            <button
              onClick={next}
              disabled={isSubmitting}
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-40"
            >
              Save & Continue
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={isSubmitting}
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-40"
            >
              {isSubmitting ? "Saving..." : "Finish Snapshot"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** -----------------------------
 *  Components
 *  -----------------------------
 */

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
            setTimeout(() => setStatus(""), 1500);
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
        <span className="text-sm font-semibold text-white/80">
          Your city (auto-detect)
        </span>
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