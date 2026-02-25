import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { db } from "@/lib/db";
import ChicagoPulsePanel from "./ChicagoPulsePanel";
import DailyNudgePanel from "./DailyNudgePanel";
import { diagnosticComposite } from "@/lib/diagnostic-reports";

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value?: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function pct(value: number, max = 100) {
  const safe = Math.max(0, Math.min(max, value));
  return `${safe}%`;
}

type StationItem = {
  code: string;
  label: string;
  href: string;
  accent: string;
  done: boolean;
  active: boolean;
  detail: string;
  progress: number;
};

export default async function DashboardPage() {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);
  if (!userId) redirect("/sign-in");

  const [snapshot, latestOffer, runCount, checkInCount, revenueAgg, recentDiagnostics] =
    await Promise.all([
      db.creatorSnapshot.findUnique({
        where: { userId },
        select: {
          id: true,
          artistName: true,
          cityArea: true,
          genre: true,
          primaryGoal: true,
          vibeTags: true,
          updatedAt: true,
        },
      }),
      db.offerBlueprint.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          lane: true,
          goal: true,
          audience: true,
          vibe: true,
          updatedAt: true,
        },
      }),
      db.executionRun.count({ where: { userId } }),
      db.offerDailyCheckIn.count({ where: { userId } }),
      db.executionRun.aggregate({
        where: { userId },
        _sum: { revenueCents: true },
      }),
      db.diagnosticReport.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          monetizationScore: true,
          audienceScore: true,
          offerScore: true,
          momentumScore: true,
          clarityScore: true,
        },
      }),
    ]);

  const totalRevenueCents = revenueAgg._sum.revenueCents ?? 0;

  const diagnosticHistory = recentDiagnostics.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    scores: {
      monetization: r.monetizationScore,
      audience: r.audienceScore,
      offer: r.offerScore,
      momentum: r.momentumScore,
      clarity: r.clarityScore,
    },
  }));

  const latestDiagnostic = diagnosticHistory[0] ?? null;
  const previousDiagnostic = diagnosticHistory[1] ?? null;

  const latestComposite = latestDiagnostic
    ? diagnosticComposite(latestDiagnostic.scores)
    : null;
  const previousComposite = previousDiagnostic
    ? diagnosticComposite(previousDiagnostic.scores)
    : null;

  const diagnosticDelta =
    latestComposite !== null && previousComposite !== null
      ? latestComposite - previousComposite
      : null;

  const bestDimension = latestDiagnostic
    ? Math.max(
        latestDiagnostic.scores.monetization,
        latestDiagnostic.scores.audience,
        latestDiagnostic.scores.offer,
        latestDiagnostic.scores.momentum,
        latestDiagnostic.scores.clarity
      )
    : null;

  const nextPrimaryHref = !snapshot
    ? "/dashboard/snapshot"
    : !latestDiagnostic
    ? "/dashboard/diagnostic"
    : !latestOffer
    ? "/dashboard/offers/new"
    : `/dashboard/offers/${latestOffer.id}`;

  const nextPrimaryLabel = !snapshot
    ? "Start Snapshot"
    : !latestDiagnostic
    ? "Run Diagnostic"
    : !latestOffer
    ? "Build Blueprint"
    : "Open Workspace";

  const assetsHref = latestOffer
    ? `/dashboard/assets?offerId=${latestOffer.id}`
    : "/dashboard/offers/new";

  const snapshotTags = (snapshot?.vibeTags || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 4);

  const artistName =
    snapshot?.artistName?.trim() ||
    user?.firstName?.trim() ||
    user?.username ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Artist";

  const stations: StationItem[] = [
    {
      code: "SNAP",
      label: "Creator Snapshot",
      href: "/dashboard/snapshot",
      accent: "from-emerald-400 to-lime-400",
      done: Boolean(snapshot),
      active: !snapshot,
      detail: snapshot
        ? `${snapshot.cityArea || "Chicago"} • ${formatDate(snapshot.updatedAt)}`
        : "Capture profile + signal",
      progress: snapshot ? 100 : 32,
    },
    {
      code: "DIAG",
      label: "Revenue Diagnostic",
      href: "/dashboard/diagnostic",
      accent: "from-amber-300 to-orange-500",
      done: Boolean(latestDiagnostic),
      active: Boolean(snapshot && !latestDiagnostic),
      detail: latestDiagnostic
        ? `Composite ${latestComposite} • ${formatDate(latestDiagnostic.createdAt)}`
        : snapshot
        ? "Ready to run"
        : "Locked until Snapshot",
      progress: latestDiagnostic ? 100 : snapshot ? 56 : 10,
    },
    {
      code: "OFR",
      label: "Offer Blueprint",
      href: "/dashboard/offers/new",
      accent: "from-fuchsia-400 to-pink-500",
      done: Boolean(latestOffer),
      active: Boolean(snapshot && latestDiagnostic && !latestOffer),
      detail: latestOffer
        ? `${latestOffer.lane || "Lane"} • ${formatDate(latestOffer.updatedAt)}`
        : latestDiagnostic
        ? "Build monetization lane"
        : "Locked until Diagnostic",
      progress: latestOffer ? 100 : latestDiagnostic ? 60 : 10,
    },
    {
      code: "RUN",
      label: "Execution Runs",
      href: latestOffer ? `/dashboard/offers/${latestOffer.id}` : "/dashboard/offers/new",
      accent: "from-cyan-400 to-blue-500",
      done: runCount > 0,
      active: Boolean(latestOffer && runCount === 0),
      detail:
        runCount > 0
          ? `${runCount} runs • ${formatMoney(totalRevenueCents)}`
          : latestOffer
          ? "Ship your first run"
          : "Locked until Blueprint",
      progress: runCount > 0 ? 100 : latestOffer ? 42 : 8,
    },
  ];

  const completedStations = stations.filter((s) => s.done).length;
  const stageProgress = Math.round((completedStations / stations.length) * 100);

  const diagnosticBars = latestDiagnostic
    ? [
        { label: "Monetization", short: "M", value: latestDiagnostic.scores.monetization, tone: "bg-emerald-400" },
        { label: "Audience", short: "A", value: latestDiagnostic.scores.audience, tone: "bg-cyan-400" },
        { label: "Offer", short: "O", value: latestDiagnostic.scores.offer, tone: "bg-fuchsia-400" },
        { label: "Momentum", short: "MO", value: latestDiagnostic.scores.momentum, tone: "bg-amber-300" },
        { label: "Clarity", short: "C", value: latestDiagnostic.scores.clarity, tone: "bg-rose-400" },
      ]
    : [];

  return (
    <div className="grid gap-5">
      {/* HERO POSTER */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <div className="tr-noise tr-sheen relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/40 p-5 sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(34,211,238,0.20),transparent_38%),radial-gradient(circle_at_85%_12%,rgba(217,70,239,0.16),transparent_42%),radial-gradient(circle_at_55%_100%,rgba(250,204,21,0.14),transparent_42%)]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* poster stickers */}
          <div className="absolute right-4 top-4 hidden rotate-6 rounded-xl border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-cyan-100 shadow-lg sm:block">
            CHI LIVE
          </div>
          <div className="absolute right-16 top-14 hidden -rotate-6 rounded-xl border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-fuchsia-100 shadow-lg sm:block">
            POSTER MODE
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
              <Sticker tone="cyan">Stage 1</Sticker>
              <Sticker tone="pink">Chicago</Sticker>
              <Sticker tone="gold">Command Deck</Sticker>
              <Sticker tone="emerald">Live Signal</Sticker>
            </div>

            <div className="mt-3">
              <div className="text-xs uppercase tracking-[0.22em] text-white/55">
                TruthRadeo Festival Poster Bento
              </div>
              <h1 className="tr-display mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Chicago Command Center
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-[15px]">
                Run your artist business like a city setlist: Snapshot → Diagnostic → Blueprint → Execution.
                Loud visuals, clear moves, no dead screens.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={nextPrimaryHref}
                className="tr-btn rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
              >
                {nextPrimaryLabel} →
              </Link>
              <Link
                href="/dashboard/analytics"
                className="tr-btn rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                Analytics →
              </Link>
              <Link
                href={assetsHref}
                className="tr-btn rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-2 text-sm text-fuchsia-100 hover:bg-fuchsia-400/15"
              >
                Execution Assets →
              </Link>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <PosterMetric
                label="Stage Progress"
                value={`${stageProgress}%`}
                sub={`${completedStations}/${stations.length} stations`}
                tone="cyan"
              />
              <PosterMetric
                label="Revenue Logged"
                value={formatMoney(totalRevenueCents)}
                sub={`${runCount} runs tracked`}
                tone="gold"
              />
              <PosterMetric
                label="Latest Diagnostic"
                value={latestComposite !== null ? String(latestComposite) : "—"}
                sub={latestDiagnostic ? formatDateTime(latestDiagnostic.createdAt) : "No diagnostic yet"}
                tone="pink"
              />
              <PosterMetric
                label="Now Playing"
                value={artistName}
                sub={snapshot?.genre?.trim() || "Genre TBD"}
                tone="emerald"
              />
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/55">Genre / Goal Stickers</div>
                  <span className="text-[11px] text-white/55">Chicago Flavor</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill>{snapshot?.genre?.trim() || "Genre TBD"}</Pill>
                  <Pill>{snapshot?.primaryGoal?.trim() || "Goal TBD"}</Pill>
                  {(snapshotTags.length ? snapshotTags : ["DIY", "Street Push", "Club Energy"]).map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white/70">
                  {latestOffer
                    ? `Latest blueprint: ${latestOffer.title?.trim() || "Untitled"} • ${latestOffer.lane}`
                    : "No blueprint yet. Build your first offer and make the page feel like a setlist, not a spreadsheet."}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/55">Signal Meter</div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/60">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    LIVE
                  </span>
                </div>

                <EqualizerBars />

                <div className="mt-3 grid gap-1.5 text-xs">
                  <SignalRow
                    label="Diagnostic Delta"
                    value={
                      diagnosticDelta === null
                        ? "Run again to compare"
                        : `${diagnosticDelta >= 0 ? "+" : ""}${diagnosticDelta}`
                    }
                    good={diagnosticDelta !== null ? diagnosticDelta >= 0 : undefined}
                  />
                  <SignalRow
                    label="Check-ins"
                    value={`${checkInCount} logged`}
                    good={checkInCount > 0}
                  />
                  <SignalRow
                    label="Best Score"
                    value={bestDimension !== null ? `${bestDimension}/100` : "—"}
                    good={bestDimension !== null && bestDimension >= 70}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HERO STACK */}
        <div className="grid gap-4">
          <div className="tr-noise relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_10%_100%,rgba(217,70,239,0.10),transparent_40%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/55">CTA Route Board</div>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-white">Chicago Line Map</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] tracking-widest text-white/70">
                  L-LINE
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300"
                  style={{ width: `${Math.max(12, stageProgress)}%` }}
                />
              </div>

              <div className="relative mt-4 grid gap-2">
                <div className="pointer-events-none absolute bottom-4 left-[11px] top-2 w-[2px] rounded-full bg-gradient-to-b from-cyan-400/60 via-fuchsia-400/45 to-amber-300/45" />
                {stations.map((station) => (
                  <Link
                    key={station.code}
                    href={station.href}
                    className="group relative flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="relative z-10 mt-0.5 h-5 w-5 shrink-0 rounded-full border border-white/20 bg-black/60" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-white">
                          {station.label}
                        </div>
                        <span
                          className={`rounded-full border border-white/10 bg-black/35 px-2 py-0.5 text-[10px] tracking-widest ${
                            station.done
                              ? "text-emerald-200"
                              : station.active
                              ? "text-cyan-200"
                              : "text-white/55"
                          }`}
                        >
                          {station.done ? "DONE" : station.active ? "LIVE" : "WAIT"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-white/60">{station.detail}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${station.accent}`}
                          style={{ width: pct(station.progress) }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/55">Tonight&apos;s Set</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">Quick Moves</h3>
              <div className="mt-3 grid gap-2">
                <QuickActionLink href="/dashboard/snapshot" tone="emerald">
                  Update Snapshot
                </QuickActionLink>
                <QuickActionLink href="/dashboard/diagnostic" tone="amber">
                  Run Diagnostic
                </QuickActionLink>
                <QuickActionLink href="/dashboard/offers/new" tone="pink">
                  New Blueprint
                </QuickActionLink>
                <QuickActionLink
                  href={latestOffer ? `/dashboard/offers/${latestOffer.id}` : "/dashboard/offers/new"}
                  tone="cyan"
                >
                  Log Execution
                </QuickActionLink>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/55">Poster Notes</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">Headliner Status</h3>
              <div className="mt-3 space-y-2 text-xs text-white/75">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  {snapshot
                    ? `Snapshot updated ${formatDate(snapshot.updatedAt)}`
                    : "Snapshot not started yet"}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  {latestDiagnostic
                    ? `Latest diagnostic composite: ${latestComposite}`
                    : "No diagnostic run yet"}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  {latestOffer
                    ? `Offer lane: ${latestOffer.lane}`
                    : "No offer blueprint yet"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7 grid gap-4 sm:grid-cols-2">
          <PosterCard
            className="sm:col-span-2"
            accent="emerald"
            title="Creator Snapshot"
            kicker="Step 1"
            subtitle="Backstage intake for your artist business"
          >
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-white/75">
              {snapshot ? (
                <>
                  <div className="text-sm font-semibold text-white">
                    {snapshot.artistName?.trim() || "Artist name not set"}
                  </div>
                  <div className="mt-1">{snapshot.cityArea || "Chicago"}</div>
                  <div className="mt-1">Genre: {snapshot.genre?.trim() || "—"}</div>
                  <div className="mt-1 text-white/50">Updated {formatDate(snapshot.updatedAt)}</div>
                </>
              ) : (
                <div>No snapshot yet. Start here to activate Chicago Stage logic.</div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryBtn href="/dashboard/snapshot">
                {snapshot ? "Edit Snapshot" : "Start Snapshot"}
              </PrimaryBtn>
              {snapshot ? (
                <GhostBtn href="/dashboard/snapshot/summary">Snapshot Summary</GhostBtn>
              ) : null}
            </div>
          </PosterCard>

          <PosterCard
            accent="amber"
            title="Revenue Diagnostic"
            kicker="Step 2"
            subtitle="Score the setup and find the weak spots"
          >
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-white/75">
              {!snapshot ? (
                <div>Locked until Snapshot is complete.</div>
              ) : !latestDiagnostic ? (
                <div>Ready to run. Generate the first scorecard and unlock trend tracking.</div>
              ) : (
                <>
                  <div>
                    Composite:{" "}
                    <span className="font-semibold text-white">{latestComposite}</span>
                    {diagnosticDelta !== null ? (
                      <span
                        className={`ml-2 font-semibold ${
                          diagnosticDelta >= 0 ? "text-emerald-200" : "text-rose-200"
                        }`}
                      >
                        {diagnosticDelta >= 0 ? "+" : ""}
                        {diagnosticDelta}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-white/50">
                    Saved {formatDateTime(latestDiagnostic.createdAt)}
                  </div>
                </>
              )}
            </div>

            {diagnosticBars.length > 0 ? (
              <div className="mt-3 grid gap-1.5">
                {diagnosticBars.slice(0, 3).map((bar) => (
                  <MiniScoreBar key={bar.label} label={bar.short} value={bar.value} tone={bar.tone} />
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryBtn href={snapshot ? "/dashboard/diagnostic" : "/dashboard/snapshot"}>
                {snapshot ? "Run Diagnostic" : "Go to Snapshot"}
              </PrimaryBtn>
            </div>
          </PosterCard>

          <PosterCard
            accent="pink"
            title="Offer Blueprint"
            kicker="Step 3"
            subtitle="Turn your signal into a monetization lane"
          >
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-white/75">
              {latestOffer ? (
                <>
                  <div className="text-sm font-semibold text-white">
                    {latestOffer.title?.trim() || "Untitled blueprint"}
                  </div>
                  <div className="mt-1">Lane: {latestOffer.lane}</div>
                  <div className="mt-1 text-white/70">
                    {latestOffer.goal?.trim() || latestOffer.audience?.trim() || latestOffer.vibe?.trim() || "Add positioning details in the editor."}
                  </div>
                  <div className="mt-1 text-white/50">Updated {formatDate(latestOffer.updatedAt)}</div>
                </>
              ) : (
                <div>No blueprint yet. Build one to unlock execution loops.</div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {latestOffer ? (
                <PrimaryBtn href={`/dashboard/offers/${latestOffer.id}`}>Open Workspace</PrimaryBtn>
              ) : (
                <PrimaryBtn href="/dashboard/offers/new">Build Blueprint</PrimaryBtn>
              )}
              <GhostBtn href="/dashboard/offers">Offer Library</GhostBtn>
            </div>
          </PosterCard>

          <PosterCard
            accent="cyan"
            title="Execution Stats"
            kicker="Step 4"
            subtitle="The operator board for your Chicago run"
          >
            <div className="grid gap-2 text-xs">
              <StatLine label="Runs logged" value={String(runCount)} />
              <StatLine label="Daily check-ins" value={String(checkInCount)} />
              <StatLine label="Revenue tracked" value={formatMoney(totalRevenueCents)} />
              <StatLine label="Best score seen" value={bestDimension !== null ? String(bestDimension) : "—"} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryBtn href={latestOffer ? `/dashboard/offers/${latestOffer.id}` : "/dashboard/offers/new"}>
                {latestOffer ? "Log Execution" : "Create Offer"}
              </PrimaryBtn>
              <GhostBtn href="/dashboard/analytics">Analytics</GhostBtn>
            </div>
          </PosterCard>
        </div>

        <div className="xl:col-span-5 grid gap-4">
          <Shell title="Daily Nudge" subtitle="Operator mode for the next best move" accent="cyan">
            <DailyNudgePanel />
          </Shell>

          <Shell title="Chicago Pulse" subtitle="Live signal board for Stage 1 creators" accent="pink">
            <ChicagoPulsePanel />
          </Shell>
        </div>
      </section>

      {/* DIAGNOSTIC TREND BOARD */}
      <section className="rounded-[1.6rem] border border-white/10 bg-black/35 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-white/55">Festival Trend Wall</div>
            <h2 className="mt-1 text-lg font-black tracking-tight text-white">Diagnostic History Board</h2>
            <p className="mt-1 text-sm text-white/70">
              Run diagnostics after meaningful changes and watch the score climb like a route board.
            </p>
          </div>
          <Link
            href="/dashboard/diagnostic"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Open Diagnostic →
          </Link>
        </div>

        {diagnosticHistory.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
            No diagnostic runs yet. Run your first diagnostic and this wall will light up.
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <PosterMetric label="Latest Composite" value={latestComposite !== null ? String(latestComposite) : "—"} sub="Most recent run" tone="cyan" />
              <PosterMetric
                label="Delta"
                value={
                  diagnosticDelta === null
                    ? "—"
                    : `${diagnosticDelta >= 0 ? "+" : ""}${diagnosticDelta}`
                }
                sub="Vs previous run"
                tone={diagnosticDelta === null ? "emerald" : diagnosticDelta >= 0 ? "emerald" : "pink"}
              />
              <PosterMetric label="Runs Saved" value={String(diagnosticHistory.length)} sub="History entries" tone="gold" />
              <PosterMetric label="Best Dimension" value={bestDimension !== null ? String(bestDimension) : "—"} sub="Highest single score" tone="pink" />
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {diagnosticHistory.map((run, idx) => {
                const composite = diagnosticComposite(run.scores);
                const rows = [
                  { label: "M", value: run.scores.monetization, tone: "bg-emerald-400" },
                  { label: "A", value: run.scores.audience, tone: "bg-cyan-400" },
                  { label: "O", value: run.scores.offer, tone: "bg-fuchsia-400" },
                  { label: "MO", value: run.scores.momentum, tone: "bg-amber-300" },
                  { label: "C", value: run.scores.clarity, tone: "bg-rose-400" },
                ];

                return (
                  <div key={run.id} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {idx === 0 ? "Latest Run" : `Run ${diagnosticHistory.length - idx}`}
                        </div>
                        <div className="text-xs text-white/50">{formatDateTime(run.createdAt)}</div>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                        Composite <span className="font-semibold text-white">{composite}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-1.5">
                      {rows.map((row) => (
                        <MiniScoreBar key={row.label} label={row.label} value={row.value} tone={row.tone} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Shell({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "cyan" | "pink";
  children: ReactNode;
}) {
  const accentBg =
    accent === "cyan"
      ? "from-cyan-400/12 via-blue-500/8 to-transparent"
      : "from-fuchsia-400/12 via-rose-400/8 to-transparent";

  return (
    <div className={`rounded-[1.4rem] border border-white/10 bg-gradient-to-b ${accentBg} p-3`}>
      <div className="mb-2 px-1">
        <div className="text-xs uppercase tracking-[0.18em] text-white/55">{title}</div>
        <div className="mt-0.5 text-xs text-white/70">{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

function PosterCard({
  title,
  kicker,
  subtitle,
  accent,
  className,
  children,
}: {
  title: string;
  kicker: string;
  subtitle: string;
  accent: "emerald" | "amber" | "pink" | "cyan";
  className?: string;
  children: ReactNode;
}) {
  const topBar =
    accent === "emerald"
      ? "from-emerald-400 to-lime-400"
      : accent === "amber"
      ? "from-amber-300 to-orange-500"
      : accent === "pink"
      ? "from-fuchsia-400 to-pink-500"
      : "from-cyan-400 to-blue-500";

  return (
    <div className={`tr-tilt relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35 p-4 ${className || ""}`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${topBar}`} />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-[0.18em] text-white/55">{kicker}</div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-widest text-white/70">
            CHI
          </span>
        </div>
        <h3 className="mt-1 text-lg font-black tracking-tight text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function Sticker({
  tone,
  children,
}: {
  tone: "cyan" | "pink" | "gold" | "emerald";
  children: ReactNode;
}) {
  const cls =
    tone === "cyan"
      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
      : tone === "pink"
      ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
      : tone === "gold"
      ? "border-amber-300/20 bg-amber-400/10 text-amber-100"
      : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100";

  return <span className={`rounded-full border px-2.5 py-1 font-semibold ${cls}`}>{children}</span>;
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85">
      {children}
    </span>
  );
}

function PosterMetric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "cyan" | "pink" | "gold" | "emerald";
}) {
  const toneClass =
    tone === "cyan"
      ? "from-cyan-400/12 to-blue-500/12 border-cyan-300/10"
      : tone === "pink"
      ? "from-fuchsia-400/12 to-pink-500/12 border-fuchsia-300/10"
      : tone === "gold"
      ? "from-amber-300/12 to-orange-500/12 border-amber-300/10"
      : "from-emerald-400/12 to-lime-400/12 border-emerald-300/10";

  return (
    <div className={`rounded-xl border bg-gradient-to-r ${toneClass} p-3`}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
      <div className="mt-1 truncate text-[11px] text-white/60">{sub}</div>
    </div>
  );
}

function QuickActionLink({
  href,
  tone,
  children,
}: {
  href: string;
  tone: "emerald" | "amber" | "pink" | "cyan";
  children: ReactNode;
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-300/15 bg-emerald-400/10 text-emerald-100"
      : tone === "amber"
      ? "border-amber-300/15 bg-amber-400/10 text-amber-100"
      : tone === "pink"
      ? "border-fuchsia-300/15 bg-fuchsia-400/10 text-fuchsia-100"
      : "border-cyan-300/15 bg-cyan-400/10 text-cyan-100";

  return (
    <Link
      href={href}
      className={`rounded-xl border px-3 py-2 text-sm font-medium hover:brightness-110 ${cls}`}
    >
      {children} →
    </Link>
  );
}

function PrimaryBtn({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
    >
      {children} →
    </Link>
  );
}

function GhostBtn({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
    >
      {children} →
    </Link>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <span className="text-white/70">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function MiniScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)_34px] items-center gap-2 text-[11px]">
      <span className="text-white/65">{label}</span>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full ${tone}`} style={{ width: pct(value) }} />
      </div>
      <span className="text-right text-white/70">{value}</span>
    </div>
  );
}

function SignalRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  const valueCls =
    good === undefined ? "text-white/80" : good ? "text-emerald-200" : "text-rose-200";

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <span className="text-white/65">{label}</span>
      <span className={`font-medium ${valueCls}`}>{value}</span>
    </div>
  );
}

function EqualizerBars() {
  const bars = [35, 68, 44, 80, 56, 72, 40, 62, 48, 76, 52, 66];

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-2.5">
      <div className="flex h-14 items-end gap-1.5">
        {bars.map((h, i) => (
          <div
            key={`${h}-${i}`}
            className="flex-1 rounded-t bg-gradient-to-t from-cyan-400/60 via-fuchsia-400/70 to-amber-300/70 animate-pulse"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 90}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/45">
        signal bars • poster mode • chicago stage
      </div>
    </div>
  );
}