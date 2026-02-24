import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import SnapshotWizard from "./SnapshotWizard";

function formatDate(value?: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function SnapshotPage() {
  const [{ userId }, user] = await Promise.all([auth(), currentUser()]);
  if (!userId) redirect("/sign-in");

  const snapshot = await db.creatorSnapshot.findUnique({
    where: { userId },
    select: {
      artistName: true,
      cityArea: true,
      updatedAt: true,
    },
  });

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/60">
              Stage 1 • Chicago
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
              Creator Snapshot Wizard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Capture your current artist situation so TruthRadeo can build your
              diagnostic and roadmap from real signal.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
            <div>Signed in as</div>
            <div className="mt-1 font-semibold text-white/90">
              {user?.emailAddresses?.[0]?.emailAddress ?? "Unknown"}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            ← Back to Dashboard
          </Link>

          {snapshot ? (
            <Link
              href="/dashboard/snapshot/summary"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              View Snapshot Summary →
            </Link>
          ) : null}
        </div>
      </section>

      {snapshot ? (
        <section className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="grid gap-2 text-sm text-white/80 md:grid-cols-3">
            <div>
              <span className="text-white/50">Artist:</span>{" "}
              {snapshot.artistName?.trim() || "—"}
            </div>
            <div>
              <span className="text-white/50">City:</span>{" "}
              {snapshot.cityArea?.trim() || "Chicago"}
            </div>
            <div>
              <span className="text-white/50">Last saved:</span>{" "}
              {formatDate(snapshot.updatedAt)}
            </div>
          </div>
        </section>
      ) : null}

      <SnapshotWizard />
    </div>
  );
}