// lib/billing/price.ts
import type { Plan, Cadence } from "./plans";

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function priceIdFor(plan: Plan, cadence: Cadence) {
  if (plan === "FREE") throw new Error("FREE has no Stripe price");

  const key =
    plan === "SOUTH_LOOP"
      ? cadence === "monthly"
        ? "STRIPE_PRICE_SOUTH_LOOP_MONTHLY"
        : "STRIPE_PRICE_SOUTH_LOOP_LIFETIME"
      : plan === "RIVER_NORTH"
        ? cadence === "monthly"
          ? "STRIPE_PRICE_RIVER_NORTH_MONTHLY"
          : "STRIPE_PRICE_RIVER_NORTH_LIFETIME"
        : cadence === "monthly"
          ? "STRIPE_PRICE_THE_LOOP_MONTHLY"
          : "STRIPE_PRICE_THE_LOOP_LIFETIME";

  return must(key);
}