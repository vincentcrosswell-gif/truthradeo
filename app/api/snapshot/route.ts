import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { trackAppEvent } from "@/lib/events";

const SNAPSHOT_FIELD_RULES = {
  artistName: { max: 100 },
  cityArea: { max: 100 },
  genre: { max: 80 },
  vibeTags: { max: 200 },
  primaryGoal: { max: 120 },

  spotify: { max: 300 },
  youtube: { max: 300 },
  instagram: { max: 300 },
  tiktok: { max: 300 },
  website: { max: 300 },

  audienceSize: { max: 50 },
  emailList: { max: 50 },
  monthlyListeners: { max: 50 },

  currentIncomeStreams: { max: 500 },
  currentOffer: { max: 500 },
  priceRange: { max: 100 },

  upcomingRelease: { max: 200 },
  performanceFrequency: { max: 100 },
  collabTargets: { max: 500 },

  biggestBlocker: { max: 500 },
} as const;

type SnapshotField = keyof typeof SNAPSHOT_FIELD_RULES;
type SnapshotWriteData = Partial<Record<SnapshotField, string>>;

const PROTECTED_FIELDS = new Set(["id", "userId", "createdAt", "updatedAt"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeSnapshotPayload(input: Record<string, unknown>) {
  const data: SnapshotWriteData = {};
  const errors: string[] = [];

  const attemptedProtectedFields = Object.keys(input).filter((key) =>
    PROTECTED_FIELDS.has(key)
  );

  if (attemptedProtectedFields.length > 0) {
    errors.push(
      `Protected fields are not allowed: ${attemptedProtectedFields.join(", ")}`
    );
    return { data, errors };
  }

  for (const field of Object.keys(SNAPSHOT_FIELD_RULES) as SnapshotField[]) {
    if (!(field in input)) continue;

    const rawValue = input[field];

    // Allow null to clear a field
    if (rawValue === null) {
      data[field] = "";
      continue;
    }

    if (typeof rawValue !== "string") {
      errors.push(`${field} must be a string`);
      continue;
    }

    const cleaned = rawValue.replace(/\r\n/g, "\n").trim();
    const { max } = SNAPSHOT_FIELD_RULES[field];

    if (cleaned.length > max) {
      errors.push(`${field} must be ${max} characters or fewer`);
      continue;
    }

    data[field] = cleaned;
  }

  return { data, errors };
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isPlainObject(rawBody)) {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const { data, errors } = sanitizeSnapshotPayload(rawBody);

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: "Invalid snapshot payload",
        details: errors,
      },
      { status: 400 }
    );
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid snapshot fields provided" },
      { status: 400 }
    );
  }

  const updateData: Prisma.CreatorSnapshotUpdateInput = { ...data };
  const createData: Prisma.CreatorSnapshotCreateInput = { userId, ...data };

  try {
    const snapshot = await db.creatorSnapshot.upsert({
      where: { userId },
      update: updateData,
      create: createData,
    });

    // Funnel completion: Snapshot saved
    await trackAppEvent({
      userId,
      name: "snapshot_saved",
      route: "/dashboard/snapshot",
      step: "snapshot",
      snapshotId: snapshot.id,
      meta: {
        fields: Object.keys(data),
      },
    });

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("Snapshot upsert failed:", error);
    return NextResponse.json(
      { error: "Failed to save snapshot" },
      { status: 500 }
    );
  }
}