// app/dashboard/assets/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import CopyBlock from "./CopyBlock";
import { generateExecutionAssets } from "@/lib/execution/chicago";
import UpgradeGate from "@/app/dashboard/_components/UpgradeGate";
import { getUserPlan } from "@/lib/billing/entitlement";
import { hasAccess } from "@/lib/billing/plans";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ offerId?: string }>;
}) {
  const { offerId } = await searchParams;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  if (!offerId) return notFound();

  const offer = await db.offerBlueprint.findUnique({ where: { id: offerId } });
  if (!offer) return notFound();
  if (offer.userId !== userId) return notFound();

  const plan = await getUserPlan(userId);
  const canAccessAssets = hasAccess(plan, "RIVER_NORTH");

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });

  if (!canAccessAssets) {
    return (
      <div className="grid gap-6 p-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs text-white/60">Stage 1 • Chicago</div>
              <h1 className="mt-1 text-2xl font-extrabold">Execution Assets</h1>
              <p className="mt-2 text-white/70">
                Copy/paste launch materials for:{" "}
                <span className="text-white">{offer.title}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/offers/${offer.id}`}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                ← Back to Offer
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Upgrade →
              </Link>
            </div>
          </div>
        </div>

        <UpgradeGate
          title="Unlock Execution Assets"
          message="Execution Assets (offer page copy, DM scripts, email sequence, social rollout, live pitch) unlock on River North and above."
          currentPlan={plan}
          requiredPlan="RIVER_NORTH"
          primaryCtaHref="/pricing"
          primaryCtaLabel="Upgrade to River North →"
          secondaryCtaHref={`/dashboard/offers/${offer.id}`}
          secondaryCtaLabel="Back to Offer"
        />

        <section className="rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="text-xs text-white/60">What you’ll get after upgrading</div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="font-semibold">Launch copy</div>
              <div className="mt-1 text-sm text-white/70">
                Offer page headlines, bullets, FAQ, CTAs.
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="font-semibold">Outreach + conversion</div>
              <div className="mt-1 text-sm text-white/70">
                DM scripts, 5-email sequence, 14-day rollout, live pitch.
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const assets = generateExecutionAssets(
    {
      id: offer.id,
      title: offer.title,
      promise: offer.promise,
      lane: offer.lane,
      goal: offer.goal,
      audience: offer.audience,
      vibe: offer.vibe,
      pricing: offer.pricing,
      deliverables: offer.deliverables,
      funnel: offer.funnel,
    },
    snapshot ?? null
  );

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Stage 1 • Chicago</div>
            <h1 className="mt-1 text-2xl font-extrabold">Execution Assets</h1>
            <p className="mt-2 text-white/70">
              Copy/paste launch materials for:{" "}
              <span className="text-white">{offer.title}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/offers/${offer.id}`}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              ← Back to Offer
            </Link>
            <Link
              href="/dashboard/offers/new"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              New Blueprint
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
          {snapshot?.cityArea ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              City: <span className="text-white/80">{snapshot.cityArea}</span>
            </span>
          ) : null}
          {snapshot?.genre ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Genre: <span className="text-white/80">{snapshot.genre}</span>
            </span>
          ) : null}
          {snapshot?.primaryGoal ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Goal: <span className="text-white/80">{snapshot.primaryGoal}</span>
            </span>
          ) : null}
          {snapshot?.biggestBlocker ? (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Blocker: <span className="text-white/80">{snapshot.biggestBlocker}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Offer Page Copy */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <h2 className="text-lg font-extrabold">Offer Page Copy</h2>
        <p className="mt-1 text-sm text-white/60">
          Headline options, bullets, FAQ, and CTA buttons.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CopyBlock title="Headlines (5)" text={assets.offerPage.headlines.join("\n")} />
          <CopyBlock title="Subheads (3)" text={assets.offerPage.subheads.join("\n")} />
          <CopyBlock
            title="Value bullets"
            text={assets.offerPage.bullets.map((b) => `• ${b}`).join("\n")}
          />
          <CopyBlock
            title="CTA buttons"
            text={assets.offerPage.ctaButtons.map((b) => `• ${b}`).join("\n")}
          />
        </div>

        <div className="mt-4">
          <CopyBlock
            title="FAQ (copy/paste)"
            text={assets.offerPage.faq
              .map((x) => `Q: ${x.q}\nA: ${x.a}`)
              .join("\n\n")}
          />
        </div>
      </section>

      {/* DM Scripts */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <h2 className="text-lg font-extrabold">DM Scripts</h2>
        <p className="mt-1 text-sm text-white/60">Opener → follow-ups → close.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CopyBlock title="DM opener" text={assets.dm.opener} />
          <CopyBlock title="Follow-up #1" text={assets.dm.followUp1} />
          <CopyBlock title="Follow-up #2" text={assets.dm.followUp2} />
          <CopyBlock title="Close (no pressure)" text={assets.dm.close} />
        </div>
      </section>

      {/* Email Sequence */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <h2 className="text-lg font-extrabold">Email Launch Sequence (5)</h2>
        <p className="mt-1 text-sm text-white/60">Copy/paste into Mailchimp / ConvertKit.</p>

        <div className="mt-4 grid gap-4">
          {assets.emailSequence.map((e, idx) => (
            <CopyBlock key={idx} title={`Email ${idx + 1}: ${e.subject}`} text={e.body} />
          ))}
        </div>
      </section>

      {/* Social Plan */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <h2 className="text-lg font-extrabold">14-Day Social Rollout</h2>
        <p className="mt-1 text-sm text-white/60">One post per day. Keep it consistent.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {assets.socialPlan14.map((d) => (
            <CopyBlock key={d.day} title={d.day} text={`${d.post}\n\n${d.cta}`} />
          ))}
        </div>
      </section>

      {/* Live Pitch */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <h2 className="text-lg font-extrabold">Live Pitch Scripts</h2>
        <p className="mt-1 text-sm text-white/60">Use on IG Live / TikTok Live / in-person.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CopyBlock title="30-second pitch" text={assets.livePitch.short30} />
          <CopyBlock title="90-second pitch" text={assets.livePitch.long90} />
        </div>
      </section>
    </div>
  );
}