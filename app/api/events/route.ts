import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { trackAppEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

function noStoreJson(data: unknown, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Cache-Control", "no-store, max-age=0");
  return res;
}

function s(v: unknown, max = 160) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

const ALLOWED_NAMES = new Set(["page_view", "cta_click", "ui_action"]);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return noStoreJson({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));

  const name = s((body as any)?.name, 80);
  if (!ALLOWED_NAMES.has(name)) {
    return noStoreJson({ error: "Invalid event name" }, 400);
  }

  await trackAppEvent({
    userId,
    name,
    route: s((body as any)?.route, 160),
    step: s((body as any)?.step, 80),
    offerId: s((body as any)?.offerId, 191) || null,
    snapshotId: s((body as any)?.snapshotId, 191) || null,
    meta: (body as any)?.meta,
  });

  return noStoreJson({ ok: true });
}