// app/dashboard/offers/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import UpgradeGate from "@/app/dashboard/_components/UpgradeGate";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";

const LANE_LABELS: Record<string, string> = {
  service: "Service",
  digital: "Digital",
  membership: "Membership",
  live: "Live",
  hybrid: "Hybrid",
};

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

function metricLabel(key: string) {
  switch (key) {
    case "outreach":
      return "Outreach";
    case "leads":
      return "Leads";
    case "sales":
      return "Sales";
    case "revenue":
      return "Revenue";
    case "content":
      return "Content";
    default:
      return "Metric";
  }
}

export default async function OffersLibraryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [plan, offers, revenueByOfferRows, totalRevenueAgg, totalRuns, totalCheckins] =
    await Promise.all([
      getUserPlan(userId),

      db.offerBlueprint.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          lane: true,
          goal: true,
          audience: true,
          vibe: true,
          createdAt: true,
          updatedAt: true,
          executionRuns: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              createdAt: true,
              channel: true,
              outreachCount: true,
              leadsCount: true,
              salesCount: true,
              revenueCents: true,
            },
          },
          dailyCheckIns: {
            orderBy: { day: "desc" },
            take: 1,
            select: {
              id: true,
              day: true,
              energy: true,
              minutesExecuted: true,
              keyMetric: true,
              keyMetricValue: true,
            },
          },
          _count: {
            select: {
              executionRuns: true,
              dailyCheckIns: true,
            },
          },
        },
      }),

      db.executionRun.groupBy({
        by: ["offerId"],
        where: { userId },
        _sum: { revenueCents: true },
      }),

      db.executionRun.aggregate({
        where: { userId },
        _sum: { revenueCents: true },
      }),

      db.executionRun.count({ where: { userId } }),
      db.offerDailyCheckIn.count({ where: { userId } }),
    ]);

  const canCreateOffer = hasAccess(plan, "SOUTH_LOOP");
  const canAssets = hasAccess(plan, "RIVER_NORTH");
  const canIterate = hasAccess(plan, "RIVER_NORTH");

  const revenueByOffer = new Map<string, number>(
    revenueByOfferRows.map((row) => [row.offerId, row._sum.revenueCents ?? 0])
  );

  const totalRevenueCents = totalRevenueAgg._sum.revenueCents ?? 0;

  return (
    <div className="grid gap-6 p-6">
      {/* Header */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              Stage 1 • Chicago
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              Offer Library
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              All your Offer Blueprints in one place. Open a workspace, jump into
              assets, and track which offers are actually getting executed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              ← Dashboard
            </Link>
            <Link
              href="/dashboard/offers/new"
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              New Blueprint →
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Blueprints</div>
            <div className="mt-1 text-2xl font-extrabold">{offers.length}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Runs logged</div>
            <div className="mt-1 text-2xl font-extrabold">{totalRuns}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Check-ins</div>
            <div className="mt-1 text-2xl font-extrabold">{totalCheckins}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Revenue logged</div>
            <div className="mt-1 text-2xl font-extrabold">
              {formatMoney(totalRevenueCents)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-white/70">
            Current plan: <span className="text-white/90">{plan}</span>
          </span>

          {!canCreateOffer ? (
            <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-amber-200">
              Offer creation locked on Free
            </span>
          ) : plan === "SOUTH_LOOP" ? (
            <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-amber-200">
              South Loop: 1 blueprint limit
            </span>
          ) : (
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              Unlimited blueprints unlocked
            </span>
          )}

          {canIterate ? (
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              Iteration Engine unlocked
            </span>
          ) : (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-white/70">
              Iteration + Assets locked (River North)
            </span>
          )}
        </div>
      </section>

      {/* Upgrade gate for free users */}
      {!canCreateOffer ? (
        <UpgradeGate
          title="Unlock Offer Library + Offer Architect"
          message="Free users can complete Snapshot + Diagnostic. Upgrade to South Loop to generate your first Offer Blueprint and start building a real offer workspace."
          currentPlan={plan}
          requiredPlan="SOUTH_LOOP"
          primaryCtaHref="/pricing"
          primaryCtaLabel="Upgrade to South Loop →"
          secondaryCtaHref="/dashboard/diagnostic"
          secondaryCtaLabel="Run Diagnostic"
        />
      ) : null}

      {/* Empty state */}
      {offers.length === 0 ? (
        <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="text-xs text-white/60">No offers yet</div>
          <h2 className="mt-1 text-xl font-extrabold">Create your first blueprint</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Start with Offer Architect and TruthRadeo will generate a pricing ladder,
            funnel, and scripts from your Snapshot. Then this library becomes your
            workspace hub.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/offers/new"
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Open Offer Architect →
            </Link>
            <Link
              href="/dashboard/diagnostic"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Back to Diagnostic
            </Link>
          </div>
        </section>
      ) : null}

      {/* Offer cards */}
      {offers.length > 0 ? (
        <section className="grid gap-4">
          {offers.map((offer) => {
            const latestRun = offer.executionRuns[0] ?? null;
            const latestCheckIn = offer.dailyCheckIns[0] ?? null;
            const revenueCents = revenueByOffer.get(offer.id) ?? 0;

            return (
              <div
                key={offer.id}
                className="rounded-3xl border border-white/10 bg-black/30 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold">
                        {offer.title?.trim() || "Untitled blueprint"}
                      </h2>

                      <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-xs text-white/70">
                        {LANE_LABELS[offer.lane] ?? offer.lane}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                        Updated {formatDate(offer.updatedAt)}
                      </span>

                      {offer.goal ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                          Goal: <span className="text-white/80">{offer.goal}</span>
                        </span>
                      ) : null}

                      {offer.audience ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                          Audience:{" "}
                          <span className="text-white/80">{offer.audience}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right text-xs text-white/60">
                    <div>Created {formatDate(offer.createdAt)}</div>
                    <div className="mt-1">
                      {offer._count.executionRuns} runs • {offer._count.dailyCheckIns} check-ins
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {/* Revenue */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="text-xs text-white/60">Revenue logged</div>
                    <div className="mt-1 text-xl font-extrabold">
                      {formatMoney(revenueCents)}
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      Across {offer._count.executionRuns} execution run
                      {offer._count.executionRuns === 1 ? "" : "s"}
                    </div>
                  </div>

                  {/* Latest run */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="text-xs text-white/60">Latest run</div>
                    {latestRun ? (
                      <>
                        <div className="mt-1 text-sm font-semibold text-white/90">
                          {formatDate(latestRun.createdAt)}
                          {latestRun.channel ? ` • ${latestRun.channel}` : ""}
                        </div>
                        <div className="mt-2 text-xs text-white/70">
                          {latestRun.outreachCount} outreach • {latestRun.leadsCount} leads •{" "}
                          {latestRun.salesCount} sales
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          Run revenue: {formatMoney(latestRun.revenueCents)}
                        </div>
                      </>
                    ) : (
                      <div className="mt-2 text-sm text-white/70">
                        No execution runs logged yet.
                      </div>
                    )}
                  </div>

                  {/* Latest check-in */}
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="text-xs text-white/60">Last check-in</div>
                    {latestCheckIn ? (
                      <>
                        <div className="mt-1 text-sm font-semibold text-white/90">
                          {formatDate(latestCheckIn.day)}
                        </div>
                        <div className="mt-2 text-xs text-white/70">
                          {latestCheckIn.minutesExecuted} min • Energy {latestCheckIn.energy}/5
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          {metricLabel(latestCheckIn.keyMetric)}:{" "}
                          {latestCheckIn.keyMetricValue}
                        </div>
                      </>
                    ) : (
                      <div className="mt-2 text-sm text-white/70">
                        No daily check-ins yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/offers/${offer.id}`}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
                  >
                    Open Workspace →
                  </Link>

                  {canAssets ? (
                    <Link
                      href={`/dashboard/assets?offerId=${offer.id}`}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Execution Assets
                    </Link>
                  ) : (
                    <Link
                      href="/pricing"
                      className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/15"
                    >
                      Unlock Assets (River North)
                    </Link>
                  )}

                  {canIterate ? (
                    <Link
                      href={`/dashboard/offers/${offer.id}#log-run`}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Log Run
                    </Link>
                  ) : (
                    <Link
                      href="/pricing"
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      Unlock Iteration
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}