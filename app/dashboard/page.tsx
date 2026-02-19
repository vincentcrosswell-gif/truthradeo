import { currentUser } from "@clerk/nextjs/server";
import SnapshotWizard from "./snapshot/SnapshotWizard";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Chicago Creator Snapshot
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Build your revenue foundation. No fluff — we’re capturing the signal.
            </p>
          </div>

          <div className="text-xs text-white/60">
            Signed in as{" "}
            <span className="font-semibold text-white/80">
              {user?.emailAddresses?.[0]?.emailAddress ?? "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <SnapshotWizard />
    </div>
  );
}
