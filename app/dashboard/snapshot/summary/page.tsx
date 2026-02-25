import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import ChicagoRoadmapPanel from "./ChicagoRoadmapPanel";

function clean(v?: string | null) {
  const s = (v || "").trim();
  return s || "—";
}

function completeness(snapshot: {
  artistName?: string | null;
  cityArea?: string | null;
  genre?: string | null;
  primaryGoal?: string | null;
  audienceSize?: string | null;
  emailList?: string | null;
  monthlyListeners?: string | null;
  currentIncomeStreams?: string | null;
  currentOffer?: string | null;
  priceRange?: string | null;
  upcomingRelease?: string | null;
  performanceFrequency?: string | null;
  collabTargets?: string | null;
  biggestBlocker?: string | null;
}) {
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
  const filled = checks.reduce((sum, x) => sum + (((x || "").trim() ? 1 : 0)), 0);
  const pct = Math.round((filled / total) * 100);
  return { total, filled, pct };
}

export default async function SnapshotSummaryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });

  if (!snapshot) {
    return (
      <div className="p-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.12),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(217,70,239,0.12),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(250,204,21,0.08),transparent_45%)]" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">Stage 1 • Chicago</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-white">
              No Snapshot Found Yet
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Your Chicago stage board lights up after you complete the Creator Snapshot.
              That powers the roadmap, diagnostic prompts, and offer generation.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/snapshot"
                className="rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
              >
                Create Snapshot →
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const comp = completeness(snapshot);

  return (
    <div className="relative grid gap-6 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_5%_0%,rgba(34,211,238,0.08),transparent_32%),radial-gradient(circle_at_95%_5%,rgba(236,72,153,0.09),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(250,204,21,0.07),transparent_38%)]" />

      {/* Header poster */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/40 p-5 sm:p-6">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-100">
                  Chicago
                </span>
                <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-2.5 py-1 text-fuchsia-100">
                  Snapshot Summary
                </span>
                <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2.5 py-1 text-amber-100">
                  Stage 1 Board
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Chicago Creator Profile
              </h1>
              <p className="mt-2 text-sm text-white/70">
                This is your revenue profile for the Chicago stage. It feeds your 30-day roadmap,
                helps shape diagnostics, and keeps your offers aligned with the artist you actually are.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/diagnostic"
                  className="rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
                >
                  Run Revenue Diagnostic →
                </Link>
                <Link
                  href="/dashboard/snapshot"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                >
                  Edit Snapshot
                </Link>
                <Link
                  href="/dashboard/offers/new"
                  className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-2 text-sm text-fuchsia-100 hover:bg-fuchsia-400/15"
                >
                  Generate Offer →
                </Link>
              </div>
            </div>

            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/55">Profile Readiness</div>
                  <div className="mt-1 text-sm font-bold text-white">Signal Strength</div>
                </div>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse" />
              </div>

              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400"
                  style={{ width: `${Math.max(8, comp.pct)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-white/60">Filled fields</span>
                <span className="font-semibold text-white">
                  {comp.pct}% ({comp.filled}/{comp.total})
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-xs">
                <MiniInfo label="Artist" value={clean(snapshot.artistName)} />
                <MiniInfo label="Genre" value={clean(snapshot.genre)} />
                <MiniInfo label="Goal" value={clean(snapshot.primaryGoal)} />
                <MiniInfo label="Blocker" value={clean(snapshot.biggestBlocker)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Snapshot quick board */}
      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Street Flyer Board</div>
              <h2 className="mt-1 text-lg font-black tracking-tight text-white">
                Snapshot Details
              </h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
              LIVE INPUTS
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard label="Artist" value={clean(snapshot.artistName)} tone="cyan" />
            <InfoCard label="City" value={clean(snapshot.cityArea)} tone="blue" />
            <InfoCard label="Genre" value={clean(snapshot.genre)} tone="pink" />
            <InfoCard label="Primary Goal" value={clean(snapshot.primaryGoal)} tone="emerald" />
            <InfoCard label="Biggest Blocker" value={clean(snapshot.biggestBlocker)} tone="rose" />
            <InfoCard label="Price Range" value={clean(snapshot.priceRange)} tone="amber" />
            <InfoCard label="Audience Size" value={clean(snapshot.audienceSize)} tone="cyan" />
            <InfoCard label="Email List" value={clean(snapshot.emailList)} tone="blue" />
            <InfoCard label="Monthly Listeners" value={clean(snapshot.monthlyListeners)} tone="pink" />
            <InfoCard label="Income Streams" value={clean(snapshot.currentIncomeStreams)} tone="emerald" />
            <InfoCard label="Current Offer" value={clean(snapshot.currentOffer)} tone="rose" />
            <InfoCard label="Performance Frequency" value={clean(snapshot.performanceFrequency)} tone="amber" />
          </div>
        </div>

        <div className="xl:col-span-4 grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">Chicago Next Moves</div>
            <h3 className="mt-1 text-base font-black tracking-tight text-white">What this page powers</h3>

            <ul className="mt-3 grid gap-2 text-xs text-white/75">
              <Bullet>Roadmap tasks are generated from your goal + blocker + audience inputs.</Bullet>
              <Bullet>Diagnostic prompts become more targeted with your current offer and revenue signals.</Bullet>
              <Bullet>Offer Architect pulls this context so your pricing + funnel feel aligned.</Bullet>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">Upcoming / Collabs</div>
            <div className="mt-3 grid gap-2 text-xs">
              <MiniInfo label="Upcoming Release" value={clean(snapshot.upcomingRelease)} />
              <MiniInfo label="Collab Targets" value={clean(snapshot.collabTargets)} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">Fast Actions</div>
            <div className="mt-3 grid gap-2">
              <Link
                href="/dashboard/diagnostic"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                Open Diagnostic
              </Link>
              <Link
                href="/dashboard/offers/new"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                New Offer Blueprint
              </Link>
              <Link
                href="/dashboard/snapshot"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                Update Snapshot Inputs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Existing upgraded roadmap panel from Option 2 */}
      <ChicagoRoadmapPanel snapshot={snapshot} />
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <span className="text-white/60">{label}</span>
      <span className="max-w-[65%] text-right text-white/85">{value}</span>
    </div>
  );
}

function InfoCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "blue" | "pink" | "emerald" | "rose" | "amber";
}) {
  const toneMap: Record<typeof tone, string> = {
    cyan: "from-cyan-400/12 to-cyan-300/5 border-cyan-300/10",
    blue: "from-blue-400/12 to-indigo-400/5 border-blue-300/10",
    pink: "from-fuchsia-400/12 to-pink-500/5 border-fuchsia-300/10",
    emerald: "from-emerald-400/12 to-lime-400/5 border-emerald-300/10",
    rose: "from-rose-400/12 to-red-400/5 border-rose-300/10",
    amber: "from-amber-300/12 to-orange-500/5 border-amber-300/10",
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-b ${toneMap[tone]} p-3`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">{label}</div>
      <div className="mt-1 text-xs font-semibold leading-relaxed text-white">{value}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/45" />
      <span>{children}</span>
    </li>
  );
}