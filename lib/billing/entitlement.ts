// lib/billing/entitlement.ts
// NOTE: Do NOT memoize subscription lookups globally.
// Plan / entitlement can change instantly after a Stripe webhook — we want fresh reads.

import { db } from "@/lib/db";
import type { Plan } from "@/lib/billing/plans";

export async function getUserPlan(userId: string): Promise<Plan> {
  const sub = await db.subscription.findUnique({ where: { userId } });
  return (sub?.plan as Plan) ?? "FREE";
}

export async function getUserSubscription(userId: string) {
  return db.subscription.findUnique({ where: { userId } });
}