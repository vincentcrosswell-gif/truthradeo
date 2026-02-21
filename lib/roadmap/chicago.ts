// lib/roadmap/chicago.ts

export type SnapshotLike = {
  artistName?: string | null;
  cityArea?: string | null;
  genre?: string | null;
  vibeTags?: string | null;
  primaryGoal?: string | null;

  audienceSize?: string | null;
  emailList?: string | null;
  monthlyListeners?: string | null;

  currentIncomeStreams?: string | null;
  currentOffer?: string | null;
  priceRange?: string | null;

  upcomingRelease?: string | null;
  performanceFrequency?: string | null;
  collabTargets?: string | null;

  biggestBlocker?: string | null;
};

export type RoadmapWeek = {
  title: string;
  focusMetric: string;
  top3: string[];
  tasks: string[];
  chicagoMove: string;
};

export type ChicagoRoadmap = {
  headline: string;
  subhead: string;
  weeks: RoadmapWeek[];
  quickWins: string[];
};

function norm(s?: string | null) {
  return (s || "").trim();
}

function includesCI(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function audienceTier(audienceSize: string, monthlyListeners: string) {
  const a = audienceSize || "";
  const m = monthlyListeners || "";

  // Buckets you now store: "0–99", "100–499", "500–999", "1k–4.9k", ...
  const low = ["0–99", "100–499"];
  const mid = ["500–999", "1k–4.9k", "5k–9.9k"];
  const high = ["10k–24.9k", "25k–49.9k", "50k–99.9k", "100k+"];

  if (high.includes(a) || high.includes(m)) return "high";
  if (mid.includes(a) || mid.includes(m)) return "mid";
  if (low.includes(a) || low.includes(m)) return "low";
  return "unknown";
}

function goalLane(goal: string) {
  if (includesCI(goal, "shows") || includesCI(goal, "gigs")) return "shows";
  if (includesCI(goal, "merch")) return "merch";
  if (includesCI(goal, "beats") || includesCI(goal, "production")) return "beats";
  if (includesCI(goal, "features") || includesCI(goal, "verses")) return "features";
  if (includesCI(goal, "streams") || includesCI(goal, "listeners")) return "streams";
  if (includesCI(goal, "email") || includesCI(goal, "fanbase")) return "email";
  if (includesCI(goal, "membership") || includesCI(goal, "paid offer")) return "offer";
  if (includesCI(goal, "brand")) return "brand";
  return "general";
}

function blockerLane(blocker: string) {
  if (includesCI(blocker, "audience capture") || includesCI(blocker, "email")) return "capture";
  if (includesCI(blocker, "offer")) return "offer";
  if (includesCI(blocker, "booking")) return "booking";
  if (includesCI(blocker, "content")) return "content";
  if (includesCI(blocker, "engagement")) return "engagement";
  if (includesCI(blocker, "time") || includesCI(blocker, "burnout")) return "time";
  if (includesCI(blocker, "budget")) return "budget";
  if (includesCI(blocker, "team") || includesCI(blocker, "collab")) return "team";
  if (includesCI(blocker, "releases") || includesCI(blocker, "inconsistent")) return "releases";
  return "general";
}

function pickOfferObjective(goal: string) {
  const lane = goalLane(goal);
  switch (lane) {
    case "shows":
      return "A bookable show package + outreach script";
    case "beats":
      return "A beat licensing or custom beat package";
    case "features":
      return "A feature offer with a clear turnaround + proofs";
    case "merch":
      return "A limited merch drop with preorder deadline";
    case "email":
      return "A freebie magnet + email capture + nurture";
    case "streams":
      return "A release campaign + collab stack to spike listeners";
    case "brand":
      return "A brand-ready one-sheet + pitch angles";
    case "offer":
      return "A paid offer with a ladder (starter → premium)";
    default:
      return "A simple paid offer you can sell this month";
  }
}

function chicagoMove(goal: string) {
  const lane = goalLane(goal);
  switch (lane) {
    case "shows":
      return "Pick 10 Chicago venues/promoters and send 10 tailored booking DMs/emails (today).";
    case "streams":
      return "DM 10 Chicago creators for a micro-collab (duet/reel/remix) and schedule 2 collabs this week.";
    case "beats":
      return "Post a Chicago-targeted beat preview + “DM ‘PACK’ for link” and collect 10 leads.";
    case "merch":
      return "Find 1 Chicago pop-up/market/event and apply or lock a table date.";
    default:
      return "Join 1 Chicago creator community (IG/Discord/venue page) and comment value on 10 posts.";
  }
}

export function generateChicagoRoadmap(snapshot: SnapshotLike): ChicagoRoadmap {
  const goal = norm(snapshot.primaryGoal) || "General growth";
  const blocker = norm(snapshot.biggestBlocker) || "General friction";
  const tier = audienceTier(norm(snapshot.audienceSize), norm(snapshot.monthlyListeners));
  const offerObj = pickOfferObjective(goal);

  const lane = goalLane(goal);
  const block = blockerLane(blocker);

  const headline = `Your 30-Day Chicago Roadmap`;
  const subhead = `Built from your Snapshot: goal = “${goal}”, blocker = “${blocker}”. Focus: ${offerObj}.`;

  const quickWins: string[] = [
    "Set a 1-sentence promise: “I help ___ get ___ without ___.”",
    "Make one link hub (or simple page) that points to ONE CTA.",
    "Pick one weekly metric and track it (not everything).",
  ];

  // Core tasks that always apply
  const foundation = [
    "Define your offer in one sentence (who + outcome + timeframe).",
    "Choose ONE primary channel to push for 30 days (IG / TikTok / YouTube).",
    "Write a 10-line pitch script (DM + live pitch).",
  ];

  // Blocker-specific inserts
  const blockerTasks: Record<string, string[]> = {
    capture: [
      "Create a simple freebie (playlist, sample pack, BTS drop, unreleased track).",
      "Set up email capture (Mailchimp/ConvertKit) + a 3-email welcome sequence.",
      "Add the capture link to bio + pin 1 post that drives to it.",
    ],
    offer: [
      "Pick ONE offer type (service, product, membership) and a starter price.",
      "Write a value stack (3 bullets: what they get, how fast, what changes).",
      "Collect 3 proof items (clips, testimonials, before/after, screenshots).",
    ],
    booking: [
      "Build a 1-page booking packet (bio, links, 2 clips, rate, availability).",
      "Make a list of 25 venues/promoters; rank by fit.",
      "Send 10 booking pitches (personalized subject line + clip).",
    ],
    content: [
      "Create a 7-day content plan (1 hook template reused daily).",
      "Batch record 10 short clips in one session.",
      "Post 1 CTA clip that points to your offer/capture.",
    ],
    engagement: [
      "Run a 15-minute daily engagement sprint (comments + DMs).",
      "Ask 10 fans one question: “What do you want next from me?”",
      "Turn the best answer into a post + CTA.",
    ],
    releases: [
      "Choose a release date + 2-week pre-plan.",
      "Lock cover art + teaser clips.",
      "Create a collab list and schedule 2 cross-posts.",
    ],
    time: [
      "Reduce scope: one offer, one channel, one metric.",
      "Block 3×45 min sessions per week (no more).",
      "Automate or template what you repeat (captions, DMs, emails).",
    ],
    budget: [
      "Pick only free moves: collabs, outreach, content batching.",
      "If you spend, cap it: $20 test max and only after Week 2.",
      "Trade value instead of paying (feature swap, venue opener swap).",
    ],
    team: [
      "Define the one role you need (editor, designer, manager, producer).",
      "Make a collaboration pitch (what you give + what you want).",
      "Contact 10 candidates and set 2 calls.",
    ],
    general: [
      "Pick a single obstacle and solve it with a template + repetition.",
      "Ship one small offer and sell it to 5 people.",
    ],
  };

  const goalTasks: Record<string, string[]> = {
    shows: [
      "Build a show-ready set list (15–30 minutes) + 2 performance clips.",
      "Create a ‘book me’ message + a rate range (even if flexible).",
      "Target 2 open-mic / showcase opportunities this week.",
    ],
    merch: [
      "Pick ONE merch item (shirt/hat/poster) and a preorder deadline.",
      "Make 3 mockups + post a poll to validate demand.",
      "Set a small goal: 10 preorders before production.",
    ],
    beats: [
      "Create 3 beat packs (10–20 beats each) by vibe.",
      "Write licensing terms (basic/non-exclusive) + delivery process.",
      "DM 20 artists: “Want a custom pack for your sound? I’ll send 3 options.”",
    ],
    features: [
      "Define turnaround time + 3 example clips.",
      "Write a feature intake form (Google Form) + payment method.",
      "DM 15 artists with a tailored hook + clip.",
    ],
    streams: [
      "Plan a 14-day release push (teaser → drop → follow-up).",
      "Schedule 2 collabs (duet/remix/feature) tied to release.",
      "Create 5 short clips from one track (different hooks).",
    ],
    email: [
      "Create a freebie magnet and drive 30 people to it.",
      "Write a 3-email welcome sequence (who you are, best work, next step).",
      "Post 2 CTAs per week that drive to capture.",
    ],
    offer: [
      "Create a pricing ladder (starter / core / premium).",
      "Write the offer page copy (headline, bullets, proof, CTA).",
      "Sell the starter offer to 5 people (DM-based) this month.",
    ],
    brand: [
      "Make a 1-page brand one-sheet (audience, vibe, metrics, packages).",
      "List 20 local brands that fit your genre + audience.",
      "Send 10 pitches with 1 clear package + one clip.",
    ],
    general: [
      "Pick one monetization lane and execute one small offer this month.",
    ],
  };

  const week1 = [
    ...foundation,
    ...(blockerTasks[block] || blockerTasks.general),
    ...(goalTasks[lane] || goalTasks.general),
    "Generate/confirm your offer inside Offer Architect (pricing ladder + deliverables).",
  ];

  const week2 = [
    "Outreach week: send 25 DMs/emails using one script (personalize the first line).",
    "Collect 3 proof signals (testimonials, screenshots, clips, comments).",
    "Post 3 pieces of content that each point to ONE CTA.",
    ...(tier === "low"
      ? ["Run 2 collabs (duet/remix/feature swap) to borrow audience."]
      : ["Run a soft-launch to your existing audience (DM/Email)."]),
  ];

  const week3 = [
    "Launch week: set a 7-day window with a clear start + end.",
    "Send a 3-message sequence (announce → proof → last call).",
    "Do one live/pitch moment (IG Live, TikTok Live, or in-person pitch).",
    ...(block === "capture"
      ? ["Drive to capture first, then sell on Day 5–7."]
      : ["Drive straight to the offer with clear scarcity (slots/deadline)."]),
  ];

  const week4 = [
    "Review results: what converted, what didn’t, what was easy.",
    "Double down on the best channel + best hook.",
    "Improve the offer page copy (headline + bullets + proof).",
    "Plan the next 30-day cycle using the same template.",
  ];

  const weeks: RoadmapWeek[] = [
    {
      title: "Week 1 — Build the engine",
      focusMetric:
        block === "capture" ? "Email captures (target: 30)" : "Offer clarity + 5 warm leads",
      top3: [
        "Confirm one offer + price ladder",
        "Create one CTA link hub (offer/capture)",
        "Produce 3 proof assets (clips/screenshots)",
      ],
      tasks: uniqueTrim(week1).slice(0, 12),
      chicagoMove: chicagoMove(goal),
    },
    {
      title: "Week 2 — Outreach + proof",
      focusMetric: "25 outreach messages + 3 proof signals",
      top3: ["Send 25 DMs/emails", "Post 3 CTA clips", "Collect 3 proofs"],
      tasks: uniqueTrim(week2).slice(0, 10),
      chicagoMove:
        "Pick 10 Chicago creators in your lane and propose 1 micro-collab format (simple + fast).",
    },
    {
      title: "Week 3 — Launch week",
      focusMetric: block === "capture" ? "Capture → convert (5 sales)" : "Sales (target: 5)",
      top3: ["Announce + CTA", "Proof post", "Last-call post"],
      tasks: uniqueTrim(week3).slice(0, 10),
      chicagoMove:
        "Run one Chicago-timed push (Thu–Sat) with a local tag + local collab.",
    },
    {
      title: "Week 4 — Optimize + repeat",
      focusMetric: "Conversion rate + next cycle plan",
      top3: ["Review results", "Rewrite offer headline", "Schedule next cycle"],
      tasks: uniqueTrim(week4).slice(0, 10),
      chicagoMove:
        "Lock one recurring local opportunity (monthly venue night, open mic, creator meetup).",
    },
  ];

  return { headline, subhead, weeks, quickWins };
}

function uniqueTrim(items: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const t = (raw || "").trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}