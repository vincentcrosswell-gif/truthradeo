"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

type IterationPlan = {
  headline: string;
  scorecard: {
    outreach: number;
    leadRate: number; // 0-1
    closeRate: number; // 0-1
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

type CheckInDTO = {
  id: string;
  day: string; // ISO
  energy: number; // 1-5
  minutesExecuted: number;
  keyMetric: string;
  keyMetricValue: number;
  win: string;
  blocker: string;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function money(cents: number) {
  const dollars = Math.round((cents || 0) / 100);
  return `$${dollars.toLocaleString()}`;
}

function pct(n: number) {
  if (!Number.isFinite(n)) return "0%";
  return `${Math.round(n * 100)}%`;
}

function safeNum(n: any) {
  const x = typeof n === "string" ? Number(n) : n;
  return Number.isFinite(x) ? x : 0;
}

function deltaBadge(now: number, prev: number, fmt: (v: number) => string) {
  const d = safeNum(now) - safeNum(prev);
  const sign = d > 0 ? "+" : d < 0 ? "−" : "";
  const abs = Math.abs(d);

  let tone = "border-white/10 bg-black/30 text-white/70";
  if (d > 0) tone = "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (d < 0) tone = "border-red-400/20 bg-red-500/10 text-red-200";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${tone}`}>
      {sign}
      {fmt(abs)}
    </span>
  );
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  return lines.join("\n");
}

type ChecklistState = Record<string, boolean>;

function storageKey(offerId: string, runId: string) {
  return `tr:checklist:${offerId}:${runId}`;
}

function barWidth(value: number, max: number) {
  if (max <= 0) return "0%";
  const w = (value / max) * 100;
  return `${clamp(w, 0, 100).toFixed(1)}%`;
}

function dayLabel(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function energyDots(n: number) {
  const v = clamp(Math.round(n || 0), 1, 5);
  return "●".repeat(v) + "○".repeat(5 - v);
}

export default function ExecutionRunsPanel({
  offerId,
  initialRuns,
}: {
  offerId: string;
  initialRuns: ExecutionRunDTO[];
}) {
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus"); // "checkin" | "run"
  const [isPending, startTransition] = useTransition();

  // ---- Execution run form ----
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

  // ---- Daily check-in form ----
  const [checkEnergy, setCheckEnergy] = useState(3);
  const [checkMinutes, setCheckMinutes] = useState(0);
  const [checkMetric, setCheckMetric] = useState("outreach");
  const [checkMetricValue, setCheckMetricValue] = useState(0);
  const [checkWin, setCheckWin] = useState("");
  const [checkBlocker, setCheckBlocker] = useState("");
  const [checkNext, setCheckNext] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [runs, setRuns] = useState<ExecutionRunDTO[]>(initialRuns || []);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);

  const [checkIns, setCheckIns] = useState<CheckInDTO[]>([]);
  const [todaysCheckIn, setTodaysCheckIn] = useState<CheckInDTO | null>(null);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(false);
  const [checkInSaved, setCheckInSaved] = useState(false);

  async function loadRuns() {
    setIsLoadingRuns(true);
    setError(null);

    try {
      const res = await fetch(`/api/execution-runs?offerId=${offerId}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to load runs");
      }

      const data = await res.json();
      setRuns(
        (data?.runs || []).map((r: any) => ({
          ...r,
          createdAt:
            typeof r.createdAt === "string"
              ? r.createdAt
              : new Date(r.createdAt).toISOString(),
        }))
      );
    } catch (e: any) {
      setError(e?.message || "Something went wrong loading runs");
    } finally {
      setIsLoadingRuns(false);
    }
  }

  async function loadCheckIns() {
    setIsLoadingCheckIns(true);
    setError(null);

    try {
      const res = await fetch(`/api/checkins?offerId=${offerId}&days=14`, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to load check-ins");
      }

      const data = await res.json();
      const list: CheckInDTO[] = (data?.checkIns || []).map((c: any) => ({
        ...c,
        day: typeof c.day === "string" ? c.day : new Date(c.day).toISOString(),
        createdAt:
          typeof c.createdAt === "string"
            ? c.createdAt
            : new Date(c.createdAt).toISOString(),
        updatedAt:
          typeof c.updatedAt === "string"
            ? c.updatedAt
            : new Date(c.updatedAt).toISOString(),
      }));

      const todays: CheckInDTO | null = data?.todays
        ? {
            ...data.todays,
            day:
              typeof data.todays.day === "string"
                ? data.todays.day
                : new Date(data.todays.day).toISOString(),
            createdAt:
              typeof data.todays.createdAt === "string"
                ? data.todays.createdAt
                : new Date(data.todays.createdAt).toISOString(),
            updatedAt:
              typeof data.todays.updatedAt === "string"
                ? data.todays.updatedAt
                : new Date(data.todays.updatedAt).toISOString(),
          }
        : null;

      setCheckIns(list);
      setTodaysCheckIn(todays);

      // Hydrate form for edit-mode
      if (todays) {
        setCheckEnergy(todays.energy || 3);
        setCheckMinutes(todays.minutesExecuted || 0);
        setCheckMetric(todays.keyMetric || "outreach");
        setCheckMetricValue(todays.keyMetricValue || 0);
        setCheckWin(todays.win || "");
        setCheckBlocker(todays.blocker || "");
        setCheckNext(todays.nextStep || "");
      } else {
        setCheckEnergy(3);
        setCheckMinutes(0);
        setCheckMetric("outreach");
        setCheckMetricValue(0);
        setCheckWin("");
        setCheckBlocker("");
        setCheckNext("");
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong loading check-ins");
    } finally {
      setIsLoadingCheckIns(false);
    }
  }

  useEffect(() => {
    loadRuns();
    loadCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  // Auto-scroll based on query param focus
  useEffect(() => {
    if (!focus) return;
    const id =
      focus === "checkin"
        ? "daily-checkin"
        : focus === "run"
          ? "log-run"
          : "";
    if (!id) return;

    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => clearTimeout(t);
  }, [focus]);

  const latest = runs?.[0] || null;
  const previous = runs?.[1] || null;

  // Checklist persistence for latest plan
  const [checklist, setChecklist] = useState<ChecklistState>({});

  useEffect(() => {
    if (!latest?.id) return;
    const key = storageKey(offerId, latest.id);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setChecklist({});
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setChecklist(parsed);
      else setChecklist({});
    } catch {
      setChecklist({});
    }
  }, [offerId, latest?.id]);

  function toggleChecklist(action: string) {
    if (!latest?.id) return;
    const next = { ...checklist, [action]: !checklist[action] };
    setChecklist(next);
    try {
      localStorage.setItem(storageKey(offerId, latest.id), JSON.stringify(next));
    } catch {}
  }

  const checklistProgress = useMemo(() => {
    const actions = latest?.iterationPlanJson?.next7Days?.actions || [];
    if (!actions.length) return { done: 0, total: 0, pct: 0 };
    const done = actions.reduce((sum, a) => sum + (checklist[a] ? 1 : 0), 0);
    const total = actions.length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [latest, checklist]);

  const rollups = useMemo(() => {
    const totalRuns = runs.length;
    const totalRevenueCents = runs.reduce(
      (sum, r) => sum + (r.revenueCents || 0),
      0
    );

    const avgLeadRate =
      totalRuns > 0
        ? runs.reduce(
            (sum, r) => sum + (r.iterationPlanJson?.scorecard?.leadRate || 0),
            0
          ) / totalRuns
        : 0;

    const avgCloseRate =
      totalRuns > 0
        ? runs.reduce(
            (sum, r) => sum + (r.iterationPlanJson?.scorecard?.closeRate || 0),
            0
          ) / totalRuns
        : 0;

    const last30Days = runs.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return Date.now() - t <= 30 * 24 * 60 * 60 * 1000;
    });

    const byChannel = new Map<
      string,
      {
        runs: number;
        revenueCents: number;
        outreach: number;
        leads: number;
        sales: number;
      }
    >();

    for (const r of last30Days) {
      const key = r.channel || "other";
      const cur =
        byChannel.get(key) || {
          runs: 0,
          revenueCents: 0,
          outreach: 0,
          leads: 0,
          sales: 0,
        };
      cur.runs += 1;
      cur.revenueCents += r.revenueCents || 0;
      cur.outreach += r.outreachCount || 0;
      cur.leads += r.leadsCount || 0;
      cur.sales += r.salesCount || 0;
      byChannel.set(key, cur);
    }

    const channels = Array.from(byChannel.entries())
      .map(([channel, v]) => ({
        channel,
        ...v,
        leadRate: v.outreach > 0 ? v.leads / v.outreach : 0,
        closeRate: v.leads > 0 ? v.sales / v.leads : 0,
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents);

    return {
      totalRuns,
      totalRevenueCents,
      avgLeadRate,
      avgCloseRate,
      last30DaysRuns: last30Days.length,
      channels,
    };
  }, [runs]);

  const trend = useMemo(() => {
    const last = runs.slice(0, 8).reverse();
    const maxOut = Math.max(0, ...last.map((r) => r.outreachCount || 0));
    const maxLead = Math.max(0, ...last.map((r) => r.leadsCount || 0));
    const maxSales = Math.max(0, ...last.map((r) => r.salesCount || 0));
    const maxRev = Math.max(0, ...last.map((r) => (r.revenueCents || 0) / 100));
    return { last, maxOut, maxLead, maxSales, maxRev };
  }, [runs]);

  const streak = useMemo(() => {
    if (!checkIns.length) return { current: 0, best: 0 };

    const days = checkIns
      .map((c) => new Date(c.day).getTime())
      .sort((a, b) => b - a);

    // current streak = consecutive buckets from most recent
    let current = 1;
    for (let i = 0; i < days.length - 1; i++) {
      const diff = days[i] - days[i + 1];
      if (diff <= 26 * 60 * 60 * 1000 && diff >= 22 * 60 * 60 * 1000)
        current += 1;
      else break;
    }

    // best streak
    let best = 1;
    let run = 1;
    for (let i = 0; i < days.length - 1; i++) {
      const diff = days[i] - days[i + 1];
      if (diff <= 26 * 60 * 60 * 1000 && diff >= 22 * 60 * 60 * 1000) {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 1;
      }
    }

    return { current, best };
  }, [checkIns]);

  async function submitRun() {
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
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save run");
      }

      setSaved(true);

      setOutreachCount(0);
      setLeadsCount(0);
      setCallsBooked(0);
      setSalesCount(0);
      setRevenueDollars(0);

      startTransition(async () => {
        await loadRuns();
      });
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    }
  }

  async function submitCheckIn() {
    setError(null);
    setCheckInSaved(false);

    const payload = {
      offerId,
      energy: checkEnergy,
      minutesExecuted: checkMinutes,
      keyMetric: checkMetric,
      keyMetricValue: checkMetricValue,
      win: checkWin,
      blocker: checkBlocker,
      nextStep: checkNext,
    };

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save check-in");
      }

      setCheckInSaved(true);

      startTransition(async () => {
        await loadCheckIns();
      });
    } catch (e: any) {
      setError(e?.message || "Something went wrong saving check-in");
    }
  }

  function exportRunsCSV() {
    const rows = runs.map((r) => {
      const sc = r.iterationPlanJson?.scorecard;
      return {
        createdAt: new Date(r.createdAt).toISOString(),
        channel: r.channel,
        outreachCount: r.outreachCount,
        leadsCount: r.leadsCount,
        callsBooked: r.callsBooked,
        salesCount: r.salesCount,
        revenueUSD: ((r.revenueCents || 0) / 100).toFixed(2),
        planHeadline: r.iterationPlanJson?.headline || "",
        leadRate: sc ? sc.leadRate : "",
        closeRate: sc ? sc.closeRate : "",
      };
    });

    downloadText(`truthradeo-offer-${offerId}-runs.csv`, toCSV(rows) || "");
  }

  function exportCheckInsCSV() {
    const rows = checkIns.map((c) => ({
      day: new Date(c.day).toISOString(),
      energy: c.energy,
      minutesExecuted: c.minutesExecuted,
      keyMetric: c.keyMetric,
      keyMetricValue: c.keyMetricValue,
      win: c.win,
      blocker: c.blocker,
      nextStep: c.nextStep,
    }));

    downloadText(`truthradeo-offer-${offerId}-checkins.csv`, toCSV(rows) || "");
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold">Iteration & Optimization</h2>
          <p className="mt-1 text-sm text-white/60">
            Daily check-in → momentum. Execution runs → iteration plan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCheckInsCSV}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Export Check-ins
          </button>
          <button
            onClick={exportRunsCSV}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Export Runs
          </button>
          <button
            onClick={() => {
              loadRuns();
              loadCheckIns();
            }}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* DAILY CHECK-IN (anchor target) */}
      <div
        id="daily-checkin"
        className="mt-5 scroll-mt-24 rounded-3xl border border-white/10 bg-black/30 p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white/90">
              Daily check-in (60s)
            </div>
            <div className="mt-1 text-xs text-white/60">
              This does not create a new “run.” It keeps creators returning daily.
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Current streak:{" "}
              <span className="text-white/90">{streak.current}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Best: <span className="text-white/90">{streak.best}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Today:{" "}
              <span className="text-white/90">
                {todaysCheckIn ? "saved" : "not yet"}
              </span>
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Energy (1–5)</span>
            <input
              type="number"
              min={1}
              max={5}
              value={checkEnergy}
              onChange={(e) => setCheckEnergy(Number(e.target.value || 3))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
            />
            <span className="text-xs text-white/50">{energyDots(checkEnergy)}</span>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Minutes executed</span>
            <input
              type="number"
              min={0}
              value={checkMinutes}
              onChange={(e) => setCheckMinutes(Number(e.target.value || 0))}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="20"
            />
          </label>

          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-white/70">Key metric</span>
              <select
                value={checkMetric}
                onChange={(e) => setCheckMetric(e.target.value)}
                className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              >
                <option value="outreach">Outreach</option>
                <option value="leads">Leads</option>
                <option value="sales">Sales</option>
                <option value="revenue">Revenue (USD)</option>
                <option value="content">Content posts</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/70">Metric value</span>
              <input
                type="number"
                min={0}
                value={checkMetricValue}
                onChange={(e) =>
                  setCheckMetricValue(Number(e.target.value || 0))
                }
                className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
                placeholder="10"
              />
            </label>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Win (1 sentence)</span>
            <input
              value={checkWin}
              onChange={(e) => setCheckWin(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="Posted + got 3 replies"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Blocker</span>
            <input
              value={checkBlocker}
              onChange={(e) => setCheckBlocker(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="No time to follow-up"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-white/70">Next step (tomorrow)</span>
            <input
              value={checkNext}
              onChange={(e) => setCheckNext(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
              placeholder="Send 15 DMs to DJs"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={submitCheckIn}
            disabled={isPending}
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
          >
            {todaysCheckIn ? "Update today’s check-in" : "Save today’s check-in"}
          </button>

          {checkInSaved ? (
            <div className="text-sm text-emerald-300">Saved.</div>
          ) : null}
          {isLoadingCheckIns ? (
            <div className="text-sm text-white/60">Loading…</div>
          ) : null}
          {error ? <div className="text-sm text-red-300">{error}</div> : null}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-semibold text-white/80">Last 14 days</div>
          {checkIns.length ? (
            <div className="mt-3 grid gap-2">
              {checkIns.slice(0, 14).map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70"
                >
                  <div className="font-semibold text-white/90">
                    {dayLabel(c.day)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      Energy: <span className="text-white/90">{c.energy}</span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      Min:{" "}
                      <span className="text-white/90">
                        {c.minutesExecuted}
                      </span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      {c.keyMetric}:{" "}
                      <span className="text-white/90">
                        {c.keyMetricValue}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm text-white/60">
              No check-ins yet. Save one today to start your streak.
            </div>
          )}
        </div>
      </div>

      {/* SCOREBOARD */}
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Total runs</div>
          <div className="mt-1 text-2xl font-extrabold">{rollups.totalRuns}</div>
          <div className="mt-2 text-xs text-white/60">
            Last 30 days:{" "}
            <span className="text-white/80">{rollups.last30DaysRuns}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Total revenue</div>
          <div className="mt-1 text-2xl font-extrabold">
            {money(rollups.totalRevenueCents)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Avg lead rate</div>
          <div className="mt-1 text-2xl font-extrabold">
            {pct(rollups.avgLeadRate)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Avg close rate</div>
          <div className="mt-1 text-2xl font-extrabold">
            {pct(rollups.avgCloseRate)}
          </div>
        </div>
      </div>

      {/* Latest plan + deltas + checklist */}
      {latest?.iterationPlanJson?.scorecard ? (
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs text-white/60">Latest plan</div>
              <div className="mt-1 text-lg font-extrabold text-white/90">
                {latest.iterationPlanJson.headline}
              </div>
              <div className="mt-2 text-sm text-white/70">
                {latest.iterationPlanJson.next7Days?.focus ||
                  "Focus your next 7 days."}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-white/70">
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Outreach:{" "}
                <span className="text-white/90">
                  {latest.iterationPlanJson.scorecard.outreach}
                </span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Lead:{" "}
                <span className="text-white/90">
                  {pct(latest.iterationPlanJson.scorecard.leadRate)}
                </span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Close:{" "}
                <span className="text-white/90">
                  {pct(latest.iterationPlanJson.scorecard.closeRate)}
                </span>
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Rev:{" "}
                <span className="text-white/90">
                  {money(latest.iterationPlanJson.scorecard.revenueCents)}
                </span>
              </span>
            </div>
          </div>

          {previous?.iterationPlanJson?.scorecard ? (
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Δ Outreach</div>
                <div className="mt-2">
                  {deltaBadge(
                    latest.iterationPlanJson.scorecard.outreach,
                    previous.iterationPlanJson.scorecard.outreach,
                    (v) => String(Math.round(v))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Δ Lead rate</div>
                <div className="mt-2">
                  {deltaBadge(
                    latest.iterationPlanJson.scorecard.leadRate,
                    previous.iterationPlanJson.scorecard.leadRate,
                    (v) => pct(v)
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Δ Close rate</div>
                <div className="mt-2">
                  {deltaBadge(
                    latest.iterationPlanJson.scorecard.closeRate,
                    previous.iterationPlanJson.scorecard.closeRate,
                    (v) => pct(v)
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Δ Revenue</div>
                <div className="mt-2">
                  {deltaBadge(
                    latest.iterationPlanJson.scorecard.revenueCents,
                    previous.iterationPlanJson.scorecard.revenueCents,
                    (v) => money(v)
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-white/60">
              Log at least 2 runs to see deltas.
            </div>
          )}

          {latest.iterationPlanJson?.next7Days?.actions?.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white/80">
                      Next 7 days checklist
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Check it off. That’s the habit loop.
                    </div>
                  </div>
                  <div className="text-xs text-white/70">
                    {checklistProgress.done}/{checklistProgress.total} •{" "}
                    <span className="text-white/90">{checklistProgress.pct}%</span>
                  </div>
                </div>

                <div className="mt-3 h-2 w-full rounded-full border border-white/10 bg-black/20">
                  <div
                    className="h-full rounded-full bg-white/70"
                    style={{
                      width: `${clamp(checklistProgress.pct, 0, 100)}%`,
                    }}
                  />
                </div>

                <ul className="mt-4 grid gap-2">
                  {latest.iterationPlanJson.next7Days.actions.map((a, i) => {
                    const done = !!checklist[a];
                    return (
                      <li
                        key={`${i}-${a}`}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          done
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                            : "border-white/10 bg-black/20 text-white/80"
                        }`}
                      >
                        <button
                          onClick={() => toggleChecklist(a)}
                          className="flex w-full items-start gap-3 text-left"
                        >
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                              done
                                ? "border-emerald-300/40 bg-emerald-400/20"
                                : "border-white/20"
                            }`}
                          >
                            {done ? "✓" : ""}
                          </span>
                          <span className="leading-snug">{a}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs font-semibold text-white/80">Targets</div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
                  {(latest.iterationPlanJson.next7Days.targets || []).map(
                    (t, i) => (
                      <li key={i}>{t}</li>
                    )
                  )}
                </ul>

                {latest.iterationPlanJson?.guardrails?.length ? (
                  <>
                    <div className="mt-4 text-xs font-semibold text-white/80">
                      Guardrails
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
                      {latest.iterationPlanJson.guardrails.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Trends */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white/90">
              Trends (last {trend.last.length || 0} runs)
            </div>
            <div className="mt-1 text-xs text-white/60">
              Visual feedback so creators feel progress.
            </div>
          </div>

          {rollups.channels.length ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70">
              <div className="font-semibold text-white/90">Top channel (30d)</div>
              <div className="mt-1">
                {rollups.channels[0].channel} •{" "}
                {money(rollups.channels[0].revenueCents)} • lead{" "}
                {pct(rollups.channels[0].leadRate)} • close{" "}
                {pct(rollups.channels[0].closeRate)}
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/60">
              Log more runs to rank channels.
            </div>
          )}
        </div>

        {trend.last.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/80">Outreach</div>
              <div className="mt-3 flex items-end gap-2">
                {trend.last.map((r) => (
                  <div key={r.id} className="flex w-full flex-col items-center gap-1">
                    <div className="h-20 w-full rounded-md border border-white/10 bg-black/20">
                      <div
                        className="w-full rounded-md bg-white/70"
                        style={{
                          height: barWidth(r.outreachCount || 0, trend.maxOut),
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-white/50">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/80">Revenue (USD)</div>
              <div className="mt-3 flex items-end gap-2">
                {trend.last.map((r) => {
                  const usd = (r.revenueCents || 0) / 100;
                  return (
                    <div key={r.id} className="flex w-full flex-col items-center gap-1">
                      <div className="h-20 w-full rounded-md border border-white/10 bg-black/20">
                        <div
                          className="w-full rounded-md bg-white/70"
                          style={{ height: barWidth(usd, trend.maxRev) }}
                        />
                      </div>
                      <div className="text-[10px] text-white/50">
                        {money(r.revenueCents || 0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/80">Leads</div>
              <div className="mt-3 flex items-end gap-2">
                {trend.last.map((r) => (
                  <div key={r.id} className="flex w-full flex-col items-center gap-1">
                    <div className="h-20 w-full rounded-md border border-white/10 bg-black/20">
                      <div
                        className="w-full rounded-md bg-white/70"
                        style={{
                          height: barWidth(r.leadsCount || 0, trend.maxLead),
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-white/50">
                      {r.leadsCount || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/80">Sales</div>
              <div className="mt-3 flex items-end gap-2">
                {trend.last.map((r) => (
                  <div key={r.id} className="flex w-full flex-col items-center gap-1">
                    <div className="h-20 w-full rounded-md border border-white/10 bg-black/20">
                      <div
                        className="w-full rounded-md bg-white/70"
                        style={{
                          height: barWidth(r.salesCount || 0, trend.maxSales),
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-white/50">
                      {r.salesCount || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-white/60">
            No runs yet. Log your first attempt to unlock trends.
          </div>
        )}

        {rollups.channels.length ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold text-white/80">
              Channel leaderboard (last 30 days)
            </div>
            <div className="mt-3 grid gap-2">
              {rollups.channels.slice(0, 6).map((c) => (
                <div
                  key={c.channel}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70"
                >
                  <div className="font-semibold text-white/90">{c.channel}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      Runs: <span className="text-white/90">{c.runs}</span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      Rev: <span className="text-white/90">{money(c.revenueCents)}</span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      Lead: <span className="text-white/90">{pct(c.leadRate)}</span>
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                      Close: <span className="text-white/90">{pct(c.closeRate)}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* LOG A RUN (anchor target) */}
      <div id="log-run" className="mt-6 scroll-mt-24">
        <div className="text-sm font-semibold text-white/90">
          Log an execution run
        </div>

        <div className="mt-3 grid gap-4">
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
                placeholder="Short DM opener + clear next step"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/70">What didn’t work</span>
              <textarea
                value={whatDidnt}
                onChange={(e) => setWhatDidnt(e.target.value)}
                className="min-h-[70px] rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none"
                placeholder="Price felt too high without proof"
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
                placeholder="No time to follow-up / unclear audience"
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
              onClick={submitRun}
              disabled={isPending}
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save run + generate next move"}
            </button>

            {saved ? <div className="text-sm text-emerald-300">Saved.</div> : null}
            {isLoadingRuns ? (
              <div className="text-sm text-white/60">Refreshing…</div>
            ) : null}
            {error ? <div className="text-sm text-red-300">{error}</div> : null}
          </div>
        </div>
      </div>

      {/* Run history */}
      <div className="mt-7">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/90">Run history</h3>
        </div>

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
                        <div className="text-xs font-semibold text-white/80">
                          Diagnosis
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {plan.diagnosis.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-xs font-semibold text-white/80">
                          Next 7 days
                        </div>
                        <div className="mt-2 text-sm text-white/70">
                          {plan?.next7Days?.focus}
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {(plan?.next7Days?.actions || []).map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                        <div className="mt-3 text-xs font-semibold text-white/80">
                          Targets
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {(plan?.next7Days?.targets || []).map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-white/80">
                          Next 14 days
                        </div>
                        <div className="mt-2 text-sm text-white/70">
                          {plan?.next14Days?.focus}
                        </div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                          {(plan?.next14Days?.experiments || []).map((x, i) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <div className="text-xs font-semibold text-white/80">
                          DM angle
                        </div>
                        <div className="mt-1 text-sm text-white/80">
                          {plan?.scriptTweaks?.dmAngle}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <div className="text-xs font-semibold text-white/80">
                          Offer angle
                        </div>
                        <div className="mt-1 text-sm text-white/80">
                          {plan?.scriptTweaks?.offerAngle}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                        <div className="text-xs font-semibold text-white/80">
                          Pricing angle
                        </div>
                        <div className="mt-1 text-sm text-white/80">
                          {plan?.scriptTweaks?.pricingAngle}
                        </div>
                      </div>
                    </div>

                    {(r.whatWorked || r.whatDidnt || r.blockers || r.notes) && (
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="text-xs font-semibold text-white/80">
                          Your notes
                        </div>
                        <div className="mt-2 grid gap-2 text-sm text-white/80">
                          {r.whatWorked ? (
                            <div>
                              <span className="text-white/60">Worked:</span>{" "}
                              {r.whatWorked}
                            </div>
                          ) : null}
                          {r.whatDidnt ? (
                            <div>
                              <span className="text-white/60">Didn’t:</span>{" "}
                              {r.whatDidnt}
                            </div>
                          ) : null}
                          {r.blockers ? (
                            <div>
                              <span className="text-white/60">Blockers:</span>{" "}
                              {r.blockers}
                            </div>
                          ) : null}
                          {r.notes ? (
                            <div>
                              <span className="text-white/60">Notes:</span>{" "}
                              {r.notes}
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
              {isLoadingRuns
                ? "Loading…"
                : "No runs yet. Log your first real-world attempt above."}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}