// lib/diagnostic.ts
export type Snapshot = {
  artistName: string;
  cityArea: string;
  genre: string;
  vibeTags: string;
  primaryGoal: string;

  spotify: string;
  youtube: string;
  instagram: string;
  tiktok: string;
  website: string;

  audienceSize: string;
  emailList: string;
  monthlyListeners: string;

  currentIncomeStreams: string;
  currentOffer: string;
  priceRange: string;

  upcomingRelease: string;
  performanceFrequency: string;
  collabTargets: string;

  biggestBlocker: string;
};

function parseNumberLoose(input: string): number {
  // pulls first number from strings like "12k", "25,000", "1.2k", "350"
  if (!input) return 0;
  const s = input.toLowerCase().replace(/,/g, "").trim();
  const match = s.match(/(\d+(\.\d+)?)/);
  if (!match) return 0;
  let n = parseFloat(match[1]);
  if (s.includes("k")) n *= 1000;
  if (s.includes("m")) n *= 1_000_000;
  return Math.round(n);
}

function hasAny(...vals: string[]) {
  return vals.some((v) => (v ?? "").trim().length > 0);
}

export type DiagnosticResult = {
  scores: {
    monetization: number;
    audience: number;
    offer: number;
    momentum: number;
    clarity: number;
  };
  topMoves: { title: string; why: string; nextSteps: string[]; impact: "High" | "Medium" | "Low" }[];
  notes: { label: string; value: string }[];
};

export function runDiagnostic(s: Snapshot): DiagnosticResult {
  const followers = parseNumberLoose(s.audienceSize);
  const email = parseNumberLoose(s.emailList);
  const listeners = parseNumberLoose(s.monthlyListeners);

  // --- Score components (0-100) ---
  let audience = 0;
  if (followers >= 50000) audience += 45;
  else if (followers >= 10000) audience += 35;
  else if (followers >= 3000) audience += 25;
  else if (followers >= 1000) audience += 18;
  else if (followers >= 300) audience += 12;
  else if (followers > 0) audience += 6;

  if (listeners >= 100000) audience += 35;
  else if (listeners >= 25000) audience += 28;
  else if (listeners >= 8000) audience += 20;
  else if (listeners >= 2000) audience += 12;
  else if (listeners > 0) audience += 6;

  if (email >= 2000) audience += 20;
  else if (email >= 500) audience += 14;
  else if (email >= 100) audience += 8;
  else if (email > 0) audience += 4;

  audience = Math.min(100, audience);

  let monetization = 0;
  if (s.currentIncomeStreams.trim().length > 8) monetization += 35;
  if (s.currentOffer.trim().length > 8) monetization += 35;
  if (s.priceRange.trim().length > 0) monetization += 10;
  if (hasAny(s.website)) monetization += 10;
  if (hasAny(s.emailList)) monetization += 10;
  monetization = Math.min(100, monetization);

  let offer = 0;
  if (s.currentOffer.trim().length > 8) offer += 45;
  if (s.priceRange.trim().length > 0) offer += 15;
  if (s.primaryGoal.trim().length > 8) offer += 15;
  if (hasAny(s.website)) offer += 10;
  if (s.vibeTags.trim().length > 3) offer += 15;
  offer = Math.min(100, offer);

  let momentum = 0;
  if (s.upcomingRelease.trim().length > 4) momentum += 35;
  if (s.performanceFrequency.trim().length > 2) momentum += 20;
  if (s.collabTargets.trim().length > 4) momentum += 25;
  if (hasAny(s.tiktok, s.instagram, s.youtube)) momentum += 20;
  momentum = Math.min(100, momentum);

  let clarity = 0;
  if (s.artistName.trim().length > 1) clarity += 20;
  if (s.genre.trim().length > 2) clarity += 20;
  if (s.vibeTags.trim().length > 3) clarity += 20;
  if (s.primaryGoal.trim().length > 8) clarity += 20;
  if (s.biggestBlocker.trim().length > 5) clarity += 20;
  clarity = Math.min(100, clarity);

  // --- Top moves logic (explainable) ---
  const topMoves: DiagnosticResult["topMoves"] = [];

  if (email < 100) {
    topMoves.push({
      title: "Build a simple email capture funnel (7 days)",
      why: "Email converts better than social because you control the channel. Your list is small or missing.",
      impact: "High",
      nextSteps: [
        "Add a single Link-in-bio landing page with 1 offer: 'New drop + shows in Chicago'",
        "Offer a freebie: early access / demo / behind-the-scenes pack",
        "Post 3 times this week pointing to the sign-up link",
      ],
    });
  }

  if (!s.currentOffer || s.currentOffer.trim().length < 8) {
    topMoves.push({
      title: "Define 1 paid offer (today) + pricing ladder (1 hour)",
      why: "You can’t increase revenue without a clear offer. Even small offers create momentum.",
      impact: "High",
      nextSteps: [
        "Pick one: features / beats / studio session / merch drop / membership",
        "Set 3 price points (entry / core / premium)",
        "Write the 1-paragraph pitch + 3 bullets of what they get",
      ],
    });
  }

  if (!s.website || s.website.trim().length < 5) {
    topMoves.push({
      title: "Create a single 'Offer Page' (no full website needed)",
      why: "A shareable page increases conversion from DMs, shows, and collaborations.",
      impact: "Medium",
      nextSteps: [
        "Use a simple page: headline, proof, offer, price, CTA",
        "Add 2 links: pay link + contact",
        "Pin it everywhere (IG bio, TikTok bio, YouTube about)",
      ],
    });
  }

  if (!s.upcomingRelease || s.upcomingRelease.trim().length < 4) {
    topMoves.push({
      title: "Schedule the next release milestone (pick a date)",
      why: "Momentum drives content. A date creates urgency + repeatable marketing.",
      impact: "Medium",
      nextSteps: [
        "Pick a date 2–6 weeks out",
        "Plan a 7-post rollout (teaser, snippet, story, live, drop, recap)",
        "Attach one conversion CTA to each post (email or offer page)",
      ],
    });
  }

  if (topMoves.length < 3) {
    topMoves.push({
      title: "Book 2 collaboration touches this week",
      why: "Collabs compress growth by borrowing trust and audience.",
      impact: "Medium",
      nextSteps: [
        "DM 5 artists/venues with a specific idea (not 'let’s work')",
        "Offer a simple trade: opener slot / remix / content swap",
        "Track responses in a notes doc",
      ],
    });
  }

  // Keep only top 3
  const top3 = topMoves.slice(0, 3);

  const notes = [
    { label: "Followers (rough)", value: followers ? String(followers) : "Not provided" },
    { label: "Email list", value: email ? String(email) : "Not provided" },
    { label: "Monthly listeners/views", value: listeners ? String(listeners) : "Not provided" },
    { label: "Biggest blocker", value: s.biggestBlocker || "Not provided" },
  ];

  return {
    scores: { monetization, audience, offer, momentum, clarity },
    topMoves: top3,
    notes,
  };
}
