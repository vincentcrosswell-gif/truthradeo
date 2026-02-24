import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

export default async function DashboardPage() {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);
  if (!userId) redirect("/sign-in");

  const [
    snapshot,
    latestOffer,
    runCount,
    checkInCount,
    revenueAgg,
    recentDiagnostics,
  ] = await Promise.all([
    db.creatorSnapshot.findUnique({
      where: { userId },
      select: {
        id: true,
        artistName: true,
        cityArea: true,
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

  return (
    <div className="grid gap-6">
      {/* Hero */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              TruthRadeo • Stage 1
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              Chicago Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Your home base for Snapshot → Diagnostic → Offer Blueprint → Execution.
              Keep the flow moving and track progress without hunting through pages.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
            <div>Signed in as</div>
            <div className="mt-1 font-semibold text-white/90">
              {user?.emailAddresses?.[0]?.emailAddress ?? "Unknown"}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Workspace Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Snapshot */}
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="text-xs text-white/60">Step 1</div>
          <h2 className="mt-1 text-lg font-extrabold">Creator Snapshot</h2>
          <p className="mt-2 text-sm text-white/70">
            Capture your artist profile and revenue signal.
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            {snapshot ? (
              <>
                <div className="font-semibold text-white/90">
                  {snapshot.artistName?.trim() || "Artist name not set"}
                </div>
                <div className="mt-1">{snapshot.cityArea || "Chicago"}</div>
                <div className="mt-1 text-white/50">
                  Updated {formatDate(snapshot.updatedAt)}
                </div>
              </>
            ) : (
              <div>No snapshot yet.</div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/snapshot"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              {snapshot ? "Edit Snapshot" : "Start Snapshot"}
            </Link>
            {snapshot ? (
              <Link
                href="/dashboard/snapshot/summary"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Summary
              </Link>
            ) : null}
          </div>
        </div>

        {/* Diagnostic */}
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="text-xs text-white/60">Step 2</div>
          <h2 className="mt-1 text-lg font-extrabold">Revenue Diagnostic</h2>
          <p className="mt-2 text-sm text-white/70">
            Generate scorecards and top moves from your Snapshot.
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            {snapshot ? (
              latestDiagnostic ? (
                <>
                  <div>
                    Latest composite:{" "}
                    <span className="font-semibold text-white">
                      {latestComposite}
                    </span>
                    {diagnosticDelta !== null ? (
                      <span
                        className={`ml-2 ${
                          diagnosticDelta >= 0 ? "text-emerald-300" : "text-rose-300"
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
              ) : (
                <div>Ready to run from your latest Snapshot.</div>
              )
            ) : (
              <div>Complete Snapshot first to unlock this step.</div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={snapshot ? "/dashboard/diagnostic" : "/dashboard/snapshot"}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              {snapshot ? "Run Diagnostic" : "Go to Snapshot"}
            </Link>
          </div>
        </div>

        {/* Offer Workspace */}
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="text-xs text-white/60">Step 3+</div>
          <h2 className="mt-1 text-lg font-extrabold">Offer Workspace</h2>
          <p className="mt-2 text-sm text-white/70">
            Build or open your latest blueprint and start execution.
          </p>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
            {latestOffer ? (
              <>
                <div className="font-semibold text-white/90">
                  {latestOffer.title?.trim() || "Untitled blueprint"}
                </div>
                <div className="mt-1">Lane: {latestOffer.lane}</div>
                <div className="mt-1 text-white/50">
                  Updated {formatDate(latestOffer.updatedAt)}
                </div>
              </>
            ) : (
              <div>No blueprint yet.</div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {latestOffer ? (
              <Link
                href={`/dashboard/offers/${latestOffer.id}`}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Open Workspace
              </Link>
            ) : (
              <Link
                href="/dashboard/offers/new"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                New Blueprint
              </Link>
            )}

            <Link
              href="/dashboard/offers/new"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Build New
            </Link>
          </div>
        </div>

        {/* Progress / Metrics */}
        <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
          <div className="text-xs text-white/60">Progress</div>
          <h2 className="mt-1 text-lg font-extrabold">Execution Stats</h2>
          <p className="mt-2 text-sm text-white/70">
            Quick numbers from your current Stage 1 activity.
          </p>

          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-white/70">Runs logged</span>
              <span className="font-semibold text-white">{runCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-white/70">Daily check-ins</span>
              <span className="font-semibold text-white">{checkInCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-white/70">Revenue logged</span>
              <span className="font-semibold text-white">
                {formatMoney(totalRevenueCents)}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href={latestOffer ? `/dashboard/offers/${latestOffer.id}` : "/dashboard/offers/new"}
              className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              {latestOffer ? "Log execution" : "Create first offer"}
            </Link>
          </div>
        </div>
      </section>

      {/* Diagnostic Trend Summary */}
      <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Diagnostic History</div>
            <h2 className="mt-1 text-lg font-extrabold">Trend snapshot</h2>
            <p className="mt-1 text-sm text-white/70">
              Track whether your score improves as you update your Snapshot and execute.
            </p>
          </div>
          <Link
            href="/dashboard/diagnostic"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Open Diagnostic →
          </Link>
        </div>

        {diagnosticHistory.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
            No diagnostic runs saved yet. Run the Diagnostic once and your history will appear here.
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Latest composite</div>
                <div className="mt-1 text-xl font-extrabold">{latestComposite}</div>
                <div className="mt-1 text-xs text-white/50">
                  {formatDateTime(latestDiagnostic?.createdAt)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Change vs previous</div>
                <div
                  className={`mt-1 text-xl font-extrabold ${
                    diagnosticDelta === null
                      ? "text-white"
                      : diagnosticDelta >= 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                  }`}
                >
                  {diagnosticDelta === null
                    ? "—"
                    : `${diagnosticDelta >= 0 ? "+" : ""}${diagnosticDelta}`}
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {diagnosticDelta === null ? "Need 2 runs" : "Composite delta"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Runs stored</div>
                <div className="mt-1 text-xl font-extrabold">{diagnosticHistory.length}</div>
                <div className="mt-1 text-xs text-white/50">Showing recent runs</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="text-xs text-white/60">Best current score</div>
                <div className="mt-1 text-xl font-extrabold">
                  {latestDiagnostic
                    ? Math.max(
                        latestDiagnostic.scores.monetization,
                        latestDiagnostic.scores.audience,
                        latestDiagnostic.scores.offer,
                        latestDiagnostic.scores.momentum,
                        latestDiagnostic.scores.clarity
                      )
                    : "—"}
                </div>
                <div className="mt-1 text-xs text-white/50">Highest dimension</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {diagnosticHistory.map((r, idx) => {
                const comp = diagnosticComposite(r.scores);
                return (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                  >
                    <div className="text-sm">
                      <div className="font-semibold text-white/90">
                        {idx === 0 ? "Latest run" : `Run ${diagnosticHistory.length - idx}`}
                      </div>
                      <div className="text-xs text-white/50">
                        {formatDateTime(r.createdAt)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Chip label="Composite" value={comp} />
                      <Chip label="M" value={r.scores.monetization} />
                      <Chip label="A" value={r.scores.audience} />
                      <Chip label="O" value={r.scores.offer} />
                      <Chip label="Mo" value={r.scores.momentum} />
                      <Chip label="C" value={r.scores.clarity} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Your existing retention / insight panels stay here */}
      <DailyNudgePanel />
      <ChicagoPulsePanel />
    </div>
  );
}

function Chip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
      <span className="text-white/55">{label}</span>{" "}
      <span className="font-semibold text-white/90">{value}</span>
    </div>
  );
}