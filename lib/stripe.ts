// lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

// ✅ Fix: Stripe's TS types often expect the latest pinned apiVersion string.
// Use the version your installed Stripe package expects.
// If you still get a type error, delete apiVersion entirely and rely on Stripe default.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});