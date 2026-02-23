// app/dashboard/offers/new/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import OfferNewClient from "./OfferNewClient";
import UpgradeGate from "@/app/dashboard/_components/UpgradeGate";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";
import { db } from "@/lib/db";

export default async function OfferNewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const plan = await getUserPlan(userId);

  // Offer Architect is paid.
  if (!hasAccess(plan, "SOUTH_LOOP")) {
    return (
      <div className="grid gap-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
          <div className="text-xs text-white/60">Stage 1 • Chicago</div>
          <h1 className="mt-1 text-2xl font-extrabold">Offer Architect</h1>
          <p className="mt-2 text-white/70">
            Pick a lane → generate a pricing ladder + funnel + scripts.
          </p>
        </div>

        <UpgradeGate
          title="Unlock Offer Architect"
          message="Free users can complete the Snapshot + Diagnostic, but creating Offer Blueprints is a paid unlock."
          currentPlan={plan}
          requiredPlan="SOUTH_LOOP"
          primaryCtaHref="/pricing"
          primaryCtaLabel="Upgrade to South Loop →"
          secondaryCtaHref="/dashboard/diagnostic"
          secondaryCtaLabel="Run Diagnostic"
        />
      </div>
    );
  }

  // South Loop can create 1 blueprint. River North+ unlimited.
  if (plan === "SOUTH_LOOP") {
    const count = await db.offerBlueprint.count({ where: { userId } });
    if (count >= 1) {
      const latest = await db.offerBlueprint.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true },
      });

      return (
        <div className="grid gap-6 p-6">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
            <div className="text-xs text-white/60">Stage 1 • Chicago</div>
            <h1 className="mt-1 text-2xl font-extrabold">Offer Architect</h1>
            <p className="mt-2 text-white/70">
              You’ve hit the South Loop limit:{" "}
              <span className="text-white">1 blueprint</span>.
            </p>
          </div>

          <UpgradeGate
            title="Create more blueprints"
            message="South Loop includes 1 Offer Blueprint. Upgrade to River North to unlock unlimited blueprints + Execution Assets + Iteration."
            currentPlan={plan}
            requiredPlan="RIVER_NORTH"
            primaryCtaHref="/pricing"
            primaryCtaLabel="Upgrade to River North →"
            secondaryCtaHref={
              latest?.id ? `/dashboard/offers/${latest.id}` : "/dashboard"
            }
            secondaryCtaLabel={latest?.id ? "Open your blueprint" : "Back to Dashboard"}
          />

          {latest?.id ? (
            <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="text-xs text-white/60">Your current workspace</div>
              <div className="mt-1 text-lg font-extrabold">
                {latest.title || "Untitled blueprint"}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/offers/${latest.id}`}
                  className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Open Offer Workspace →
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Upgrade for more
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      );
    }
  }

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="text-xs text-white/60">Stage 1 • Chicago</div>
        <h1 className="mt-1 text-2xl font-extrabold">Offer Architect</h1>
        <p className="mt-2 text-white/70">
          Pick a lane → generate a pricing ladder + funnel + scripts.
        </p>
      </div>

      <OfferNewClient />
    </div>
  );
}