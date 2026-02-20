import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST() {
  const { userId } = await auth(); // ✅ await is required in your setup

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await db.creatorSnapshot.deleteMany({
    where: { userId },
  });

  return NextResponse.json({ ok: true, deletedCount: deleted.count });
}