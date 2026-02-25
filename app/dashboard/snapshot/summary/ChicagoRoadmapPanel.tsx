// app/dashboard/snapshot/summary/ChicagoRoadmapPanel.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { generateChicagoRoadmap, type SnapshotLike } from "@/lib/roadmap/chicago";

const WEEK_PALETTE = [
  {
    bar: "from-emerald-400 to-lime-400",
    soft: "from-emerald-400/12 via-lime-400/8 to-transparent border-emerald-300/10",
    chip: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    dot: "bg-emerald-300",
  },
  {
    bar: "from-cyan-400 to-blue-500",
    soft: "from-cyan-400/12 via-blue-500/8 to-transparent border-cyan-300/10",
    chip: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    dot: "bg-cyan-300",
  },
  {
    bar: "from-fuchsia-400 to-pink-500",
    soft: "from-fuchsia-400/12 via-pink-500/8 to-transparent border-fuchsia-300/10",
    chip: "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100",
    dot: "bg-fuchsia-300",
  },
  {
    bar: "from-amber-300 to-orange-500",
    soft: "from-amber-300/12 via-orange-500/8 to-transparent border-amber-300/10",
    chip: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    dot: "bg-amber-300",
  },
] as const;

function clean(v?: string | null) {
  const s = (v || "").trim();
  return s || "—";
}

function splitTags(v?: string | null) {
  return (v || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function snapshotCompleteness(snapshot: SnapshotLike) {
  const checks = [
    snapshot.artistName,
    snapshot.cityArea,
    snapshot.genre,
    snapshot.primaryGoal,
    snapshot.audienceSize,
    snapshot.emailList,
    snapshot.monthlyListeners,
    snapshot.currentIncomeStreams,
    snapshot.currentOffer,
    snapshot.priceRange,
    snapshot.upcomingRelease,
    snapshot.performanceFrequency,
    snapshot.collabTargets,
    snapshot.biggestBlocker,
  ];

  const total = checks.length;
  const filled = checks.reduce((acc, item) => acc + ((item || "").trim() ? 1 : 0), 0);
  const pct = Math.round((filled / total) * 100);

  return { filled, total, pct };
}

export default function ChicagoRoadmapPanel({ snapshot }: { snapshot: SnapshotLike }) {
  const rm = generateChicagoRoadmap(snapshot);
  const vibes = splitTags(snapshot.vibeTags);
  const completeness = snapshotCompleteness(snapshot);

  const routeStops = rm.weeks.map((w, i) => ({
    label: `W${i + 1}`,
    title: w.title.replace("Week ", "Wk "),
    metric: w.focusMetric,
    progress: (i + 1) * 25,
  }));

  return (
    <section className="tr-noise tr-sheen relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/35 p-4 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(34,211,238,0.14),transparent_42%),radial-gradient(circle_at_92%_6%,rgba(217,70,239,0.14),transparent_36%),radial-gradient(circle_at_55%_100%,rgba(250,204,21,0.10),transparent_45%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative">
        {/* HERO / POSTER TOP */}
        <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[1.35rem] border border-white/10 bg-black/30 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
              <ToneBadge tone="cyan">Stage 1</ToneBadge>
              <ToneBadge tone="pink">Chicago</ToneBadge>
              <ToneBadge tone="gold">30-Day City Run</ToneBadge>
              <ToneBadge tone="emerald">Roadmap Engine</ToneBadge>
            </div>

            <div className="mt-3">
              <div className="text-xs uppercase tracking-[0.18em] text-white/55">
                Chicago Route Board
              </div>
              <h2 className="tr-display mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {rm.headline}
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-white/70">{rm.subhead}</p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <MetricTile label="City" value={clean(snapshot.cityArea)} tone="cyan" />
              <MetricTile label="Goal" value={clean(snapshot.primaryGoal)} tone="pink" />
              <MetricTile label="Blocker" value={clean(snapshot.biggestBlocker)} tone="rose" />
              <MetricTile label="Audience" value={clean(snapshot.audienceSize)} tone="emerald" />
              <MetricTile label="Listeners" value={clean(snapshot.monthlyListeners)} tone="gold" />
              <MetricTile label="Price" value={clean(snapshot.priceRange)} tone="cyan" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/offers/new"
                className="rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
              >
                Generate Offer →
              </Link>
              <Link
                href="/dashboard/diagnostic"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                Run Diagnostic →
              </Link>
              <Link
                href="/dashboard/snapshot"
                className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-2 text-sm text-fuchsia-100 hover:bg-fuchsia-400/15"
              >
                Edit Snapshot →
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/55">Road Readiness</div>
                  <div className="mt-1 text-base font-black tracking-tight text-white">
                    Snapshot Signal
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] tracking-widest text-white/70">
                  LIVE
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400"
                  style={{ width: `${Math.max(10, completeness.pct)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-white/60">Completeness</span>
                <span className="font-semibold text-white">
                  {completeness.pct}% ({completeness.filled}/{completeness.total})
                </span>
              </div>

              <div className="mt-3 grid gap-1.5 text-xs">
                <SignalRow label="Artist" value={clean(snapshot.artistName)} />
                <SignalRow label="Genre" value={clean(snapshot.genre)} />
                <SignalRow label="Performance" value={clean(snapshot.performanceFrequency)} />
                <SignalRow label="Upcoming release" value={clean(snapshot.upcomingRelease)} />
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Street Flyers</div>
              <div className="mt-1 text-sm font-semibold text-white">Quick Wins (Today)</div>

              <div className="mt-3 grid gap-2">
                {rm.quickWins.map((q, i) => (
                  <div
                    key={q}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80"
                  >
                    <span className="mr-2 text-white/45">{i + 1}.</span>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROUTE STRIP */}
        <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">CTA Route Strip</div>
              <div className="mt-1 text-sm font-semibold text-white">30-Day City Run Map</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] tracking-widest text-white/70">
              WEEKLY STOPS
            </span>
          </div>

          <div className="relative mt-4 overflow-x-auto pb-1">
            <div className="min-w-[760px]">
              <div className="pointer-events-none absolute left-6 right-6 top-[19px] h-[2px] rounded-full bg-gradient-to-r from-emerald-300/50 via-cyan-300/45 via-50% to-amber-300/45" />
              <div className="relative grid grid-cols-4 gap-3">
                {routeStops.map((stop, i) => {
                  const palette = WEEK_PALETTE[i % WEEK_PALETTE.length];

                  return (
                    <div
                      key={stop.label}
                      className={`rounded-2xl border bg-gradient-to-b ${palette.soft} p-3`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="relative mt-0.5">
                          <div className="grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-black/40 text-[10px] font-bold text-white">
                            {i + 1}
                          </div>
                          <span
                            className={`absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border border-black/60 ${palette.dot}`}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-white">{stop.label}</div>
                          <div className="text-[10px] text-white/55 line-clamp-1">{stop.title}</div>
                        </div>
                      </div>

                      <div className="mt-2 h-1.5 rounded-full bg-white/10">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${palette.bar}`}
                          style={{ width: `${stop.progress}%` }}
                        />
                      </div>

                      <div className="mt-2 text-[10px] text-white/60 line-clamp-2">{stop.metric}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN BENTO */}
        <div className="mt-5 grid gap-4 xl:grid-cols-12">
          {/* WEEK CARDS */}
          <div className="xl:col-span-8 grid gap-4 md:grid-cols-2">
            {rm.weeks.map((w, i) => (
              <WeekCard
                key={w.title}
                week={w}
                index={i}
                palette={WEEK_PALETTE[i % WEEK_PALETTE.length]}
              />
            ))}
          </div>

          {/* SIDE BOARD */}
          <div className="xl:col-span-4 grid gap-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Chicago Artist Signal</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">
                Snapshot Context
              </h3>

              <div className="mt-3 space-y-2 text-xs">
                <InfoCard label="Artist" value={clean(snapshot.artistName)} />
                <InfoCard label="Current offer" value={clean(snapshot.currentOffer)} />
                <InfoCard label="Income streams" value={clean(snapshot.currentIncomeStreams)} />
                <InfoCard label="Collab targets" value={clean(snapshot.collabTargets)} />
              </div>

              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">Vibe tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(vibes.length ? vibes : ["No vibe tags yet"]).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Weekly Focus Meter</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">Route Priorities</h3>

              <div className="mt-3 grid gap-2">
                {rm.weeks.map((w, i) => {
                  const palette = WEEK_PALETTE[i % WEEK_PALETTE.length];
                  const meter = [28, 52, 76, 100][i] ?? 50;

                  return (
                    <div key={`focus-${w.title}`} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white/80">Week {i + 1}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${palette.chip}`}>
                          {meter}%
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-white/60 line-clamp-2">{w.focusMetric}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/10">
                        <div
                          className={`h-1.5 rounded-full bg-gradient-to-r ${palette.bar}`}
                          style={{ width: `${meter}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Road Rules</div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white">How to use this board</h3>

              <ul className="mt-3 grid gap-2 text-xs text-white/75">
                <Bullet>Pick one primary channel for the full 30-day cycle.</Bullet>
                <Bullet>Reuse one CTA and one core offer until you get signal.</Bullet>
                <Bullet>Track only the week focus metric + one revenue metric.</Bullet>
                <Bullet>Run Diagnostic after a real change, not daily.</Bullet>
                <Bullet>Carry winning tasks into the next 30-day loop.</Bullet>
              </ul>

              <div className="mt-3 rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-3 text-xs text-white/65">
                This roadmap is rule-based (fast + stable). Later we can blend in Diagnostic + OfferBlueprint
                data to make the weekly tasks even tighter.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WeekCard({
  week,
  index,
  palette,
}: {
  week: {
    title: string;
    focusMetric: string;
    top3: string[];
    tasks: string[];
    chicagoMove: string;
  };
  index: number;
  palette: (typeof WEEK_PALETTE)[number];
}) {
  const topTasks = week.tasks.slice(0, 6);

  return (
    <div className={`tr-tilt relative overflow-hidden rounded-[1.25rem] border bg-gradient-to-b ${palette.soft} p-4`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.bar}`} />
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/5 blur-2xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] tracking-widest ${palette.chip}`}>
                W{index + 1}
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/55">Chicago Move</span>
            </div>
            <h3 className="mt-2 text-base font-black tracking-tight text-white">{week.title}</h3>
            <div className="mt-1 text-xs text-white/60">
              Focus metric: <span className="text-white/85">{week.focusMetric}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-right">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">Tasks</div>
            <div className="text-sm font-semibold text-white">{week.tasks.length}</div>
          </div>
        </div>

        <div className="mt-3 grid gap-3">
          <Panel title="Top 3" toneChip={palette.chip}>
            <div className="grid gap-1.5">
              {week.top3.map((t) => (
                <TaskLine key={t} text={t} toneDot={palette.dot} />
              ))}
            </div>
          </Panel>

          <Panel title="Task List" toneChip={palette.chip}>
            <div className="grid gap-1.5">
              {topTasks.map((t) => (
                <TaskLine key={t} text={t} toneDot={palette.dot} />
              ))}
            </div>
            {week.tasks.length > topTasks.length ? (
              <div className="mt-2 text-[11px] text-white/50">
                +{week.tasks.length - topTasks.length} more tasks in this week plan
              </div>
            ) : null}
          </Panel>

          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">Chicago-native move</div>
            <div className="mt-1 text-xs font-semibold text-white/85">{week.chicagoMove}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  toneChip,
  children,
}: {
  title: string;
  toneChip: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">{title}</div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${toneChip}`}>CHI</span>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TaskLine({ text, toneDot }: { text: string; toneDot: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-white/80">
      <span className="mt-[3px] inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/15 bg-black/25">
        <span className={`h-1.5 w-1.5 rounded-full ${toneDot}`} />
      </span>
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

function ToneBadge({
  tone,
  children,
}: {
  tone: "emerald" | "cyan" | "pink" | "gold";
  children: ReactNode;
}) {
  const cls =
    tone === "emerald"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
      : tone === "cyan"
      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
      : tone === "pink"
      ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
      : "border-amber-300/20 bg-amber-400/10 text-amber-100";

  return (
    <span className={`rounded-full border px-2.5 py-1 font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "pink" | "rose" | "emerald" | "gold";
}) {
  const cls =
    tone === "cyan"
      ? "from-cyan-400/12 to-blue-500/12 border-cyan-300/10"
      : tone === "pink"
      ? "from-fuchsia-400/12 to-pink-500/12 border-fuchsia-300/10"
      : tone === "rose"
      ? "from-rose-400/12 to-red-500/12 border-rose-300/10"
      : tone === "emerald"
      ? "from-emerald-400/12 to-lime-400/12 border-emerald-300/10"
      : "from-amber-300/12 to-orange-500/12 border-amber-300/10";

  return (
    <div className={`rounded-xl border bg-gradient-to-r ${cls} p-2.5`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">{label}</div>
      <div className="mt-1 line-clamp-2 text-xs font-semibold text-white">{value}</div>
    </div>
  );
}

function SignalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <span className="text-white/60">{label}</span>
      <span className="max-w-[65%] text-right text-white/85">{value}</span>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">{label}</div>
      <div className="mt-1 text-xs text-white/85">{value}</div>
    </div>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/45" />
      <span>{children}</span>
    </li>
  );
}