import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const snapshot = await db.creatorSnapshot.upsert({
    where: { userId },
    update: { ...body },
    create: { userId, ...body },
  });

  return NextResponse.json({ snapshot });
}
