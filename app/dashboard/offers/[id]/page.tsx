// app/dashboard/offers/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import CopyBlock from "./CopyBlock";
import ExecutionRunsPanel from "./ExecutionRunsPanel";
import OfferEditorPanel from "./OfferEditorPanel";
import UpgradeGate from "@/app/dashboard/_components/UpgradeGate";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";

function startOfChicagoDay(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = Number(parts.find((p) => p.type === "year")?.value || "1970");
  const m = Number(parts.find((p) => p.type === "month")?.value || "01");
  const day = Number(parts.find((p) => p.type === "day")?.value || "01");

  // Store day-bucket as a UTC DateTime for the Chicago calendar day.
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0, 0));
}

function pickFirstAction(plan: any): string {
  const a = plan?.next7Days?.actions;
  if (Array.isArray(a) && a.length) return String(a[0]);
  return "Do one 15-minute execution block today (outreach or content).";
}

function pickFocus(plan: any): string {
  const f = plan?.next7Days?.focus;
  if (typeof f === "string" && f.trim()) return f.trim();
  return "Keep momentum: execute daily, iterate weekly.";
}

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userPlan = await getUserPlan(userId);
  const canIterate = hasAccess(userPlan, "RIVER_NORTH");
  const canAssets = hasAccess(userPlan, "RIVER_NORTH");
  const canEdit = hasAccess(userPlan, "SOUTH_LOOP");

  const offer = await db.offerBlueprint.findUnique({ where: { id } });
  if (!offer) return notFound();
  if (offer.userId !== userId) return notFound();

  const pricing = Array.isArray(offer.pricing) ? (offer.pricing as any[]) : [];
  const deliverables = Array.isArray(offer.deliverables) ? (offer.deliverables as any[]) : [];
  const funnel = Array.isArray(offer.funnel) ? (offer.funnel as any[]) : [];
  const scripts = (offer.scripts as any) || {};

  const runsDTO = canIterate
    ? (
        await db.executionRun.findMany({
          where: { userId, offerId: offer.id },
          orderBy: { createdAt: "desc" },
        })
      ).map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        channel: r.channel,
        outreachCount: r.outreachCount,
        leadsCount: r.leadsCount,
        callsBooked: r.callsBooked,
        salesCount: r.salesCount,
        revenueCents: r.revenueCents,
        whatWorked: r.whatWorked,
        whatDidnt: r.whatDidnt,
        blockers: r.blockers,
        notes: r.notes,
        iterationPlanJson: r.iterationPlanJson as any,
      }))
    : [];

  const latestRun = runsDTO[0] || null;
  const iterationPlan = (latestRun?.iterationPlanJson as any) || null;

  const todaysCheckIn = canIterate
    ? await db.offerDailyCheckIn.findUnique({
        where: {
          offerId_day: { offerId: offer.id, day: startOfChicagoDay(new Date()) },
        },
      })
    : null;

  const needsCheckIn = canIterate ? !todaysCheckIn : false;
  const focus = pickFocus(iterationPlan);
  const nextAction = pickFirstAction(iterationPlan);

  return (
    <div className="grid gap-6 p-6">
      {/* Offer header */}
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Stage 1 • Chicago</div>
            <h1 className="mt-1 text-2xl font-extrabold">{offer.title}</h1>
            <p className="mt-2 text-white/70">{offer.promise}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/offers"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              ← Offer Library
            </Link>
            <Link
              href="/dashboard/offers/new"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              New Blueprint
            </Link>
            <Link
              href="/dashboard/diagnostic"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Diagnostic
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
            Lane: <span className="text-white/80">{offer.lane}</span>
          </span>
          {offer.goal ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Goal: <span className="text-white/80">{offer.goal}</span>
            </span>
          ) : null}
          {offer.audience ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Audience: <span className="text-white/80">{offer.audience}</span>
            </span>
          ) : null}
          {offer.vibe ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Vibe: <span className="text-white/80">{offer.vibe}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Blueprint Editor */}
      {canEdit ? (
        <OfferEditorPanel
          offerId={offer.id}
          initial={{
            lane: offer.lane,
            title: offer.title,
            promise: offer.promise,
            goal: offer.goal,
            audience: offer.audience,
            vibe: offer.vibe,
            pricing: offer.pricing,
            deliverables: offer.deliverables,
            funnel: offer.funnel,
            scripts: offer.scripts,
          }}
        />
      ) : (
        <UpgradeGate
          title="Unlock Offer Blueprint Editing"
          message="Free users can view limited results, but editing Offer Blueprints is unlocked on South Loop and above."
          currentPlan={userPlan}
          requiredPlan="SOUTH_LOOP"
          primaryCtaHref="/pricing"
          primaryCtaLabel="Upgrade to South Loop →"
          secondaryCtaHref="/dashboard"
          secondaryCtaLabel="Back to Dashboard"
        />
      )}

      {canIterate ? (
        <>
          {/* Offer-level Daily Nudge row */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/60">Daily Nudge</div>
                <div className="mt-1 text-lg font-extrabold text-white/90">
                  Do this next (today).
                </div>
                <div className="mt-2 text-sm text-white/70">{focus}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs ${
                    needsCheckIn
                      ? "border-amber-400/25 bg-amber-500/10 text-amber-200"
                      : "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                  }`}
                >
                  {needsCheckIn ? "Check-in not done" : "Checked in today"}
                </span>

                <Link
                  href="#daily-checkin"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  {needsCheckIn ? "Save check-in →" : "Update check-in →"}
                </Link>

                <Link
                  href="#log-run"
                  className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Log run →
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">One next action</div>
                <div className="mt-2 text-sm text-white/85">{nextAction}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">If you have 15 minutes</div>
                <div className="mt-2 text-sm text-white/85">
                  Do a micro-block now, then save the check-in so the streak stays alive.
                </div>
              </div>
            </div>
          </section>

          {/* Iteration + Optimization */}
          <ExecutionRunsPanel offerId={offer.id} initialRuns={runsDTO as any} />
        </>
      ) : (
        <UpgradeGate
          title="Unlock Iteration Engine"
          message="Log execution runs, generate weekly iteration plans, and save daily check-ins. This is unlocked on River North and above."
          currentPlan={userPlan}
          requiredPlan="RIVER_NORTH"
          primaryCtaHref="/pricing"
          primaryCtaLabel="Upgrade to River North →"
          secondaryCtaHref="/dashboard/diagnostic"
          secondaryCtaLabel="Back to Diagnostic"
        />
      )}

      {/* Pricing ladder */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <h2 className="text-lg font-extrabold">Pricing ladder</h2>
        <p className="mt-1 text-sm text-white/60">
          Entry → Core → Premium. Keep it simple and easy to say in a DM.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {pricing.length ? (
            pricing.map((p, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">{p.tier}</div>
                <div className="mt-1 text-2xl font-extrabold">{p.price}</div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
                  {(p.includes ?? []).map((x: string, i: number) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-sm text-white/70">No pricing saved.</div>
          )}
        </div>
      </section>

      {/* Deliverables + Funnel */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-extrabold">Deliverables checklist</h2>
          <p className="mt-1 text-sm text-white/60">
            What you must include so the offer feels “real”.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/80">
            {deliverables.length ? (
              deliverables.map((d: string, i: number) => <li key={i}>{d}</li>)
            ) : (
              <li>No deliverables saved.</li>
            )}
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <h2 className="text-lg font-extrabold">Mini funnel</h2>
          <p className="mt-1 text-sm text-white/60">Traffic → Convert → Deliver → Upsell</p>
          <div className="mt-4 grid gap-3">
            {funnel.length ? (
              funnel.map((f, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs text-white/60">{f.step}</div>
                  <div className="mt-1 text-sm text-white/80">{f.action}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-white/70">No funnel steps saved.</div>
            )}
          </div>
        </section>
      </div>

      {/* Scripts */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <h2 className="text-lg font-extrabold">Scripts (copy/paste)</h2>
        <p className="mt-1 text-sm text-white/60">Use these immediately in DMs and captions.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <CopyBlock title="DM opener" text={scripts.dm ?? ""} />
          <CopyBlock title="Caption" text={scripts.caption ?? ""} />
          <CopyBlock title="Follow-up" text={scripts.followUp ?? ""} />
        </div>
      </section>

      {/* Next */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="text-sm text-white/70">
          Next page after this: <span className="text-white">Execution Assets</span> (email
          sequence + landing page copy).
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {canAssets ? (
            <Link
              href={`/dashboard/assets?offerId=${offer.id}`}
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Generate Execution Assets →
            </Link>
          ) : (
            <Link
              href="/pricing"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Execution Assets locked — Upgrade →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}