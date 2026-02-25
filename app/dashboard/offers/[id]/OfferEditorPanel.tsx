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

const inputCls =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-0 placeholder:text-white/35 focus:border-cyan-300/20 focus:bg-black/50";
const textAreaCls =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-0 placeholder:text-white/35 focus:border-cyan-300/20 focus:bg-black/50";
const monoAreaCls =
  "mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs outline-none ring-0 placeholder:text-white/35 focus:border-cyan-300/20 focus:bg-black/50";

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
          scripts: { dm, caption, followUp },
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
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_6%_0%,rgba(34,211,238,0.10),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(217,70,239,0.10),transparent_38%),radial-gradient(circle_at_40%_100%,rgba(250,204,21,0.06),transparent_45%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em]">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-100">
                Studio Console
              </span>
              <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-2.5 py-1 text-fuchsia-100">
                Offer Editor
              </span>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-100">
                Live
              </span>
            </div>

            <h2 className="mt-3 text-lg font-black tracking-tight text-white sm:text-xl">
              Edit your offer live
            </h2>
            <p className="mt-1 text-sm text-white/70">
              This is your blueprint console. Tune title, promise, pricing, funnel, and scripts,
              then save to refresh the workspace modules below.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={regenerateFromSnapshot}
              disabled={isRegenerating || isSaving}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
            >
              {isRegenerating ? "Regenerating..." : "Regenerate from Snapshot"}
            </button>
            <button
              onClick={saveChanges}
              disabled={isSaving || isRegenerating}
              className="rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
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

        {/* Lane selector strip */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">Offer Lane</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {LANE_OPTIONS.map((opt) => {
              const active = lane === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLane(opt.id)}
                  className={`rounded-xl border px-3 py-2 text-xs transition ${
                    active
                      ? "border-cyan-300/25 bg-cyan-400/12 text-cyan-100"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Hidden select kept for full form parity / accessibility */}
          <label className="sr-only" htmlFor="lane-select-hidden">
            Lane
          </label>
          <select
            id="lane-select-hidden"
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            className="sr-only"
          >
            {LANE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-12">
          {/* Left: core identity */}
          <div className="xl:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Core Identity</div>

              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputCls}
                  placeholder="Offer title"
                />
              </Field>

              <Field label="Promise">
                <textarea
                  value={promise}
                  onChange={(e) => setPromise(e.target.value)}
                  rows={4}
                  className={textAreaCls}
                  placeholder="What outcome the artist gets, and what this changes for them"
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Goal">
                  <input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. more paid collabs"
                  />
                </Field>

                <Field label="Audience">
                  <input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. 1k–10k listeners"
                  />
                </Field>
              </div>

              <Field label="Vibe / tags">
                <input
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. dark melodic, hype, soulful"
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Scope & Deliverables</div>

              <Field label="Deliverables (one per line)">
                <textarea
                  value={deliverablesText}
                  onChange={(e) => setDeliverablesText(e.target.value)}
                  rows={10}
                  className={monoAreaCls}
                  placeholder={`Clear scope + turnaround\nProof/examples\nPayment link\nDelivery method`}
                />
              </Field>

              <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/65">
                Tip: keep deliverables super concrete. Artists trust offers that feel operational,
                not vague.
              </div>
            </div>
          </div>

          {/* Middle: pricing + funnel */}
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Pricing Ladder JSON</div>
              <div className="mt-1 text-[11px] text-white/55">
                Array of objects like tier / price / includes[].
              </div>
              <textarea
                value={pricingJson}
                onChange={(e) => setPricingJson(e.target.value)}
                rows={15}
                className={`${monoAreaCls} mt-3`}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Funnel JSON</div>
              <div className="mt-1 text-[11px] text-white/55">
                Array of objects like step / action.
              </div>
              <textarea
                value={funnelJson}
                onChange={(e) => setFunnelJson(e.target.value)}
                rows={13}
                className={`${monoAreaCls} mt-3`}
              />
            </div>
          </div>

          {/* Right: scripts */}
          <div className="xl:col-span-3 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Script Rack</div>

              <Field label="DM opener">
                <textarea
                  value={dm}
                  onChange={(e) => setDm(e.target.value)}
                  rows={6}
                  className={textAreaCls}
                />
              </Field>

              <Field label="Caption">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={6}
                  className={textAreaCls}
                />
              </Field>

              <Field label="Follow-up">
                <textarea
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  rows={6}
                  className={textAreaCls}
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Console Tips</div>
              <ul className="mt-2 grid gap-2 text-xs text-white/75">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span>Make the title outcome-first, not feature-first.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                  <span>Keep pricing ladder easy to say out loud in a DM.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>Scripts should sound like a person, not a brochure.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <label className="block text-xs text-white/60">{label}</label>
      {children}
    </div>
  );
}