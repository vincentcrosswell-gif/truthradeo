// lib/iteration/chicago.ts
// Stage 1 (Chicago): rule-based iteration + optimization engine.
// Intentionally explainable (no black-box AI) so creators trust the guidance.

import type { CreatorSnapshot, OfferBlueprint } from "@prisma/client";

export type IterationPlan = {
  headline: string;
  scorecard: {
    outreach: number;
    leadRate: number; // leads/outreach
    closeRate: number; // sales/leads
    revenueCents: number;
  };
  diagnosis: string[];
  next7Days: {
    focus: string;
    actions: string[];
    targets: string[];
  };
  next14Days: {
    focus: string;
    experiments: string[];
  };
  scriptTweaks: {
    dmAngle: string;
    offerAngle: string;
    pricingAngle: string;
  };
  guardrails: string[];
};

export type IterationInput = {
  run: {
    channel: string;
    outreachCount: number;
    leadsCount: number;
    callsBooked: number;
    salesCount: number;
    revenueCents: number;
    whatWorked?: string;
    whatDidnt?: string;
    blockers?: string;
    notes?: string;
  };
  offer: Pick<
    OfferBlueprint,
    "lane" | "title" | "promise" | "pricing" | "funnel" | "scripts"
  >;
  snapshot?: Pick<
    CreatorSnapshot,
    | "artistName"
    | "genre"
    | "vibeTags"
    | "primaryGoal"
    | "biggestBlocker"
    | "audienceSize"
    | "priceRange"
  >;
};

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function normalizeChannel(channel: string) {
  const c = (channel || "").trim().toLowerCase();
  if (!c) return "other";
  const known = new Set([
    "instagram",
    "tiktok",
    "youtube",
    "email",
    "dm",
    "live",
    "ads",
    "website",
    "other",
  ]);
  return known.has(c) ? c : "other";
}

export function buildChicagoIterationPlan(input: IterationInput): IterationPlan {
  const outreach = Math.max(0, Math.floor(input.run.outreachCount || 0));
  const leads = Math.max(0, Math.floor(input.run.leadsCount || 0));
  const sales = Math.max(0, Math.floor(input.run.salesCount || 0));
  const revenueCents = Math.max(0, Math.floor(input.run.revenueCents || 0));
  const channel = normalizeChannel(input.run.channel);

  const leadRate = outreach > 0 ? clamp01(leads / outreach) : 0;
  const closeRate = leads > 0 ? clamp01(sales / leads) : 0;

  const diagnosis: string[] = [];

  // Simple heuristics (tuned for early-stage creators)
  const outreachLow = outreach < 25;
  const leadRateLow = outreach >= 25 && leadRate < 0.05;
  const leadRateOk = outreach >= 25 && leadRate >= 0.05;
  const closeRateLow = leads >= 5 && closeRate < 0.2;

  if (outreachLow) {
    diagnosis.push(
      `Volume is the bottleneck: you only did ${outreach} outreach touches. Increase volume before you rewrite the whole offer.`
    );
  }

  if (leadRateLow) {
    diagnosis.push(
      `Messaging/targeting mismatch: your lead rate was ${pct(
        leadRate
      )}. Tighten the audience + improve the opener/hook.`
    );
  }

  if (leadRateOk && leads === 0) {
    diagnosis.push(
      `You had volume but zero leads. Your hook isn't specific enough (or the channel isn't where your buyer is).`
    );
  }

  if (closeRateLow) {
    diagnosis.push(
      `Conversion is the bottleneck: you got leads but closed at ${pct(
        closeRate
      )}. Your offer needs clearer deliverables + risk reversal + next step.`
    );
  }

  if (revenueCents === 0 && outreach >= 50 && leads >= 5) {
    diagnosis.push(
      `You're getting interest but not money yet — likely friction on price, unclear outcome, or no deadline.`
    );
  }

  if (!diagnosis.length) {
    diagnosis.push(
      `Keep iterating: your data is too small to overfit. Run one focused experiment next week.`
    );
  }

  // Next 7 days plan
  const actions: string[] = [];
  const targets: string[] = [];

  if (outreachLow) {
    actions.push(
      `Do 50 outreach touches on ${
        channel === "other" ? "your best channel" : channel
      } (DMs/emails/convos).`
    );
    actions.push(
      `Use one repeatable opener (no rewriting daily). Track replies.`
    );
    targets.push(`Outreach: 50 touches in 7 days`);
    targets.push(`Leads: 3+ replies that show intent`);
  } else if (leadRateLow) {
    actions.push(
      `Rewrite ONLY the opener + first sentence of the pitch. Keep the rest the same so your test is clean.`
    );
    actions.push(
      `Narrow the target list: pick 1 buyer type (e.g., "local rappers who want studio sessions" vs "all artists").`
    );
    actions.push(`Run A/B: 25 messages with Hook A, 25 messages with Hook B.`);
    targets.push(`Lead rate: 8–12%`);
    targets.push(`Leads: 5+ (from 50 touches)`);
  } else if (closeRateLow) {
    actions.push(
      `Add a clear next step: "Reply 'YES' and I'll send the 2-minute checklist + booking link."`
    );
    actions.push(
      `Add risk reversal: 1 small guarantee or "first session credit".`
    );
    actions.push(`Make deliverables concrete (time, quantity, exact outcome).`);
    targets.push(`Close rate: 20–35%`);
    targets.push(`Sales: 1–3 closes from 5–10 leads`);
  } else {
    actions.push(
      `Keep the same offer. Increase volume + tighten follow-up cadence (Day 2 + Day 5 follow-up).`
    );
    actions.push(
      `Add one upsell or premium tier mention only after interest is shown.`
    );
    targets.push(`Outreach: +25% vs last run`);
    targets.push(`Revenue: +1 paid conversion`);
  }

  const offerAngle = (() => {
    const lane = (input.offer.lane || "").toLowerCase();
    if (lane === "service")
      return "Outcome-first service with clear delivery window.";
    if (lane === "digital")
      return "Fast-win digital product with specific promise and proof.";
    if (lane === "membership")
      return "Recurring community/access with weekly cadence + accountability.";
    if (lane === "live") return "Event/live set with a tight hook + easy booking path.";
    return "Hybrid offer: one clear promise + one clear next step.";
  })();

  const dmAngle = (() => {
    if (leadRateLow) return "Lead with a specific compliment + one outcome question.";
    if (closeRateLow) return "Lead with the outcome + a frictionless next step.";
    return "Lead with the outcome + short proof + 1 question.";
  })();

  const pricingAngle = (() => {
    if (revenueCents === 0 && leads >= 5)
      return "Reduce friction: add an entry tier or payment split, then upsell.";
    if (sales >= 2) return "Test a 10–20% increase on the core tier.";
    return "Keep pricing stable; change messaging before you change price.";
  })();

  const experiments: string[] = [];
  if (leadRateLow) {
    experiments.push("Test 2 hooks (A/B) with the same audience list.");
    experiments.push("Try one adjacent channel (e.g., IG → TikTok comments or email). ");
  } else if (closeRateLow) {
    experiments.push("Add a deadline: 10 slots this month / price rises after Friday.");
    experiments.push(
      "Add one proof asset: 20-second before/after clip or testimonial screenshot."
    );
  } else {
    experiments.push("Increase volume 25% while keeping copy the same.");
    experiments.push("Introduce an upsell: premium tier or add-on.");
  }

  const guardrails: string[] = [
    "Do not change 5 things at once. One variable per week.",
    "If you have <25 outreach touches, prioritize volume before rewriting everything.",
    "Track one metric daily: outreach → leads → sales.",
  ];

  const headline = (() => {
    if (outreachLow) return "Next move: increase volume (clean test)";
    if (leadRateLow) return "Next move: tighten targeting + opener";
    if (closeRateLow) return "Next move: reduce friction + clarify deliverables";
    return "Next move: scale what worked + add one experiment";
  })();

  return {
    headline,
    scorecard: {
      outreach,
      leadRate,
      closeRate,
      revenueCents,
    },
    diagnosis,
    next7Days: {
      focus: headline,
      actions,
      targets,
    },
    next14Days: {
      focus: "Second wave: stabilize then scale",
      experiments,
    },
    scriptTweaks: {
      dmAngle,
      offerAngle,
      pricingAngle,
    },
    guardrails,
  };
}