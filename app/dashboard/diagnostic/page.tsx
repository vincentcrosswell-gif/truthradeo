import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { runDiagnostic } from "@/lib/diagnostic";
import { getDiagnosticHistory } from "@/lib/diagnostic-reports";
import DiagnosticClient from "./DiagnosticClient";

export default async function DiagnosticPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const snapshot = await db.creatorSnapshot.findUnique({ where: { userId } });
  if (!snapshot) redirect("/dashboard/snapshot");

  // Render immediately from the current snapshot (fast UI), then client saves a DiagnosticReport on mount.
  const initialResult = runDiagnostic(snapshot as any);

  const history = await getDiagnosticHistory(userId, 8);
  const initialHistory = history.map((h) => ({
    ...h,
    createdAt: h.createdAt.toISOString(),
  }));

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6">
        <div className="text-xs text-white/60">Stage 1 • Chicago</div>
        <h1 className="mt-1 text-2xl font-extrabold">Revenue Diagnostic</h1>
        <p className="mt-2 text-white/70">
          Scores + top moves based on your Snapshot. Transparent logic (no magic), now with history tracking.
        </p>
      </div>

      <DiagnosticClient initialResult={initialResult} initialHistory={initialHistory} />
    </div>
  );
}