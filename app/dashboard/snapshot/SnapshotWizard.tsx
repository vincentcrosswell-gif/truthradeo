"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Snapshot = {
  artistName: string;
  cityArea: string;
  genre: string;
  vibeTags: string;
  primaryGoal: string;

  spotify: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  website: string;

  audienceSize: string;
  emailList: string;
  monthlyListeners: string;

  currentIncomeStreams: string;
  currentOffer: string;
  priceRange: string;

  upcomingRelease: string;
  performanceFrequency: string;
  collabTargets: string;

  biggestBlocker: string;
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

export default function SnapshotWizard() {
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [savedToast, setSavedToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [data, setData] = useState<Snapshot>({
    artistName: "",
    cityArea: "", // now auto-detect / manual (was "Chicago")
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
  });

  const step = steps[stepIndex];

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
        {/* Festival/street vibe heading */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Capture the signal
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Quick inputs → clean blueprint. You can edit later.
            </p>
          </div>

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

              {/* ✅ Location auto-detect replaces neighborhood typing */}
              <LocationPicker
                value={data.cityArea}
                onChange={(v) => update("cityArea", v)}
              />

              <Field
                label="Primary genre"
                value={data.genre}
                onChange={(v) => update("genre", v)}
                placeholder="e.g., House / Drill / Alt R&B"
              />

              <Field
                label="Vibe tags (comma-separated)"
                value={data.vibeTags}
                onChange={(v) => update("vibeTags", v)}
                placeholder="e.g., gritty, euphoric, late-night"
              />

              <Field
                className="md:col-span-2"
                label="Primary goal for the next 60 days"
                value={data.primaryGoal}
                onChange={(v) => update("primaryGoal", v)}
                placeholder="e.g., book 4 shows + sell 50 merch units"
              />
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
              <Field
                label="Total followers (rough)"
                value={data.audienceSize}
                onChange={(v) => update("audienceSize", v)}
                placeholder="e.g., 12k"
              />
              <Field
                label="Email list size"
                value={data.emailList}
                onChange={(v) => update("emailList", v)}
                placeholder="e.g., 350"
              />
              <Field
                label="Monthly listeners / views"
                value={data.monthlyListeners}
                onChange={(v) => update("monthlyListeners", v)}
                placeholder="e.g., 25k"
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
              <Field
                className="md:col-span-2"
                label="Typical price range (if selling anything)"
                value={data.priceRange}
                onChange={(v) => update("priceRange", v)}
                placeholder="e.g., $25–$150"
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
              <Field
                label="Performance frequency"
                value={data.performanceFrequency}
                onChange={(v) => update("performanceFrequency", v)}
                placeholder="e.g., 1–2 shows / month"
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
              <TextArea
                label="Biggest blocker right now"
                value={data.biggestBlocker}
                onChange={(v) => update("biggestBlocker", v)}
                placeholder="e.g., inconsistent drops, weak offer, no funnel, no booking strategy"
              />

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