import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ChicagoPulsePanel from "./ChicagoPulsePanel";
import DailyNudgePanel from "./DailyNudgePanel";

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

export default async function DashboardPage() {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);
  if (!userId) redirect("/sign-in");

  const [snapshot, latestOffer, runCount, checkInCount, revenueAgg] = await Promise.all([
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
  ]);

  const totalRevenueCents = revenueAgg._sum.revenueCents ?? 0;

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
              <div>Ready to run from your latest Snapshot.</div>
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

      {/* Your existing retention / insight panels stay here */}
      <DailyNudgePanel />
      <ChicagoPulsePanel />
    </div>
  );
}