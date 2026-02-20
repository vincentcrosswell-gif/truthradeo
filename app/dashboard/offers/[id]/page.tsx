// app/dashboard/offers/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import CopyBlock from "./CopyBlock";

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const offer = await db.offerBlueprint.findUnique({ where: { id } });
  if (!offer) return notFound();
  if (offer.userId !== userId) return notFound();

  const pricing = Array.isArray(offer.pricing) ? (offer.pricing as any[]) : [];
  const deliverables = Array.isArray(offer.deliverables)
    ? (offer.deliverables as any[])
    : [];
  const funnel = Array.isArray(offer.funnel) ? (offer.funnel as any[]) : [];
  const scripts = (offer.scripts as any) || {};

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-white/60">Stage 1 • Chicago</div>
            <h1 className="mt-1 text-2xl font-extrabold">{offer.title}</h1>
            <p className="mt-2 text-white/70">{offer.promise}</p>
          </div>

          <div className="flex flex-wrap gap-2">
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
              ← Diagnostic
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

      {/* Pricing ladder */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <h2 className="text-lg font-extrabold">Pricing ladder</h2>
        <p className="mt-1 text-sm text-white/60">
          Entry → Core → Premium. Keep it simple and easy to say in a DM.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {pricing.length ? (
            pricing.map((p, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-black/30 p-4"
              >
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
          <p className="mt-1 text-sm text-white/60">
            Traffic → Convert → Deliver → Upsell
          </p>
          <div className="mt-4 grid gap-3">
            {funnel.length ? (
              funnel.map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4"
                >
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
        <p className="mt-1 text-sm text-white/60">
          Use these immediately in DMs and captions.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <CopyBlock title="DM opener" text={scripts.dm ?? ""} />
          <CopyBlock title="Caption" text={scripts.caption ?? ""} />
          <CopyBlock title="Follow-up" text={scripts.followUp ?? ""} />
        </div>
      </section>

      {/* Next */}
      <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="text-sm text-white/70">
          Next page after this: <span className="text-white">Execution Assets</span>{" "}
          (email sequence + landing page copy).
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/assets?offerId=${offer.id}`}
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Generate Execution Assets →
          </Link>
        </div>
      </section>
    </div>
  );
}
