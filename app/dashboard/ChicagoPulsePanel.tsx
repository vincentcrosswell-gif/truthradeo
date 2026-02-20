// app/dashboard/ChicagoPulsePanel.tsx
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
  const v = clean(value);
  if (!v) return "";
  // If they typed only "Chicago", keep it.
  // If it's "Chicago, IL", keep it.
  return v;
}

function isChicagoCity(value: string) {
  const v = clean(value).toLowerCase();
  if (!v) return false;
  // matches "Chicago" or "Chicago, IL" etc
  return v.startsWith("chicago");
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
  const w = Math.max(6, p); // ensures visible bar
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-white/40" />
          <span className="truncate font-semibold text-white/85">
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 tr-shimmer">
      <div className="text-xs uppercase tracking-wider text-white/50">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black tracking-tight text-white">
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-white/60">{sub}</div> : null}
    </div>
  );
}

export default async function ChicagoPulsePanel() {
  // Pull latest snapshots (we filter to Chicago locally)
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

  const chicagoSnapshots = snapshots.filter((s) =>
    isChicagoCity(normalizeCity(s.cityArea))
  );

  const total = chicagoSnapshots.length;

  const genres = new Map<string, number>();
  const vibes = new Map<string, number>();
  const goals = new Map<string, number>();
  const audience = new Map<string, number>();
  const emails = new Map<string, number>();
  const listeners = new Map<string, number>();
  const prices = new Map<string, number>();
  const performances = new Map<string, number>();
  const blockers = new Map<string, number>();

  let latestISO = "";

  for (const s of chicagoSnapshots) {
    if (s.updatedAt) latestISO = s.updatedAt.toISOString();

    bump(genres, s.genre);
    bump(goals, s.primaryGoal);
    bump(audience, s.audienceSize);
    bump(emails, s.emailList);
    bump(listeners, s.monthlyListeners);
    bump(prices, s.priceRange);
    bump(performances, s.performanceFrequency);
    bump(blockers, s.biggestBlocker);

    for (const tag of splitCommaTags(s.vibeTags)) bump(vibes, tag);
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
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
            <span className="inline-block h-2 w-2 rounded-full bg-white/50" />
            Chicago Pulse
          </div>

          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
            What Chicago creators are doing right now
          </h2>

          <p className="mt-1 max-w-2xl text-sm text-white/70">
            This is the live economic signal inside Stage 1. Use it to position
            your offer against what Chicago creators actually want — and what’s
            stopping them.
          </p>
        </div>

        <div className="text-xs text-white/50">
          Updated:{" "}
          <span className="font-semibold text-white/70">
            {latestISO || "—"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatPill
          label="Chicago signals"
          value={String(total)}
          sub="Snapshots detected as Chicago"
        />
        <StatPill label="Top genre" value={topGenreLabel} sub="Most common genre" />
        <StatPill label="Top vibe" value={topVibeLabel} sub="Most common vibe tag" />
        <StatPill
          label="Top blocker"
          value={topBlockerLabel}
          sub="Most common friction point"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Column 1 */}
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold tracking-wide text-white/85">
              Top Genres
            </h3>
            <span className="text-xs text-white/50">Chicago-only</span>
          </div>

          <div className="grid gap-4">
            {topGenres.length ? (
              topGenres.map((item) => (
                <BarRow
                  key={item.label}
                  item={item}
                  total={total}
                  accentClass="bg-gradient-to-r from-white/30 to-white/70"
                />
              ))
            ) : (
              <div className="text-sm text-white/60">
                No Chicago snapshots yet. Submit one Snapshot to activate this.
              </div>
            )}
          </div>
        </div>

        {/* Column 2 */}
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold tracking-wide text-white/85">
              Vibe Tags
            </h3>
            <span className="text-xs text-white/50">culture texture</span>
          </div>

          <div className="grid gap-4">
            {topVibes.length ? (
              topVibes.map((item) => (
                <BarRow
                  key={item.label}
                  item={item}
                  total={total}
                  accentClass="bg-gradient-to-r from-white/20 via-white/55 to-white/85"
                />
              ))
            ) : (
              <div className="text-sm text-white/60">
                Add vibe tags (comma-separated) to light this up.
              </div>
            )}
          </div>
        </div>

        {/* Column 3 */}
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold tracking-wide text-white/85">
              Chicago Direction
            </h3>
            <span className="text-xs text-white/50">goals + ranges</span>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-wider text-white/50">
                Primary goals
              </div>
              <div className="grid gap-3">
                {topGoals.length ? (
                  topGoals.map((g) => (
                    <BarRow
                      key={g.label}
                      item={g}
                      total={total}
                      accentClass="bg-gradient-to-r from-white/15 to-white/65"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">No goal data yet.</div>
                )}
              </div>
              <div className="text-xs text-white/55">
                Most common goal:{" "}
                <span className="font-semibold text-white/80">
                  {topGoalLabel}
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-wider text-white/50">
                Audience size (ranges)
              </div>
              <div className="grid gap-3">
                {topAudience.length ? (
                  topAudience.map((a) => (
                    <BarRow
                      key={a.label}
                      item={a}
                      total={total}
                      accentClass="bg-gradient-to-r from-white/10 via-white/45 to-white/75"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">No audience data yet.</div>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-wider text-white/50">
                Monthly listeners (ranges)
              </div>
              <div className="grid gap-3">
                {topListeners.length ? (
                  topListeners.map((l) => (
                    <BarRow
                      key={l.label}
                      item={l}
                      total={total}
                      accentClass="bg-gradient-to-r from-white/10 to-white/70"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">No listener data yet.</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wider text-white/50">
                Most common blockers
              </div>
              <ul className="mt-2 grid gap-2 text-sm text-white/75">
                {topBlockers.length ? (
                  topBlockers.map((b) => (
                    <li
                      key={b.label}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="truncate font-semibold">{b.label}</span>
                      <span className="shrink-0 text-xs text-white/60">
                        {b.count} • {pct(b.count, total)}%
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-white/60">No blocker data yet.</li>
                )}
              </ul>

              <div className="mt-3 text-xs text-white/55">
                Tip: Your offer converts faster when it directly attacks the top
                blocker.
              </div>
            </div>

            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-wider text-white/50">
                Price ranges
              </div>
              <div className="grid gap-3">
                {topPrices.length ? (
                  topPrices.map((p) => (
                    <BarRow
                      key={p.label}
                      item={p}
                      total={total}
                      accentClass="bg-gradient-to-r from-white/15 to-white/60"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">No price data yet.</div>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-wider text-white/50">
                Performance frequency
              </div>
              <div className="grid gap-3">
                {topPerformances.length ? (
                  topPerformances.map((p) => (
                    <BarRow
                      key={p.label}
                      item={p}
                      total={total}
                      accentClass="bg-gradient-to-r from-white/10 via-white/40 to-white/70"
                    />
                  ))
                ) : (
                  <div className="text-sm text-white/60">
                    No performance data yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
        <span className="font-bold text-white/85">How to use Pulse:</span>{" "}
        If your genre is saturated, don’t compete louder — compete sharper. Align
        your offer with the city’s #1 blocker, then position your promise like a
        solution Chicago creators actually need.
      </div>
    </section>
  );
}