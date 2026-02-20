import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function SnapshotSummaryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });

  if (!snapshot) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">No snapshot found</h1>
        <Link className="underline" href="/dashboard/snapshot">
          Create your Snapshot
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="text-xs text-white/60">Stage 1 • Chicago</div>
        <h1 className="mt-1 text-2xl font-extrabold">Snapshot Summary</h1>
        <p className="mt-2 text-white/70">
          This is your Creator Revenue Profile. Next we generate the Diagnostic.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="grid gap-2 text-sm text-white/80">
          <div><span className="text-white/50">Artist:</span> {snapshot.artistName}</div>
          <div><span className="text-white/50">Area:</span> {snapshot.cityArea}</div>
          <div><span className="text-white/50">Genre:</span> {snapshot.genre}</div>
          <div><span className="text-white/50">Goal:</span> {snapshot.primaryGoal}</div>

          <div className="mt-4 text-white/60">Revenue</div>
          <div><span className="text-white/50">Streams:</span> {snapshot.currentIncomeStreams}</div>
          <div><span className="text-white/50">Offer:</span> {snapshot.currentOffer}</div>
          <div><span className="text-white/50">Price range:</span> {snapshot.priceRange}</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/diagnostic"
            className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Run Revenue Diagnostic →
          </Link>

          <Link
            href="/dashboard/snapshot"
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 text-sm hover:bg-white/10"
          >
            Edit Snapshot
          </Link>
        </div>
      </div>
    </div>
  );
}
