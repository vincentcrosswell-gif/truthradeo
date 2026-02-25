// app/dashboard/ChicagoPulsePanel.tsx
import type { ReactNode } from "react";
import { db } from "@/lib/db";

type CountItem = { label: string; count: number };

function clean(s: string) {
  return (s || "").trim();
}

function splitCommaTags(s: string) {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function bump(map: Map<string, number>, key: string) {
  const k = clean(key);
  if (!k) return;
  map.set(k, (map.get(k) ?? 0) + 1);
}

function topN(map: Map<string, number>, n = 6): CountItem[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

function pct(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function normalizeCity(value: string) {
  return clean(value);
}

function isChicagoCity(value: string) {
  const v = clean(value).toLowerCase();
  return Boolean(v) && v.startsWith("chicago");
}

function formatUpdated(value: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function BarRow({
  item,
  total,
  accentClass,
}: {
  item: CountItem;
  total: number;
  accentClass: string;
}) {
  const p = pct(item.count, total);
  const w = Math.max(8, p);

  return (
    <div className="min-w-0 grid gap-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-white/40" />
          <span className="truncate font-semibold text-white/85" title={item.label}>
            {item.label}
          </span>
        </div>
        <div className="shrink-0 text-xs text-white/60">
          {item.count} • {p}%
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`tr-bar tr-shimmer h-2 rounded-full ${accentClass}`}
          style={{ ["--w" as any]: `${w}%` }}
        />
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">{label}</div>
      <div className="mt-1 break-words text-xl font-black tracking-tight text-white sm:text-2xl">
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-white/60">{sub}</div> : null}
    </div>
  );
}

function GroupCard({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold tracking-wide text-white/85">{title}</h3>
        {note ? <span className="text-[11px] text-white/50">{note}</span> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default async function ChicagoPulsePanel() {
  const snapshots = await db.creatorSnapshot.findMany({
    select: {
      updatedAt: true,
      cityArea: true,
      genre: true,
      vibeTags: true,
      primaryGoal: true,
      audienceSize: true,
      emailList: true,
      monthlyListeners: true,
      priceRange: true,
      performanceFrequency: true,
      biggestBlocker: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 2500,
  });

  const chicagoSnapshots = snapshots.filter((s) => isChicagoCity(normalizeCity(s.cityArea)));
  const total = chicagoSnapshots.length;

  const genres = new Map<string, number>();
  const vibes = new Map<string, number>();
  const goals = new Map<string, number>();
  const audience = new Map<string, number>();
  const listeners = new Map<string, number>();
  const prices = new Map<string, number>();
  const performances = new Map<string, number>();
  const blockers = new Map<string, number>();

  let latestISO = "";

  for (const s of chicagoSnapshots) {
    if (s.updatedAt) latestISO = s.updatedAt.toISOString();

    bump(genres, s.genre);
    for (const tag of splitCommaTags(s.vibeTags)) bump(vibes, tag);
    bump(goals, s.primaryGoal);
    bump(audience, s.audienceSize);
    bump(listeners, s.monthlyListeners);
    bump(prices, s.priceRange);
    bump(performances, s.performanceFrequency);
    bump(blockers, s.biggestBlocker);
  }

  const topGenres = topN(genres, 6);
  const topVibes = topN(vibes, 6);
  const topGoals = topN(goals, 4);
  const topAudience = topN(audience, 4);
  const topListeners = topN(listeners, 4);
  const topPrices = topN(prices, 4);
  const topPerformances = topN(performances, 4);
  const topBlockers = topN(blockers, 5);

  const topGenreLabel = topGenres[0]?.label ?? "—";
  const topVibeLabel = topVibes[0]?.label ?? "—";
  const topGoalLabel = topGoals[0]?.label ?? "—";
  const topBlockerLabel = topBlockers[0]?.label ?? "—";

  return (
    <section className="min-w-0 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
            <span className="inline-block h-2 w-2 rounded-full bg-white/50" />
            Chicago Pulse
          </div>

          <h2 className="mt-3 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            What Chicago creators are doing right now
          </h2>

          <p className="mt-1 max-w-3xl text-sm text-white/70">
            Live Stage 1 city signal. Use it to shape your promise around what Chicago creators want most and what is blocking them.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/60">
          Updated <span className="font-semibold text-white/80">{formatUpdated(latestISO)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Chicago signals" value={String(total)} sub="Snapshots detected" />
        <StatPill label="Top genre" value={topGenreLabel} sub="Most common genre" />
        <StatPill label="Top vibe" value={topVibeLabel} sub="Most common vibe tag" />
        <StatPill label="Top blocker" value={topBlockerLabel} sub="Most common friction" />
      </div>

      {total === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/65">
          No Chicago snapshots yet. Complete the Creator Snapshot with a city starting with “Chicago” (ex: Chicago or Chicago, IL) to light this board up.
        </div>
      ) : (
        <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-7 grid min-w-0 gap-4 md:grid-cols-2">
            <GroupCard title="Top Genres" note="Chicago-only">
              <div className="grid gap-3">
                {topGenres.map((item) => (
                  <BarRow
                    key={`genre-${item.label}`}
                    item={item}
                    total={total}
                    accentClass="bg-gradient-to-r from-cyan-400/40 via-cyan-300/60 to-blue-300/80"
                  />
                ))}
              </div>
            </GroupCard>

            <GroupCard title="Vibe Tags" note="culture texture">
              <div className="grid gap-3">
                {topVibes.length ? (
                  topVibes.map((item) => (
                    <BarRow
                      key={`vibe-${item.label}`}
                      item={item}
                      total={total}
                      accentClass="bg-gradient-to-r from-fuchsia-400/35 via-pink-300/60 to-amber-300/70"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">Add comma-separated vibe tags in Snapshot to populate this.</div>
                )}
              </div>
            </GroupCard>

            <div className="md:col-span-2 min-w-0 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">Direction Board</div>
                <div className="text-[11px] text-white/50">Most common goal: <span className="font-semibold text-white/75">{topGoalLabel}</span></div>
              </div>

              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                <div className="min-w-0">
                  <div className="mb-2 text-xs uppercase tracking-[0.14em] text-white/50">Primary goals</div>
                  <div className="grid gap-3">
                    {topGoals.length ? (
                      topGoals.map((g) => (
                        <BarRow
                          key={`goal-${g.label}`}
                          item={g}
                          total={total}
                          accentClass="bg-gradient-to-r from-emerald-400/35 via-lime-300/60 to-cyan-300/70"
                        />
                      ))
                    ) : (
                      <div className="text-sm text-white/60">No goal data yet.</div>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 text-xs uppercase tracking-[0.14em] text-white/50">Top blockers</div>
                  <div className="grid gap-2">
                    {topBlockers.length ? (
                      topBlockers.map((b) => (
                        <div
                          key={`block-${b.label}`}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <span className="truncate font-semibold text-white/85" title={b.label}>
                            {b.label}
                          </span>
                          <span className="text-xs text-white/60">
                            {b.count} • {pct(b.count, total)}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-white/60">No blocker data yet.</div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-white/55">
                    Tip: position your offer as the fix for the top blocker, not just a louder version of what everyone else has.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 grid min-w-0 gap-4">
            <GroupCard title="Audience Ranges" note="who is in the room">
              <div className="grid gap-3">
                {topAudience.length ? (
                  topAudience.map((a) => (
                    <BarRow
                      key={`aud-${a.label}`}
                      item={a}
                      total={total}
                      accentClass="bg-gradient-to-r from-blue-400/35 via-cyan-300/60 to-white/70"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">No audience data yet.</div>
                )}
              </div>
            </GroupCard>

            <GroupCard title="Monthly Listeners" note="range clusters">
              <div className="grid gap-3">
                {topListeners.length ? (
                  topListeners.map((l) => (
                    <BarRow
                      key={`listener-${l.label}`}
                      item={l}
                      total={total}
                      accentClass="bg-gradient-to-r from-violet-400/35 via-fuchsia-300/60 to-white/70"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">No listener data yet.</div>
                )}
              </div>
            </GroupCard>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <GroupCard title="Price Ranges" note="packaging market">
                <div className="grid gap-3">
                  {topPrices.length ? (
                    topPrices.map((p) => (
                      <BarRow
                        key={`price-${p.label}`}
                        item={p}
                        total={total}
                        accentClass="bg-gradient-to-r from-amber-300/35 via-orange-300/60 to-white/70"
                      />
                    ))
                  ) : (
                    <div className="text-sm text-white/60">No price data yet.</div>
                  )}
                </div>
              </GroupCard>

              <GroupCard title="Performance Frequency" note="stage rhythm">
                <div className="grid gap-3">
                  {topPerformances.length ? (
                    topPerformances.map((p) => (
                      <BarRow
                        key={`perf-${p.label}`}
                        item={p}
                        total={total}
                        accentClass="bg-gradient-to-r from-rose-400/35 via-pink-300/60 to-white/70"
                      />
                    ))
                  ) : (
                    <div className="text-sm text-white/60">No performance data yet.</div>
                  )}
                </div>
              </GroupCard>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
        <span className="font-bold text-white/85">How to use Pulse:</span> If your genre looks crowded, compete sharper—not louder. Match the city’s top blocker with a clear promise and a price point creators can act on.
      </div>
    </section>
  );
}
