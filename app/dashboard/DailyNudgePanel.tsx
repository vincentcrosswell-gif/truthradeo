// app/dashboard/DailyNudgePanel.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";
import UpgradeGate from "@/app/dashboard/_components/UpgradeGate";

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

  // Store as an unambiguous UTC DateTime bucket for that Chicago calendar day.
  return new Date(Date.UTC(y, m - 1, day, 0, 0, 0, 0));
}

function pickFirstAction(plan: any): string {
  const a = plan?.next7Days?.actions;
  if (Array.isArray(a) && a.length) return String(a[0]);
  return "Do one small outreach block today (15 minutes).";
}

function pickFocus(plan: any): string {
  const f = plan?.next7Days?.focus;
  if (typeof f === "string" && f.trim()) return f.trim();
  return "Keep momentum: execute daily, iterate weekly.";
}

function pickTargets(plan: any): string[] {
  const t = plan?.next7Days?.targets;
  if (Array.isArray(t) && t.length) return t.map((x) => String(x)).slice(0, 3);
  return ["1 check-in today", "1 execution block", "1 follow-up batch"];
}

export default async function DailyNudgePanel() {
  const { userId } = await auth();
  if (!userId) return null;

  const plan = await getUserPlan(userId);

  // If user is FREE, nudge them to upgrade (Offer Architect is paid).
  if (!hasAccess(plan, "SOUTH_LOOP")) {
    return (
      <UpgradeGate
        title="Turn your Snapshot into an offer"
        message="Free includes Snapshot + Diagnostic. Upgrade to South Loop to unlock Offer Architect (blueprints). Upgrade to River North for Execution Assets + Iteration."
        currentPlan={plan}
        requiredPlan="SOUTH_LOOP"
        primaryCtaHref="/pricing"
        primaryCtaLabel="Upgrade to South Loop →"
        secondaryCtaHref="/dashboard/diagnostic"
        secondaryCtaLabel="Run Diagnostic"
      />
    );
  }

  // Latest offer for this user (the “active workspace”)
  const offer = await db.offerBlueprint.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (!offer) {
    return (
      <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Daily Nudge</div>
            <h2 className="mt-1 text-lg font-extrabold">You’re 1 blueprint away.</h2>
            <p className="mt-2 text-sm text-white/70">
              Create an offer workspace so the dashboard can guide your daily execution.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/diagnostic"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Run Diagnostic →
            </Link>
            <Link
              href="/dashboard/offers/new"
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              New Blueprint →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // South Loop can view the workspace, but Iteration + Daily Check-ins are River North.
  if (!hasAccess(plan, "RIVER_NORTH")) {
    return (
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Daily Nudge</div>
            <h2 className="mt-1 text-xl font-extrabold">Your blueprint is ready.</h2>
            <p className="mt-2 text-sm text-white/70">
              Upgrade to <span className="text-white">River North</span> to unlock daily
              check-ins + execution run logs + weekly iteration plans.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/offers/${offer.id}`}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Open Offer Workspace →
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Upgrade →
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Active offer</div>
            <div className="mt-1 text-base font-semibold text-white/90">
              {offer.title || "Untitled blueprint"}
            </div>
            <div className="mt-2 text-xs text-white/60">
              Lane: <span className="text-white/80">{offer.lane}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Locked on South Loop</div>
            <div className="mt-2 text-sm text-white/85">
              Daily check-in streaks, run logs, and iteration plans.
            </div>
            <div className="mt-3 text-xs text-white/50">
              That’s the retention engine — it keeps artists executing.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Fastest path</div>
            <div className="mt-2 text-sm text-white/85">
              Upgrade → open the workspace → log your first run.
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Latest iteration plan = latest execution run (if any)
  const latestRun = await db.executionRun.findFirst({
    where: { userId, offerId: offer.id },
    orderBy: { createdAt: "desc" },
  });

  const iterationPlan = (latestRun?.iterationPlanJson as any) || null;

  // Today check-in status
  const today = startOfChicagoDay(new Date());

  const todaysCheckIn = await db.offerDailyCheckIn.findUnique({
    where: { offerId_day: { offerId: offer.id, day: today } },
  });

  const needsCheckIn = !todaysCheckIn;

  const nextAction = pickFirstAction(iterationPlan);
  const focus = pickFocus(iterationPlan);
  const targets = pickTargets(iterationPlan);

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-white/60">Daily Nudge</div>
          <h2 className="mt-1 text-xl font-extrabold">Do this next (today).</h2>
          <p className="mt-2 text-sm text-white/70">{focus}</p>
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
            href={`/dashboard/offers/${offer.id}`}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Open Offer Workspace →
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Active offer</div>
          <div className="mt-1 text-base font-semibold text-white/90">
            {offer.title || "Untitled blueprint"}
          </div>
          <div className="mt-2 text-xs text-white/60">
            Lane: <span className="text-white/80">{offer.lane}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">One next action</div>
          <div className="mt-2 text-sm text-white/85">{nextAction}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/offers/${offer.id}`}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Do it now →
            </Link>

            {needsCheckIn ? (
              <Link
                href={`/dashboard/offers/${offer.id}`}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Save check-in →
              </Link>
            ) : (
              <Link
                href={`/dashboard/offers/${offer.id}`}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Update check-in →
              </Link>
            )}
          </div>

          <div className="mt-3 text-xs text-white/50">
            Tip: scroll to “Daily check-in (60s)” inside the offer workspace.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-xs text-white/60">Targets (next 7 days)</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/85">
            {targets.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>

          {!latestRun ? (
            <div className="mt-3 text-xs text-white/60">
              No iteration plan yet — log your first run to generate one.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}