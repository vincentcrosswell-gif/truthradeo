// lib/billing/entitlement.ts
import { cache } from "react";
import { db } from "@/lib/db";
import type { Plan } from "@/lib/billing/plans";

export const getUserPlan = cache(async (userId: string): Promise<Plan> => {
  const sub = await db.subscription.findUnique({ where: { userId } });
  return (sub?.plan as Plan) ?? "FREE";
});

export const getUserSubscription = cache(async (userId: string) => {
  return db.subscription.findUnique({ where: { userId } });
});