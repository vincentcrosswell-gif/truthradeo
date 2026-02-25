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

function clean(v?: string | null) {
  const s = (v || "").trim();
  return s || "—";
}

function money(cents?: number | null) {
  const n = Number(cents || 0);
  return `$${(n / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function splitTags(v?: string | null) {
  return (v || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 6);
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
  const vibeTags = splitTags(offer.vibe);
  const latestScore = latestRun?.iterationPlanJson?.scorecard || null;

  const consoleModules = [
    { label: "Pricing Tiers", value: String(pricing.length), tone: "cyan" as const },
    { label: "Deliverables", value: String(deliverables.length), tone: "emerald" as const },
    { label: "Funnel Steps", value: String(funnel.length), tone: "pink" as const },
    { label: "Runs Logged", value: String(runsDTO.length), tone: "amber" as const },
  ];

  return (
    <div className="relative grid gap-6 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_6%_0%,rgba(34,211,238,0.07),transparent_35%),radial-gradient(circle_at_100%_5%,rgba(236,72,153,0.08),transparent_34%),radial-gradient(circle_at_45%_100%,rgba(250,204,21,0.06),transparent_42%)]" />

      {/* Studio Console Header */}
      <section className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/40 p-5 sm:p-6">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.10),transparent_35%),radial-gradient(circle_at_95%_0%,rgba(217,70,239,0.10),transparent_35%)]" />

        <div className="relative grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
              <Badge tone="cyan">Chicago</Badge>
              <Badge tone="pink">Studio Console</Badge>
              <Badge tone="emerald">Offer Workspace</Badge>
              <Badge tone="amber">Stage 1</Badge>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {offer.title}
            </h1>
            <p className="mt-2 text-sm text-white/70">{offer.promise}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Pill label="Lane" value={clean(offer.lane)} />
              {offer.goal ? <Pill label="Goal" value={clean(offer.goal)} /> : null}
              {offer.audience ? <Pill label="Audience" value={clean(offer.audience)} /> : null}
            </div>

            {vibeTags.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {vibeTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/dashboard/offers"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                ← Offer Library
              </Link>
              <Link
                href="/dashboard/offers/new"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                New Blueprint
              </Link>
              <Link
                href="/dashboard/diagnostic"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                Diagnostic
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/55">Control Rack</div>
                  <div className="mt-1 text-sm font-bold text-white">Workspace Access</div>
                </div>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse" />
              </div>

              <div className="mt-3 grid gap-2">
                <AccessRow label="Blueprint Editing" enabled={canEdit} />
                <AccessRow label="Iteration Engine" enabled={canIterate} />
                <AccessRow label="Execution Assets" enabled={canAssets} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Console Modules</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {consoleModules.map((m) => (
                  <MiniMetric key={m.label} label={m.label} value={m.value} tone={m.tone} />
                ))}
              </div>

              {canIterate ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                    Latest run
                  </div>
                  <div className="mt-1 text-xs text-white/80">
                    {latestRun
                      ? `${new Date(latestRun.createdAt).toLocaleDateString()} • ${latestRun.channel || "—"} • ${money(latestRun.revenueCents)}`
                      : "No runs logged yet"}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Offer Editor Console */}
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

      {/* Daily Nudge + Iteration */}
      {canIterate ? (
        <>
          <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 sm:p-6">
            <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-white/55">Daily Nudge</div>
                    <div className="mt-1 text-lg font-black tracking-tight text-white">
                      Control Strip • Today’s Focus
                    </div>
                    <div className="mt-2 text-sm text-white/70">{focus}</div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${
                      needsCheckIn
                        ? "border-amber-400/25 bg-amber-500/10 text-amber-200"
                        : "border-emerald-400/25 bg-emerald-500/10 text-emerald-200"
                    }`}
                  >
                    {needsCheckIn ? "Check-in not done" : "Checked in today"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                      One next action
                    </div>
                    <div className="mt-1 text-xs text-white/85">{nextAction}</div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                      Micro block
                    </div>
                    <div className="mt-1 text-xs text-white/85">
                      Do a 15-minute push, then log the check-in to keep the streak alive.
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="#daily-checkin"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                  >
                    {needsCheckIn ? "Save check-in →" : "Update check-in →"}
                  </Link>
                  <Link
                    href="#log-run"
                    className="rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
                  >
                    Log run →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">Iteration Scoreboard</div>

                <div className="mt-3 grid gap-2">
                  <MiniStatLine
                    label="Lead Rate"
                    value={
                      latestScore?.leadRate != null
                        ? `${Math.round(Number(latestScore.leadRate) * 100)}%`
                        : "—"
                    }
                  />
                  <MiniStatLine
                    label="Close Rate"
                    value={
                      latestScore?.closeRate != null
                        ? `${Math.round(Number(latestScore.closeRate) * 100)}%`
                        : "—"
                    }
                  />
                  <MiniStatLine
                    label="Revenue (latest)"
                    value={latestRun ? money(latestRun.revenueCents) : "—"}
                  />
                  <MiniStatLine
                    label="Runs Logged"
                    value={String(runsDTO.length)}
                  />
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                  The ExecutionRunsPanel below is still your engine. This upgrade turns the surrounding
                  workspace into a clearer “studio console” shell.
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/25 p-2">
            <div className="rounded-[1.1rem] border border-white/10 bg-black/20 p-3">
              <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">
                    Execution Engine
                  </div>
                  <div className="text-sm font-semibold text-white/90">
                    Runs • Check-ins • Iteration Plan
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                  River North+
                </span>
              </div>

              <ExecutionRunsPanel offerId={offer.id} initialRuns={runsDTO as any} />
            </div>
          </section>
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

      {/* Console modules grid */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* Pricing */}
        <section className="xl:col-span-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-white/55">Pricing Patch Bay</div>
              <h2 className="mt-1 text-lg font-black tracking-tight text-white">Pricing ladder</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {pricing.length} tier{pricing.length === 1 ? "" : "s"}
            </span>
          </div>

          <p className="mt-1 text-sm text-white/60">
            Entry → Core → Premium. Easy to pitch in DMs and easy to deliver.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pricing.length ? (
              pricing.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="text-xs text-white/55">{p?.tier || `Tier ${idx + 1}`}</div>
                  <div className="mt-1 text-xl font-black text-white">{p?.price || "—"}</div>
                  <ul className="mt-3 grid gap-1 text-xs text-white/80">
                    {Array.isArray(p?.includes) && p.includes.length ? (
                      p.includes.map((x: string, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          <span>{x}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-white/55">No included items listed.</li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                No pricing saved.
              </div>
            )}
          </div>
        </section>

        {/* Deliverables + Funnel */}
        <div className="xl:col-span-6 grid gap-4">
          <section className="rounded-3xl border border-white/10 bg-black/30 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">Scope Checklist</div>
                <h2 className="mt-1 text-lg font-black tracking-tight text-white">Deliverables</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {deliverables.length}
              </span>
            </div>

            <ul className="mt-3 grid gap-2 text-sm text-white/80">
              {deliverables.length ? (
                deliverables.map((d: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span>{d}</span>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/60">
                  No deliverables saved.
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/30 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">Flow Strip</div>
                <h2 className="mt-1 text-lg font-black tracking-tight text-white">Mini funnel</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {funnel.length} step{funnel.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-3 grid gap-2">
              {funnel.length ? (
                funnel.map((f: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">
                      {f?.step || `Step ${i + 1}`}
                    </div>
                    <div className="mt-1 text-sm text-white/85">{f?.action || "—"}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                  No funnel steps saved.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Scripts */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">Script Rack</div>
            <h2 className="mt-1 text-lg font-black tracking-tight text-white">
              Scripts (copy/paste)
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Use these immediately for DMs, captions, and follow-ups.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Ready to use
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <CopyBlock title="DM opener" text={scripts.dm ?? ""} />
          <CopyBlock title="Caption" text={scripts.caption ?? ""} />
          <CopyBlock title="Follow-up" text={scripts.followUp ?? ""} />
        </div>
      </section>

      {/* Next / Assets Dock */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-white/55">Asset Generator Dock</div>
            <h2 className="mt-1 text-lg font-black tracking-tight text-white">
              Execution Assets
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Next module generates offer page copy, DM scripts, email sequence, and rollout assets
              from this blueprint.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/50">Access</div>
            <div className="mt-1 text-sm text-white/85">
              {canAssets
                ? "Unlocked on your current plan."
                : "Locked — available on River North and above."}
            </div>

            <div className="mt-3">
              {canAssets ? (
                <Link
                  href={`/dashboard/assets?offerId=${offer.id}`}
                  className="inline-flex rounded-xl border border-cyan-300/20 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20"
                >
                  Generate Execution Assets →
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                >
                  Upgrade to unlock →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "cyan" | "pink" | "emerald" | "amber";
}) {
  const cls =
    tone === "cyan"
      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
      : tone === "pink"
        ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
        : tone === "emerald"
          ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
          : "border-amber-300/20 bg-amber-400/10 text-amber-100";

  return <span className={`rounded-full border px-2.5 py-1 ${cls}`}>{children}</span>;
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
      {label}: <span className="text-white/85">{value}</span>
    </span>
  );
}

function AccessRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
      <span className="text-white/75">{label}</span>
      <span
        className={`rounded-full border px-2 py-0.5 ${
          enabled
            ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
            : "border-amber-300/20 bg-amber-400/10 text-amber-100"
        }`}
      >
        {enabled ? "ON" : "LOCKED"}
      </span>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "emerald" | "pink" | "amber";
}) {
  const cls =
    tone === "cyan"
      ? "from-cyan-400/10 to-blue-500/10 border-cyan-300/10"
      : tone === "emerald"
        ? "from-emerald-400/10 to-lime-400/10 border-emerald-300/10"
        : tone === "pink"
          ? "from-fuchsia-400/10 to-pink-500/10 border-fuchsia-300/10"
          : "from-amber-300/10 to-orange-500/10 border-amber-300/10";

  return (
    <div className={`rounded-xl border bg-gradient-to-b ${cls} p-2.5`}>
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/55">{label}</div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
    </div>
  );
}

function MiniStatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
      <span className="text-white/60">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}