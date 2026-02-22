"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type IterationPlan = {
  headline: string;
  scorecard: {
    outreach: number;
    leadRate: number;
    closeRate: number;
    revenueCents: number;
  };
  diagnosis: string[];
  next7Days: {
    focus: string;
    actions: string[];
    targets: string[];
  };
  next14Days: {
    focus: string;
    experiments: string[];
  };
  scriptTweaks: {
    dmAngle: string;
    offerAngle: string;
    pricingAngle: string;
  };
  guardrails: string[];
};

type ExecutionRunDTO = {
  id: string;
  createdAt: string;
  channel: string;
  outreachCount: number;
  leadsCount: number;
  callsBooked: number;
  salesCount: number;
  revenueCents: number;
  whatWorked: string;
  whatDidnt: string;
  blockers: string;
  notes: string;
  iterationPlanJson: IterationPlan;
};

function money(cents: number) {
  const dollars = Math.round((cents || 0) / 100);
  return `$${dollars.toLocaleString()}`;
}

function pct(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n * 100)}%`;
}

export default function ExecutionRunsPanel({
  offerId,
  initialRuns,
}: {
  offerId: string;
  initialRuns: ExecutionRunDTO[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [channel, setChannel] = useState("dm");
  const [outreachCount, setOutreachCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [callsBooked, setCallsBooked] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [revenueDollars, setRevenueDollars] = useState(0);

  const [whatWorked, setWhatWorked] = useState("");
  const [whatDidnt, setWhatDidnt] = useState("");
  const [blockers, setBlockers] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const runs = initialRuns;

  const quickRead = useMemo(() => {
    if (!runs.length) return null;
    const last = runs[0];
    const sc = last.iterationPlanJson?.scorecard;
    if (!sc) return null;
    return {
      headline: last.iterationPlanJson.headline,
      leadRate: pct(sc.leadRate),
      closeRate: pct(sc.closeRate),
      revenue: money(sc.revenueCents),
    };
  }, [runs]);

  async function submit() {
    setError(null);
    setSaved(false);

    const payload = {
      offerId,
      channel,
      outreachCount,
      leadsCount,
      callsBooked,
      salesCount,
      revenueCents: Math.max(0, Math.floor((revenueDollars || 0) * 100)),
      whatWorked,
      whatDidnt,
      blockers,
      notes,
    };

    try {
      const res = await fetch("/api/execution-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save run");
      }

      setSaved(true);

      // Reset the most important numeric inputs so logging stays fast.
      setOutreachCount(0);
      setLeadsCount(0);
      setCallsBooked(0);
      setSalesCount(0);
      setRevenueDollars(0);

      startTransition(() => {
        router.refresh();
      });
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Iteration & Optimization</h2>
          <p className="mt-1 text-sm text-white/60">
            Log what happened in the real world → get your next move.
          </p>
        </div>

        {quickRead ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
            <div className="font-semibold text-white/90">Latest plan</div>
            <div className="mt-1">{quickRead.headline}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Lead: <span className="text-white/90">{quickRead.leadRate}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Close: <span className="text-white/90">{quickRead.closeRate}</span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Rev: <span className="text-white/90">{quickRead.revenue}</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Log form */}
      <div className="mt-5 grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Channel</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
            >
              <option value="dm">DM</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="email">Email</option>
              <option value="live">Live / In-person</option>
              <option value="ads">Ads</option>
              <option value="website">Website</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Outreach touches</span>
            <input
              type="number"
              min={0}
              value={outreachCount}
              onChange={(e) => setOutreachCount(Number(e.target.value || 0))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="50"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Leads / replies</span>
            <input
              type="number"
              min={0}
              value={leadsCount}
              onChange={(e) => setLeadsCount(Number(e.target.value || 0))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="5"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Calls booked</span>
            <input
              type="number"
              min={0}
              value={callsBooked}
              onChange={(e) => setCallsBooked(Number(e.target.value || 0))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Sales closed</span>
            <input
              type="number"
              min={0}
              value={salesCount}
              onChange={(e) => setSalesCount(Number(e.target.value || 0))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="1"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Revenue (USD)</span>
            <input
              type="number"
              min={0}
              value={revenueDollars}
              onChange={(e) => setRevenueDollars(Number(e.target.value || 0))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="250"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-white/70">What worked</span>
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              className="min-h-[70px] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="Example: Short DM opener + clear next step"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">What didn’t work</span>
            <textarea
              value={whatDidnt}
              onChange={(e) => setWhatDidnt(e.target.value)}
              className="min-h-[70px] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="Example: Price felt too high without proof"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Blockers</span>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="min-h-[70px] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="Example: No time to follow-up / unclear audience"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[70px] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="Anything else you want to remember"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={submit}
            disabled={isPending}
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save run + generate next move"}
          </button>

          {saved ? <div className="text-sm text-emerald-300">Saved.</div> : null}
          {error ? <div className="text-sm text-red-300">{error}</div> : null}
        </div>
      </div>

      {/* History */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-white/90">Run history</h3>
        <div className="mt-3 grid gap-3">
          {runs.length ? (
            runs.map((r) => {
              const plan = r.iterationPlanJson;
              const sc = plan?.scorecard;
              return (
                <details
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-white/60">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white/90">
                          {plan?.headline || "Iteration plan"}
                        </div>
                      </div>
                      {sc ? (
                        <div className="flex flex-wrap gap-2 text-xs text-white/70">
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                            Out: <span className="text-white/90">{sc.outreach}</span>
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                            Lead: <span className="text-white/90">{pct(sc.leadRate)}</span>
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                            Close: <span className="text-white/90">{pct(sc.closeRate)}</span>
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                            Rev: <span className="text-white/90">{money(sc.revenueCents)}</span>
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </summary>

                  <div className="mt-4 grid gap-4">
                    {plan?.diagnosis?.length ? (
                      <div>
                        <div className="text-xs font-semibold text-white/80">Diagnosis</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {plan.diagnosis.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs font-semibold text-white/80">Next 7 days</div>
                        <div className="mt-2 text-sm text-white/70">{plan?.next7Days?.focus}</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {(plan?.next7Days?.actions || []).map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                        <div className="mt-3 text-xs font-semibold text-white/80">Targets</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {(plan?.next7Days?.targets || []).map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-white/80">Next 14 days</div>
                        <div className="mt-2 text-sm text-white/70">{plan?.next14Days?.focus}</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {(plan?.next14Days?.experiments || []).map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <div className="text-xs font-semibold text-white/80">DM angle</div>
                        <div className="mt-1 text-sm text-white/80">{plan?.scriptTweaks?.dmAngle}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <div className="text-xs font-semibold text-white/80">Offer angle</div>
                        <div className="mt-1 text-sm text-white/80">
                          {plan?.scriptTweaks?.offerAngle}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <div className="text-xs font-semibold text-white/80">Pricing angle</div>
                        <div className="mt-1 text-sm text-white/80">
                          {plan?.scriptTweaks?.pricingAngle}
                        </div>
                      </div>
                    </div>

                    {plan?.guardrails?.length ? (
                      <div>
                        <div className="text-xs font-semibold text-white/80">Guardrails</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {plan.guardrails.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {(r.whatWorked || r.whatDidnt || r.blockers || r.notes) && (
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="text-xs font-semibold text-white/80">Your notes</div>
                        <div className="mt-2 grid gap-2 text-sm text-white/80">
                          {r.whatWorked ? (
                            <div>
                              <span className="text-white/60">Worked:</span> {r.whatWorked}
                            </div>
                          ) : null}
                          {r.whatDidnt ? (
                            <div>
                              <span className="text-white/60">Didn’t:</span> {r.whatDidnt}
                            </div>
                          ) : null}
                          {r.blockers ? (
                            <div>
                              <span className="text-white/60">Blockers:</span> {r.blockers}
                            </div>
                          ) : null}
                          {r.notes ? (
                            <div>
                              <span className="text-white/60">Notes:</span> {r.notes}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              );
            })
          ) : (
            <div className="text-sm text-white/60">
              No runs yet. Log your first real-world attempt above.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}