"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Lane = "service" | "digital" | "membership" | "live" | "hybrid";

const lanes: { id: Lane; label: string; desc: string }[] = [
  { id: "service", label: "Service", desc: "Features, sessions, beats, custom work" },
  { id: "digital", label: "Digital Product", desc: "Sample packs, presets, kits, downloads" },
  { id: "membership", label: "Membership", desc: "Fan club, paid community, monthly drops" },
  { id: "live", label: "Live Bundle", desc: "Shows + merch + follow-up funnel" },
  { id: "hybrid", label: "Hybrid", desc: "Mix of two lanes above" },
];

type ApiError = {
  error?: string;
  message?: string;
  requiredPlan?: "SOUTH_LOOP" | "RIVER_NORTH" | "THE_LOOP" | "FREE";
  currentPlan?: "SOUTH_LOOP" | "RIVER_NORTH" | "THE_LOOP" | "FREE";
  limit?: number;
};

export default function OfferNewClient() {
  const router = useRouter();
  const [lane, setLane] = useState<Lane>("service");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState<ApiError | null>(null);

  const laneMeta = useMemo(() => lanes.find((l) => l.id === lane)!, [lane]);

  async function create() {
    setLoading(true);
    setErr(null);
    setUpgrade(null);

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lane }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const data = (json || {}) as ApiError;
        if (data?.error === "upgrade_required" || data?.error === "limit_reached") {
          setUpgrade(data);
          setErr(data?.message || "Upgrade required.");
          return;
        }
        throw new Error(
          (data as any)?.message ||
            (data as any)?.error ||
            "Failed to create offer blueprint."
        );
      }

      router.push(`/dashboard/offers/${json.offer.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {err ? (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            upgrade
              ? "border-amber-400/25 bg-amber-500/10 text-amber-100"
              : "border-red-500/30 bg-red-500/10 text-red-100"
          }`}
        >
          <div className="font-semibold">{upgrade ? "Locked" : "Error"}</div>
          <div className="mt-1">{err}</div>

          {upgrade ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/pricing"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Upgrade →
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          {lanes.map((l) => (
            <button
              key={l.id}
              onClick={() => setLane(l.id)}
              className={[
                "rounded-2xl border p-4 text-left transition",
                lane === l.id
                  ? "border-white/25 bg-white/10"
                  : "border-white/10 bg-black/20 hover:bg-white/5",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{l.label}</div>
                {lane === l.id ? (
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                    Selected
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-sm text-white/60">{l.desc}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">You picked</div>
          <div className="mt-1 text-base font-semibold text-white/90">{laneMeta.label}</div>
          <div className="mt-1 text-sm text-white/70">{laneMeta.desc}</div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link
            href="/dashboard/diagnostic"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            ← Diagnostic
          </Link>
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