"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Lane = "service" | "digital" | "membership" | "live" | "hybrid";

type OfferEditorPayload = {
  offerId: string;
  initial: {
    lane: string;
    title: string;
    promise: string;
    goal: string;
    audience: string;
    vibe: string;
    pricing: unknown;
    deliverables: unknown;
    funnel: unknown;
    scripts: unknown;
  };
};

const LANE_OPTIONS: { id: Lane; label: string }[] = [
  { id: "service", label: "Service" },
  { id: "digital", label: "Digital" },
  { id: "membership", label: "Membership" },
  { id: "live", label: "Live" },
  { id: "hybrid", label: "Hybrid" },
];

function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return "[]";
  }
}

function deliverablesToText(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.map((x) => (typeof x === "string" ? x : "")).filter(Boolean).join("\n");
}

function scriptsShape(value: unknown) {
  const v = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return {
    dm: typeof v.dm === "string" ? v.dm : "",
    caption: typeof v.caption === "string" ? v.caption : "",
    followUp: typeof v.followUp === "string" ? v.followUp : "",
  };
}

function safeParseJson<T = unknown>(raw: string, label: string) {
  try {
    return { ok: true as const, value: JSON.parse(raw) as T };
  } catch {
    return { ok: false as const, error: `${label} must be valid JSON` };
  }
}

export default function OfferEditorPanel({ offerId, initial }: OfferEditorPayload) {
  const router = useRouter();

  const [lane, setLane] = useState<string>(initial.lane || "service");
  const [title, setTitle] = useState(initial.title || "");
  const [promise, setPromise] = useState(initial.promise || "");
  const [goal, setGoal] = useState(initial.goal || "");
  const [audience, setAudience] = useState(initial.audience || "");
  const [vibe, setVibe] = useState(initial.vibe || "");

  const [pricingJson, setPricingJson] = useState(prettyJson(initial.pricing));
  const [funnelJson, setFunnelJson] = useState(prettyJson(initial.funnel));
  const [deliverablesText, setDeliverablesText] = useState(deliverablesToText(initial.deliverables));

  const scripts = useMemo(() => scriptsShape(initial.scripts), [initial.scripts]);
  const [dm, setDm] = useState(scripts.dm);
  const [caption, setCaption] = useState(scripts.caption);
  const [followUp, setFollowUp] = useState(scripts.followUp);

  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function hydrateFromOffer(offer: any) {
    setLane(typeof offer?.lane === "string" ? offer.lane : lane);
    setTitle(typeof offer?.title === "string" ? offer.title : "");
    setPromise(typeof offer?.promise === "string" ? offer.promise : "");
    setGoal(typeof offer?.goal === "string" ? offer.goal : "");
    setAudience(typeof offer?.audience === "string" ? offer.audience : "");
    setVibe(typeof offer?.vibe === "string" ? offer.vibe : "");
    setPricingJson(prettyJson(offer?.pricing ?? []));
    setFunnelJson(prettyJson(offer?.funnel ?? []));
    setDeliverablesText(deliverablesToText(offer?.deliverables ?? []));
    const s = scriptsShape(offer?.scripts ?? {});
    setDm(s.dm);
    setCaption(s.caption);
    setFollowUp(s.followUp);
  }

  async function saveChanges() {
    setError(null);
    setMessage(null);
    setIsSaving(true);

    const parsedPricing = safeParseJson(pricingJson, "Pricing");
    const parsedFunnel = safeParseJson(funnelJson, "Funnel");

    if (!parsedPricing.ok) {
      setError(parsedPricing.error);
      setIsSaving(false);
      return;
    }

    if (!parsedFunnel.ok) {
      setError(parsedFunnel.error);
      setIsSaving(false);
      return;
    }

    const deliverables = deliverablesText
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "update",
          lane,
          title,
          promise,
          goal,
          audience,
          vibe,
          pricing: parsedPricing.value,
          deliverables,
          funnel: parsedFunnel.value,
          scripts: {
            dm,
            caption,
            followUp,
          },
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const details = Array.isArray((json as any)?.details)
          ? ` ${(json as any).details.join(" • ")}`
          : "";
        throw new Error(
          (json as any)?.message ||
            (json as any)?.error ||
            `Failed to save offer.${details}`
        );
      }

      if ((json as any)?.offer) {
        hydrateFromOffer((json as any).offer);
      }

      setMessage("Offer blueprint saved.");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to save offer.");
    } finally {
      setIsSaving(false);
    }
  }

  async function regenerateFromSnapshot() {
    setError(null);
    setMessage(null);

    const ok = window.confirm(
      "Regenerate this blueprint from your current Snapshot?\n\nThis will overwrite title, promise, pricing, deliverables, funnel, and scripts."
    );
    if (!ok) return;

    setIsRegenerating(true);

    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "regenerate",
          lane,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          (json as any)?.message || (json as any)?.error || "Failed to regenerate blueprint."
        );
      }

      if ((json as any)?.offer) {
        hydrateFromOffer((json as any).offer);
      }

      setMessage("Blueprint regenerated from your latest Snapshot.");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to regenerate blueprint.");
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/60">Offer Blueprint Editor</div>
          <h2 className="mt-1 text-lg font-extrabold">Edit your offer live</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/70">
            Update the title, promise, pricing ladder, funnel, and scripts. Saving will refresh the page so the workspace below reflects your changes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={regenerateFromSnapshot}
            disabled={isRegenerating || isSaving}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            {isRegenerating ? "Regenerating..." : "Regenerate from Snapshot"}
          </button>
          <button
            onClick={saveChanges}
            disabled={isSaving || isRegenerating}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {message}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <label className="block text-xs text-white/60">Lane</label>
          <select
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
          >
            {LANE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-black">
                {opt.label}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-xs text-white/60">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
            placeholder="Offer title"
          />

          <label className="mt-4 block text-xs text-white/60">Promise</label>
          <textarea
            value={promise}
            onChange={(e) => setPromise(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
            placeholder="What the offer helps the artist achieve"
          />

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs text-white/60">Goal</label>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                placeholder="e.g. more paid collabs"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60">Audience</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                placeholder="e.g. 1k–10k listeners"
              />
            </div>
          </div>

          <label className="mt-4 block text-xs text-white/60">Vibe / tags</label>
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
            placeholder="e.g. dark melodic, hype, soulful"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <label className="block text-xs text-white/60">Deliverables (one per line)</label>
          <textarea
            value={deliverablesText}
            onChange={(e) => setDeliverablesText(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs outline-none"
            placeholder={`Clear scope + turnaround\nProof/examples\nPayment link\nDelivery method`}
          />

          <label className="mt-4 block text-xs text-white/60">
            Pricing ladder JSON (array of {"{ tier, price, includes[] }"})
          </label>
          <textarea
            value={pricingJson}
            onChange={(e) => setPricingJson(e.target.value)}
            rows={10}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs outline-none"
          />

          <label className="mt-4 block text-xs text-white/60">
            Funnel JSON (array of {"{ step, action }"})
          </label>
          <textarea
            value={funnelJson}
            onChange={(e) => setFunnelJson(e.target.value)}
            rows={10}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs outline-none"
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 text-sm font-semibold text-white/90">Scripts</div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs text-white/60">DM opener</label>
            <textarea
              value={dm}
              onChange={(e) => setDm(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60">Follow-up</label>
            <textarea
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}