// app/api/diagnostic/run/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getDiagnosticHistory,
  persistDiagnosticReportForUser,
} from "@/lib/diagnostic-reports";

function noStoreJson(data: unknown, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return noStoreJson({ error: "Unauthorized" }, 401);

  const persisted = await persistDiagnosticReportForUser(userId);

  if (!persisted.ok) {
    return noStoreJson(
      { error: "No snapshot found. Complete Snapshot first." },
      400
    );
  }

  const history = await getDiagnosticHistory(userId, 8);

  return noStoreJson({
    saved: {
      reportId: persisted.reportId,
      createdAt: persisted.createdAt.toISOString(),
      deduped: persisted.deduped,
    },
    result: persisted.result,
    history: history.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
    })),
  });
}