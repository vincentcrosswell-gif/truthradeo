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
  day: string;
  energy: number;
  minutesExecuted: number;
  keyMetric: string;
  keyMetricValue: number;
  win: string;
  blocker: string;
  nextStep: string;
  createdAt: string;
  updatedAt: string;
};

type ChecklistState = Record<string, boolean>;

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

function safeNum(n: unknown) {
  const x = typeof n === "string" ? Number(n) : n;
  return Number.isFinite(Number(x)) ? Number(x) : 0;
}

function deltaBadge(now: number, prev: number, fmt: (v: number) => string) {
  const d = safeNum(now) - safeNum(prev);
  const sign = d > 0 ? "+" : d < 0 ? "−" : "";
  const abs = Math.abs(d);

  let tone = "border-white/10 bg-black/30 text-white/70";
  if (d > 0) tone = "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
  if (d < 0) tone = "border-rose-400/25 bg-rose-500/10 text-rose-200";

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

function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
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

function storageKey(offerId: string, runId: string) {
  return `tr:checklist:${offerId}:${runId}`;
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

function barWidth(value: number, max: number) {
  if (max <= 0) return "0%";
  return `${clamp((value / max) * 100, 0, 100)}%`;
}

function channelMeta(channel: string) {
  const key = (channel || "other").toLowerCase();
  const map: Record<
    string,
    { label: string; line: string; badge: string; dot: string; glow: string }
  > = {
    dm: {
      label: "DM",
      line: "Red Line",
      badge: "border-rose-300/20 bg-rose-400/10 text-rose-100",
      dot: "bg-rose-300",
      glow: "from-rose-400/18 to-transparent",
    },
    instagram: {
      label: "Instagram",
      line: "Pink Line",
      badge: "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100",
      dot: "bg-fuchsia-300",
      glow: "from-fuchsia-400/18 to-transparent",
    },
    tiktok: {
      label: "TikTok",
      line: "Green Line",
      badge: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
      dot: "bg-emerald-300",
      glow: "from-emerald-400/18 to-transparent",
    },
    youtube: {
      label: "YouTube",
      line: "Brown Line",
      badge: "border-amber-300/20 bg-amber-400/10 text-amber-100",
      dot: "bg-amber-300",
      glow: "from-amber-400/18 to-transparent",
    },
    email: {
      label: "Email",
      line: "Blue Line",
      badge: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
      dot: "bg-cyan-300",
      glow: "from-cyan-400/18 to-transparent",
    },
    live: {
      label: "Live / In-person",
      line: "Orange Line",
      badge: "border-orange-300/20 bg-orange-400/10 text-orange-100",
      dot: "bg-orange-300",
      glow: "from-orange-400/18 to-transparent",
    },
    ads: {
      label: "Ads",
      line: "Purple Line",
      badge: "border-violet-300/20 bg-violet-400/10 text-violet-100",
      dot: "bg-violet-300",
      glow: "from-violet-400/18 to-transparent",
    },
    website: {
      label: "Website",
      line: "Teal Line",
      badge: "border-teal-300/20 bg-teal-400/10 text-teal-100",
      dot: "bg-teal-300",
      glow: "from-teal-400/18 to-transparent",
    },
    other: {
      label: "Other",
      line: "Silver Line",
      badge: "border-white/15 bg-white/5 text-white/85",
      dot: "bg-white/70",
      glow: "from-white/10 to-transparent",
    },
  };

  return map[key] || map.other;
}

function inputCls() {
  return "rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white outline-none placeholder:text-white/35 focus:border-cyan-300/20";
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
    void loadRuns();
    void loadCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  useEffect(() => {
    if (!focus) return;
    const id = focus === "checkin" ? "daily-checkin" : focus === "run" ? "log-run" : "";
    if (!id) return;

    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);

    return () => clearTimeout(t);
  }, [focus]);

  const latest = runs[0] || null;
  const previous = runs[1] || null;

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
    } catch {
      // no-op
    }
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
    const totalRevenueCents = runs.reduce((sum, r) => sum + (r.revenueCents || 0), 0);

    const avgLeadRate =
      totalRuns > 0
        ? runs.reduce((sum, r) => sum + (r.iterationPlanJson?.scorecard?.leadRate || 0), 0) / totalRuns
        : 0;

    const avgCloseRate =
      totalRuns > 0
        ? runs.reduce((sum, r) => sum + (r.iterationPlanJson?.scorecard?.closeRate || 0), 0) / totalRuns
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
        calls: number;
        sales: number;
      }
    >();

    for (const r of last30Days) {
      const key = (r.channel || "other").toLowerCase();
      const cur = byChannel.get(key) || {
        runs: 0,
        revenueCents: 0,
        outreach: 0,
        leads: 0,
        calls: 0,
        sales: 0,
      };
      cur.runs += 1;
      cur.revenueCents += r.revenueCents || 0;
      cur.outreach += r.outreachCount || 0;
      cur.leads += r.leadsCount || 0;
      cur.calls += r.callsBooked || 0;
      cur.sales += r.salesCount || 0;
      byChannel.set(key, cur);
    }

    const channels = Array.from(byChannel.entries())
      .map(([channel, v]) => ({
        channel,
        ...v,
        leadRate: v.outreach > 0 ? v.leads / v.outreach : 0,
        callRate: v.leads > 0 ? v.calls / v.leads : 0,
        closeRate: v.leads > 0 ? v.sales / v.leads : 0,
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents);

    const last30Outreach = last30Days.reduce((sum, r) => sum + (r.outreachCount || 0), 0);
    const last30Leads = last30Days.reduce((sum, r) => sum + (r.leadsCount || 0), 0);
    const last30Calls = last30Days.reduce((sum, r) => sum + (r.callsBooked || 0), 0);
    const last30Sales = last30Days.reduce((sum, r) => sum + (r.salesCount || 0), 0);
    const last30Revenue = last30Days.reduce((sum, r) => sum + (r.revenueCents || 0), 0);

    return {
      totalRuns,
      totalRevenueCents,
      avgLeadRate,
      avgCloseRate,
      last30DaysRuns: last30Days.length,
      channels,
      last30Days,
      flow: {
        outreach: last30Outreach,
        leads: last30Leads,
        calls: last30Calls,
        sales: last30Sales,
        revenueCents: last30Revenue,
      },
    };
  }, [runs]);

  const trend = useMemo(() => {
    const last = runs.slice(0, 8).reverse();
    const maxOut = Math.max(0, ...last.map((r) => r.outreachCount || 0));
    const maxLead = Math.max(0, ...last.map((r) => r.leadsCount || 0));
    const maxCalls = Math.max(0, ...last.map((r) => r.callsBooked || 0));
    const maxSales = Math.max(0, ...last.map((r) => r.salesCount || 0));
    const maxRev = Math.max(0, ...last.map((r) => (r.revenueCents || 0) / 100));
    return { last, maxOut, maxLead, maxCalls, maxSales, maxRev };
  }, [runs]);

  const streak = useMemo(() => {
    if (!checkIns.length) return { current: 0, best: 0 };

    const days = checkIns
      .map((c) => new Date(c.day).getTime())
      .sort((a, b) => b - a);

    let current = 1;
    for (let i = 0; i < days.length - 1; i++) {
      const diff = days[i] - days[i + 1];
      if (diff <= 26 * 60 * 60 * 1000 && diff >= 22 * 60 * 60 * 1000) current += 1;
      else break;
    }

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
      setWhatWorked("");
      setWhatDidnt("");
      setBlockers("");
      setNotes("");

      startTransition(() => {
        void loadRuns();
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

      startTransition(() => {
        void loadCheckIns();
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

    downloadText(`truthradeo-offer-${offerId}-runs.csv`, toCSV(rows));
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

    downloadText(`truthradeo-offer-${offerId}-checkins.csv`, toCSV(rows));
  }

  const latestPlan = latest?.iterationPlanJson;
  const latestScore = latestPlan?.scorecard;
  const latestChannelMeta = channelMeta(latest?.channel || "other");

  const flow = rollups.flow;
  const maxFlow = Math.max(flow.outreach, flow.leads, flow.calls, flow.sales, 1);

  const outreachToLead = flow.outreach > 0 ? flow.leads / flow.outreach : 0;
  const leadToCall = flow.leads > 0 ? flow.calls / flow.leads : 0;
  const callToSale = flow.calls > 0 ? flow.sales / flow.calls : 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_5%_0%,rgba(34,211,238,0.10),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(236,72,153,0.10),transparent_38%),radial-gradient(circle_at_50%_100%,rgba(250,204,21,0.06),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-100">
                Transit Funnel Map
              </span>
              <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-2.5 py-1 text-fuchsia-100">
                Chicago Analytics
              </span>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-100">
                Iteration Engine
              </span>
            </div>

            <h2 className="mt-3 text-lg font-black tracking-tight text-white sm:text-xl">
              Execution Routes & Station Flow
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Daily platform check-ins keep momentum. Execution runs generate new route plans. This
              board turns your conversion funnel into a transit map.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportCheckInsCSV}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Export Check-ins
            </button>
            <button
              onClick={exportRunsCSV}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Export Runs
            </button>
            <button
              onClick={() => {
                void loadRuns();
                void loadCheckIns();
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Top stats strip */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Total Routes Logged"
            value={String(rollups.totalRuns)}
            sub={`30d: ${rollups.last30DaysRuns}`}
            tone="cyan"
          />
          <StatTile
            label="Total Revenue"
            value={money(rollups.totalRevenueCents)}
            sub="All runs"
            tone="emerald"
          />
          <StatTile
            label="Avg Lead Rate"
            value={pct(rollups.avgLeadRate)}
            sub="Across runs"
            tone="pink"
          />
          <StatTile
            label="Avg Close Rate"
            value={pct(rollups.avgCloseRate)}
            sub="Across runs"
            tone="amber"
          />
        </div>

        {/* Transit Funnel Map */}
        <div className="mt-5 grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-8 rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                  Route Map
                </div>
                <h3 className="mt-1 text-base font-black tracking-tight text-white">
                  30-Day Transit Funnel
                </h3>
                <p className="mt-1 text-xs text-white/60">
                  Stations = funnel steps. Tracks = conversion flow. Width and fill reflect traffic.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75">
                {rollups.last30DaysRuns > 0
                  ? `${rollups.last30DaysRuns} runs in last 30d`
                  : "No 30d data yet"}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              {/* Connector rails */}
              <div className="relative">
                <div className="pointer-events-none absolute left-[11%] right-[11%] top-8 hidden h-1 rounded-full bg-white/10 md:block" />
                <div className="pointer-events-none absolute left-[11%] right-[11%] top-8 hidden md:block">
                  <div className="grid grid-cols-4 gap-4">
                    <RailSegment pctVal={outreachToLead} label={`Lead ${pct(outreachToLead)}`} tone="cyan" />
                    <RailSegment pctVal={leadToCall} label={`Call ${pct(leadToCall)}`} tone="pink" />
                    <RailSegment pctVal={callToSale} label={`Sale ${pct(callToSale)}`} tone="emerald" />
                    <RailSegment
                      pctVal={flow.sales > 0 ? 1 : 0}
                      label={flow.sales > 0 ? "Revenue line" : "No sales yet"}
                      tone="amber"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-5">
                  <StationCard
                    name="Outreach"
                    code="O1"
                    value={String(flow.outreach)}
                    sub="Touches"
                    fillPct={flow.outreach > 0 ? (flow.outreach / maxFlow) * 100 : 0}
                    tone="cyan"
                  />
                  <StationCard
                    name="Leads"
                    code="L2"
                    value={String(flow.leads)}
                    sub="Replies"
                    fillPct={flow.leads > 0 ? (flow.leads / maxFlow) * 100 : 0}
                    tone="pink"
                  />
                  <StationCard
                    name="Calls"
                    code="C3"
                    value={String(flow.calls)}
                    sub="Booked"
                    fillPct={flow.calls > 0 ? (flow.calls / maxFlow) * 100 : 0}
                    tone="blue"
                  />
                  <StationCard
                    name="Sales"
                    code="S4"
                    value={String(flow.sales)}
                    sub="Closed"
                    fillPct={flow.sales > 0 ? (flow.sales / maxFlow) * 100 : 0}
                    tone="emerald"
                  />
                  <StationCard
                    name="Revenue"
                    code="R5"
                    value={money(flow.revenueCents)}
                    sub="30d gross"
                    fillPct={flow.revenueCents > 0 ? 100 : 0}
                    tone="amber"
                  />
                </div>
              </div>

              {latestScore ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                      Latest route dispatch
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] ${latestChannelMeta.badge}`}>
                        {latestChannelMeta.line}
                      </span>
                      <span className="text-xs text-white/70">
                        {new Date(latest.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white/90">
                      {latestPlan?.headline || "Iteration plan"}
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      {latestPlan?.next7Days?.focus || "Keep momentum and iterate."}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                      Latest score snapshot
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <MetricChip label="Outreach" value={String(latestScore.outreach)} tone="cyan" />
                      <MetricChip label="Lead" value={pct(latestScore.leadRate)} tone="pink" />
                      <MetricChip label="Close" value={pct(latestScore.closeRate)} tone="emerald" />
                      <MetricChip label="Revenue" value={money(latestScore.revenueCents)} tone="amber" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/65">
                  Log your first execution run to activate the transit map.
                </div>
              )}
            </div>
          </div>

          {/* Route leaderboard */}
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Line Board</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">
                Channel Routes (30d)
              </h3>

              <div className="mt-3 grid gap-2">
                {rollups.channels.length ? (
                  rollups.channels.slice(0, 6).map((c) => {
                    const meta = channelMeta(c.channel);
                    const maxChannelRev = Math.max(
                      1,
                      ...rollups.channels.map((x) => x.revenueCents || 0)
                    );
                    const revPct = ((c.revenueCents || 0) / maxChannelRev) * 100;

                    return (
                      <div
                        key={c.channel}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3"
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${meta.glow} opacity-70`}
                        />
                        <div className="relative">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                              <div className="text-xs font-semibold text-white/90">
                                {meta.label}
                              </div>
                            </div>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${meta.badge}`}>
                              {meta.line}
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 rounded-full bg-white/10">
                            <div
                              className={`h-1.5 rounded-full ${meta.dot}`}
                              style={{ width: `${clamp(revPct, 4, 100)}%` }}
                            />
                          </div>

                          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-white/70">
                            <span>Runs: <span className="text-white/90">{c.runs}</span></span>
                            <span>Rev: <span className="text-white/90">{money(c.revenueCents)}</span></span>
                            <span>Lead: <span className="text-white/90">{pct(c.leadRate)}</span></span>
                            <span>Close: <span className="text-white/90">{pct(c.closeRate)}</span></span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                    No channel routes yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Delta Signals</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">
                Last Route vs Previous
              </h3>

              {latestScore && previous?.iterationPlanJson?.scorecard ? (
                <div className="mt-3 grid gap-2">
                  <DeltaRow
                    label="Outreach"
                    badge={deltaBadge(
                      latestScore.outreach,
                      previous.iterationPlanJson.scorecard.outreach,
                      (v) => String(Math.round(v))
                    )}
                  />
                  <DeltaRow
                    label="Lead rate"
                    badge={deltaBadge(
                      latestScore.leadRate,
                      previous.iterationPlanJson.scorecard.leadRate,
                      (v) => pct(v)
                    )}
                  />
                  <DeltaRow
                    label="Close rate"
                    badge={deltaBadge(
                      latestScore.closeRate,
                      previous.iterationPlanJson.scorecard.closeRate,
                      (v) => pct(v)
                    )}
                  />
                  <DeltaRow
                    label="Revenue"
                    badge={deltaBadge(
                      latestScore.revenueCents,
                      previous.iterationPlanJson.scorecard.revenueCents,
                      (v) => money(v)
                    )}
                  />
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                  Log at least 2 runs to unlock deltas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trends mini charts */}
        <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Ridership Trends</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">
                Last {trend.last.length} Routes
              </h3>
              <p className="mt-1 text-xs text-white/60">
                Quick visual feedback so artists can feel momentum without reading spreadsheets.
              </p>
            </div>

            {rollups.channels.length ? (
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75">
                Top line:{" "}
                <span className="font-semibold text-white">
                  {channelMeta(rollups.channels[0].channel).label}
                </span>{" "}
                • {money(rollups.channels[0].revenueCents)}
              </div>
            ) : null}
          </div>

          {trend.last.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MiniBarPanel
                title="Outreach"
                tone="cyan"
                rows={trend.last.map((r) => ({
                  id: r.id,
                  label: dayLabel(r.createdAt),
                  value: r.outreachCount || 0,
                  valueLabel: String(r.outreachCount || 0),
                }))}
                max={trend.maxOut}
              />
              <MiniBarPanel
                title="Leads"
                tone="pink"
                rows={trend.last.map((r) => ({
                  id: r.id,
                  label: dayLabel(r.createdAt),
                  value: r.leadsCount || 0,
                  valueLabel: String(r.leadsCount || 0),
                }))}
                max={trend.maxLead}
              />
              <MiniBarPanel
                title="Calls"
                tone="blue"
                rows={trend.last.map((r) => ({
                  id: r.id,
                  label: dayLabel(r.createdAt),
                  value: r.callsBooked || 0,
                  valueLabel: String(r.callsBooked || 0),
                }))}
                max={trend.maxCalls}
              />
              <MiniBarPanel
                title="Revenue"
                tone="emerald"
                rows={trend.last.map((r) => ({
                  id: r.id,
                  label: dayLabel(r.createdAt),
                  value: (r.revenueCents || 0) / 100,
                  valueLabel: money(r.revenueCents || 0),
                }))}
                max={trend.maxRev}
              />
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
              No runs yet. Save your first route dispatch below.
            </div>
          )}
        </div>

        {/* Latest plan + checklist */}
        {latestPlan?.scorecard ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7 rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                Route Plan
              </div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">
                Next 7-Day Dispatch
              </h3>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold text-white/90">
                  {latestPlan.headline}
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {latestPlan.next7Days?.focus || "Focus your next 7 days."}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-white/65">
                  Checklist progress
                </div>
                <div className="text-xs text-white/80">
                  {checklistProgress.done}/{checklistProgress.total} •{" "}
                  <span className="font-semibold text-white">{checklistProgress.pct}%</span>
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full border border-white/10 bg-black/30">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400"
                  style={{ width: `${clamp(checklistProgress.pct, 0, 100)}%` }}
                />
              </div>

              <ul className="mt-4 grid gap-2">
                {(latestPlan.next7Days?.actions || []).map((a, i) => {
                  const done = !!checklist[a];
                  return (
                    <li key={`${i}-${a}`}>
                      <button
                        onClick={() => toggleChecklist(a)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                          done
                            ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                            : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                        }`}
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
                        <span>{a}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="xl:col-span-5 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                  Targets & Guardrails
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs font-semibold text-white/85">Targets</div>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/75">
                    {(latestPlan.next7Days?.targets || []).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                {latestPlan.guardrails?.length ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-semibold text-white/85">Guardrails</div>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/75">
                      {latestPlan.guardrails.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                  Script Angles
                </div>
                <div className="mt-3 grid gap-2">
                  <AngleCard title="DM angle" text={latestPlan.scriptTweaks?.dmAngle || "—"} />
                  <AngleCard title="Offer angle" text={latestPlan.scriptTweaks?.offerAngle || "—"} />
                  <AngleCard title="Pricing angle" text={latestPlan.scriptTweaks?.pricingAngle || "—"} />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* DAILY CHECK-IN */}
        <div
          id="daily-checkin"
          className="mt-6 scroll-mt-24 rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                Platform Check
              </div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">
                Daily Check-In (60s)
              </h3>
              <p className="mt-1 text-xs text-white/60">
                This keeps creators returning daily without requiring a full run log.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <MiniPill label="Streak" value={String(streak.current)} />
              <MiniPill label="Best" value={String(streak.best)} />
              <MiniPill label="Today" value={todaysCheckIn ? "saved" : "not yet"} />
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
                className={inputCls()}
              />
              <span className="text-xs text-white/55">{energyDots(checkEnergy)}</span>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/70">Minutes executed</span>
              <input
                type="number"
                min={0}
                value={checkMinutes}
                onChange={(e) => setCheckMinutes(Number(e.target.value || 0))}
                className={inputCls()}
                placeholder="20"
              />
            </label>

            <div className="grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-white/70">Key metric</span>
                <select
                  value={checkMetric}
                  onChange={(e) => setCheckMetric(e.target.value)}
                  className={inputCls()}
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
                  onChange={(e) => setCheckMetricValue(Number(e.target.value || 0))}
                  className={inputCls()}
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
                className={inputCls()}
                placeholder="Posted + got 3 replies"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/70">Blocker</span>
              <input
                value={checkBlocker}
                onChange={(e) => setCheckBlocker(e.target.value)}
                className={inputCls()}
                placeholder="No time to follow-up"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/70">Next step (tomorrow)</span>
              <input
                value={checkNext}
                onChange={(e) => setCheckNext(e.target.value)}
                className={inputCls()}
                placeholder="Send 15 DMs to DJs"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={submitCheckIn}
              disabled={isPending}
              className="rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-5 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-60"
            >
              {todaysCheckIn ? "Update today’s check-in" : "Save today’s check-in"}
            </button>

            {checkInSaved ? <div className="text-sm text-emerald-300">Saved.</div> : null}
            {isLoadingCheckIns ? <div className="text-sm text-white/60">Loading…</div> : null}
            {error ? <div className="text-sm text-rose-300">{error}</div> : null}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">Recent platforms</div>
            {checkIns.length ? (
              <div className="mt-3 grid gap-2">
                {checkIns.slice(0, 14).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold text-white/90">{dayLabel(c.day)}</div>
                      <div className="flex flex-wrap gap-2 text-white/70">
                        <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1">
                          Energy {c.energy}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1">
                          {c.minutesExecuted} min
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1">
                          {c.keyMetric}: {c.keyMetricValue}
                        </span>
                      </div>
                    </div>
                    {(c.win || c.blocker || c.nextStep) && (
                      <div className="mt-2 grid gap-1 text-white/65">
                        {c.win ? <div><span className="text-white/45">Win:</span> {c.win}</div> : null}
                        {c.blocker ? <div><span className="text-white/45">Blocker:</span> {c.blocker}</div> : null}
                        {c.nextStep ? <div><span className="text-white/45">Next:</span> {c.nextStep}</div> : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-sm text-white/60">
                No check-ins yet. Save one today to start the streak.
              </div>
            )}
          </div>
        </div>

        {/* LOG RUN */}
        <div id="log-run" className="mt-6 scroll-mt-24 rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                Dispatch Bay
              </div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">
                Log an Execution Route
              </h3>
              <p className="mt-1 text-xs text-white/60">
                Submit what happened in the real world. TruthRadeo converts it into the next route plan.
              </p>
            </div>

            <span className={`rounded-full border px-3 py-1 text-xs ${channelMeta(channel).badge}`}>
              {channelMeta(channel).line}
            </span>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="text-white/70">Channel</span>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className={inputCls()}
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
                  className={inputCls()}
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
                  className={inputCls()}
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
                  className={inputCls()}
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
                  className={inputCls()}
                  placeholder="1"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-white/70">Revenue (USD)</span>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={revenueDollars}
                  onChange={(e) => setRevenueDollars(Number(e.target.value || 0))}
                  className={inputCls()}
                  placeholder="300"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-white/70">What worked</span>
                <textarea
                  value={whatWorked}
                  onChange={(e) => setWhatWorked(e.target.value)}
                  className={`${inputCls()} min-h-[78px]`}
                  placeholder="Short DM + proof clip got replies"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-white/70">What didn’t</span>
                <textarea
                  value={whatDidnt}
                  onChange={(e) => setWhatDidnt(e.target.value)}
                  className={`${inputCls()} min-h-[78px]`}
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
                  className={`${inputCls()} min-h-[78px]`}
                  placeholder="No time to follow-up / unclear audience"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-white/70">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${inputCls()} min-h-[78px]`}
                  placeholder="Anything else you want to remember"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={submitRun}
                disabled={isPending}
                className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/15 px-5 py-2 text-sm font-semibold text-fuchsia-100 hover:bg-fuchsia-400/20 disabled:opacity-60"
              >
                {isPending ? "Saving…" : "Save route + generate next move"}
              </button>

              {saved ? <div className="text-sm text-emerald-300">Saved.</div> : null}
              {isLoadingRuns ? <div className="text-sm text-white/60">Refreshing…</div> : null}
              {error ? <div className="text-sm text-rose-300">{error}</div> : null}
            </div>
          </div>
        </div>

        {/* Run history */}
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white/90">Route history</h3>
            <span className="text-xs text-white/55">{runs.length} total</span>
          </div>

          <div className="mt-3 grid gap-3">
            {runs.length ? (
              runs.map((r) => {
                const plan = r.iterationPlanJson;
                const sc = plan?.scorecard;
                const meta = channelMeta(r.channel || "other");

                return (
                  <details
                    key={r.id}
                    className="group rounded-2xl border border-white/10 bg-black/25 p-4 open:bg-black/30"
                  >
                    <summary className="cursor-pointer list-none">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-block h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                            <span className="text-xs text-white/60">
                              {new Date(r.createdAt).toLocaleString()}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${meta.badge}`}>
                              {meta.label}
                            </span>
                          </div>
                          <div className="mt-1 truncate text-sm font-semibold text-white/90">
                            {plan?.headline || "Iteration plan"}
                          </div>
                        </div>

                        {sc ? (
                          <div className="flex flex-wrap gap-2 text-xs">
                            <MiniPill label="Out" value={String(sc.outreach)} />
                            <MiniPill label="Lead" value={pct(sc.leadRate)} />
                            <MiniPill label="Close" value={pct(sc.closeRate)} />
                            <MiniPill label="Rev" value={money(sc.revenueCents)} />
                          </div>
                        ) : null}
                      </div>
                    </summary>

                    <div className="mt-4 grid gap-4">
                      {plan?.diagnosis?.length ? (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-xs font-semibold text-white/80">Diagnosis</div>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/75">
                            {plan.diagnosis.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-xs font-semibold text-white/80">Next 7 days</div>
                          <div className="mt-1 text-sm text-white/70">{plan?.next7Days?.focus}</div>

                          <div className="mt-3 text-xs font-semibold text-white/80">Actions</div>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-white/75">
                            {(plan?.next7Days?.actions || []).map((a, i) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ul>

                          <div className="mt-3 text-xs font-semibold text-white/80">Targets</div>
                          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-white/75">
                            {(plan?.next7Days?.targets || []).map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-xs font-semibold text-white/80">Next 14 days</div>
                          <div className="mt-1 text-sm text-white/70">{plan?.next14Days?.focus}</div>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-white/75">
                            {(plan?.next14Days?.experiments || []).map((x, i) => (
                              <li key={i}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <AngleCard title="DM angle" text={plan?.scriptTweaks?.dmAngle || "—"} />
                        <AngleCard title="Offer angle" text={plan?.scriptTweaks?.offerAngle || "—"} />
                        <AngleCard title="Pricing angle" text={plan?.scriptTweaks?.pricingAngle || "—"} />
                      </div>

                      {(r.whatWorked || r.whatDidnt || r.blockers || r.notes) && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-xs font-semibold text-white/80">Dispatch notes</div>
                          <div className="mt-2 grid gap-1 text-sm text-white/75">
                            {r.whatWorked ? (
                              <div>
                                <span className="text-white/45">Worked:</span> {r.whatWorked}
                              </div>
                            ) : null}
                            {r.whatDidnt ? (
                              <div>
                                <span className="text-white/45">Didn’t:</span> {r.whatDidnt}
                              </div>
                            ) : null}
                            {r.blockers ? (
                              <div>
                                <span className="text-white/45">Blockers:</span> {r.blockers}
                              </div>
                            ) : null}
                            {r.notes ? (
                              <div>
                                <span className="text-white/45">Notes:</span> {r.notes}
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
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                {isLoadingRuns ? "Loading…" : "No runs yet. Log your first real-world attempt above."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- UI bits ---------- */

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "cyan" | "emerald" | "pink" | "amber";
}) {
  const toneCls =
    tone === "cyan"
      ? "from-cyan-400/10 to-blue-500/10 border-cyan-300/10"
      : tone === "emerald"
        ? "from-emerald-400/10 to-lime-400/10 border-emerald-300/10"
        : tone === "pink"
          ? "from-fuchsia-400/10 to-pink-500/10 border-fuchsia-300/10"
          : "from-amber-300/10 to-orange-500/10 border-amber-300/10";

  return (
    <div className={`rounded-2xl border bg-gradient-to-b ${toneCls} p-4`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-xs text-white/60">{sub}</div>
    </div>
  );
}

function RailSegment({
  pctVal,
  label,
  tone,
}: {
  pctVal: number;
  label: string;
  tone: "cyan" | "pink" | "emerald" | "amber";
}) {
  const dotCls =
    tone === "cyan"
      ? "bg-cyan-300"
      : tone === "pink"
        ? "bg-fuchsia-300"
        : tone === "emerald"
          ? "bg-emerald-300"
          : "bg-amber-300";

  return (
    <div className="relative">
      <div className="h-1 rounded-full bg-white/10">
        <div
          className={`h-1 rounded-full ${dotCls}`}
          style={{ width: `${clamp(pctVal * 100, pctVal > 0 ? 8 : 0, 100)}%` }}
        />
      </div>
      <div className="mt-1 text-center text-[10px] text-white/55">{label}</div>
    </div>
  );
}

function StationCard({
  name,
  code,
  value,
  sub,
  fillPct,
  tone,
}: {
  name: string;
  code: string;
  value: string;
  sub: string;
  fillPct: number;
  tone: "cyan" | "pink" | "blue" | "emerald" | "amber";
}) {
  const dot =
    tone === "cyan"
      ? "bg-cyan-300"
      : tone === "pink"
        ? "bg-fuchsia-300"
        : tone === "blue"
          ? "bg-blue-300"
          : tone === "emerald"
            ? "bg-emerald-300"
            : "bg-amber-300";

  const glow =
    tone === "cyan"
      ? "from-cyan-400/12"
      : tone === "pink"
        ? "from-fuchsia-400/12"
        : tone === "blue"
          ? "from-blue-400/12"
          : tone === "emerald"
            ? "from-emerald-400/12"
            : "from-amber-400/12";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b ${glow} to-transparent p-3`}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
            <span className="text-xs font-semibold text-white/90">{name}</span>
          </div>
          <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-white/70">
            {code}
          </span>
        </div>

        <div className="mt-2 text-lg font-black text-white">{value}</div>
        <div className="text-[11px] text-white/55">{sub}</div>

        <div className="mt-2 h-1.5 rounded-full bg-white/10">
          <div className={`h-1.5 rounded-full ${dot}`} style={{ width: `${clamp(fillPct, 0, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

function MetricChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "pink" | "emerald" | "amber";
}) {
  const cls =
    tone === "cyan"
      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
      : tone === "pink"
        ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
        : tone === "emerald"
          ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
          : "border-amber-300/20 bg-amber-400/10 text-amber-100";

  return (
    <div className={`rounded-xl border px-2.5 py-2 ${cls}`}>
      <div className="text-[10px] uppercase tracking-[0.12em] opacity-80">{label}</div>
      <div className="mt-0.5 text-xs font-semibold">{value}</div>
    </div>
  );
}

function DeltaRow({
  label,
  badge,
}: {
  label: string;
  badge: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
      <span className="text-white/70">{label}</span>
      {badge}
    </div>
  );
}

function MiniBarPanel({
  title,
  rows,
  max,
  tone,
}: {
  title: string;
  rows: { id: string; label: string; value: number; valueLabel: string }[];
  max: number;
  tone: "cyan" | "pink" | "blue" | "emerald";
}) {
  const barCls =
    tone === "cyan"
      ? "bg-cyan-300"
      : tone === "pink"
        ? "bg-fuchsia-300"
        : tone === "blue"
          ? "bg-blue-300"
          : "bg-emerald-300";

  const panelGlow =
    tone === "cyan"
      ? "from-cyan-400/10"
      : tone === "pink"
        ? "from-fuchsia-400/10"
        : tone === "blue"
          ? "from-blue-400/10"
          : "from-emerald-400/10";

  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-b ${panelGlow} to-transparent p-3`}>
      <div className="text-xs font-semibold text-white/85">{title}</div>
      <div className="mt-3 flex items-end gap-1.5">
        {rows.map((r) => (
          <div key={r.id} className="flex w-full flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end rounded-md border border-white/10 bg-black/25 p-1">
              <div
                className={`w-full rounded-sm ${barCls}`}
                style={{ height: barWidth(r.value || 0, Math.max(1, max)) }}
              />
            </div>
            <div className="truncate text-[9px] text-white/45">{r.label}</div>
            <div className="truncate text-[9px] text-white/70">{r.valueLabel}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AngleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[10px] uppercase tracking-[0.12em] text-white/50">{title}</div>
      <div className="mt-1 text-xs text-white/80">{text}</div>
    </div>
  );
}

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
      {label}: <span className="text-white/90">{value}</span>
    </span>
  );
}