"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lane = "service" | "digital" | "membership" | "live" | "hybrid";

const lanes: { id: Lane; label: string; desc: string }[] = [
  { id: "service", label: "Service", desc: "Features, sessions, beats, custom work" },
  { id: "digital", label: "Digital Product", desc: "Sample packs, presets, kits, downloads" },
  { id: "membership", label: "Membership", desc: "Fan club, paid community, monthly drops" },
  { id: "live", label: "Live Bundle", desc: "Shows + merch + follow-up funnel" },
  { id: "hybrid", label: "Hybrid", desc: "Mix of two lanes above" },
];

export default function OfferNewPage() {
  const router = useRouter();
  const [lane, setLane] = useState<Lane>("service");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lane }),
      });
      if (!res.ok) throw new Error("Failed to create offer blueprint.");
      const json = await res.json();
      router.push(`/dashboard/offers/${json.offer.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="text-xs text-white/60">Stage 1 • Chicago</div>
        <h1 className="mt-1 text-2xl font-extrabold">Offer Architect</h1>
        <p className="mt-2 text-white/70">
          Pick a lane → generate a pricing ladder + funnel + scripts.
        </p>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {err}
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          {lanes.map((l) => (
            <button
              key={l.id}
              onClick={() => setLane(l.id)}
              className={[
                "rounded-2xl border p-4 text-left",
                lane === l.id
                  ? "border-white/25 bg-white/10"
                  : "border-white/10 bg-black/20 hover:bg-white/5",
              ].join(" ")}
            >
              <div className="font-semibold">{l.label}</div>
              <div className="mt-1 text-sm text-white/60">{l.desc}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={create}
            disabled={loading}
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-40"
          >
            {loading ? "Generating..." : "Generate Blueprint →"}
          </button>
        </div>
      </div>
    </div>
  );
}
