// lib/billing/plans.ts
export type Plan = "FREE" | "SOUTH_LOOP" | "RIVER_NORTH" | "THE_LOOP";
export type Cadence = "monthly" | "lifetime";

const rank: Record<Plan, number> = {
  FREE: 0,
  SOUTH_LOOP: 1,
  RIVER_NORTH: 2,
  THE_LOOP: 3,
};

export function hasAccess(userPlan: Plan, required: Plan) {
  return rank[userPlan] >= rank[required];
}

export function normalizePlan(p: string | null | undefined): Plan {
  if (p === "SOUTH_LOOP" || p === "RIVER_NORTH" || p === "THE_LOOP") return p;
  return "FREE";
}