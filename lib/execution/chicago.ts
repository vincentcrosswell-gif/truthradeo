// lib/execution/chicago.ts

export type SnapshotLike = {
  artistName?: string | null;
  cityArea?: string | null;
  genre?: string | null;
  vibeTags?: string | null;
  primaryGoal?: string | null;
  audienceSize?: string | null;
  emailList?: string | null;
  monthlyListeners?: string | null;
  priceRange?: string | null;
  performanceFrequency?: string | null;
  biggestBlocker?: string | null;
};

export type OfferLike = {
  id: string;
  title: string;
  promise: string;
  lane?: string | null;
  goal?: string | null;
  audience?: string | null;
  vibe?: string | null;
  pricing?: any;
  deliverables?: any;
  funnel?: any;
};

export type EmailItem = { subject: string; body: string };

export type ExecutionAssets = {
  offerPage: {
    headlines: string[];
    subheads: string[];
    bullets: string[];
    faq: { q: string; a: string }[];
    ctaButtons: string[];
  };
  dm: {
    opener: string;
    followUp1: string;
    followUp2: string;
    close: string;
  };
  livePitch: {
    short30: string;
    long90: string;
  };
  emailSequence: EmailItem[];
  socialPlan14: { day: string; post: string; cta: string }[];
};

function norm(s?: string | null) {
  return (s || "").trim();
}

function pick<T>(arr: T[], idx: number) {
  return arr[Math.min(arr.length - 1, Math.max(0, idx))];
}

function tagLine(vibeTags: string) {
  const tags = (vibeTags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
  return tags.length ? tags.join(" • ") : "";
}

function getPriceAnchor(pricing: any): string {
  // pricing is usually an array [{tier, price, includes}]
  if (!Array.isArray(pricing) || pricing.length === 0) return "$";
  const core = pricing.find((p: any) => String(p?.tier || "").toLowerCase().includes("core")) || pricing[0];
  return String(core?.price || "$");
}

export function generateExecutionAssets(offer: OfferLike, snap?: SnapshotLike | null): ExecutionAssets {
  const artist = norm(snap?.artistName) || "this artist";
  const city = norm(snap?.cityArea) || "your city";
  const genre = norm(snap?.genre) || norm(offer.audience) || "your sound";
  const vibe = tagLine(norm(snap?.vibeTags) || norm(offer.vibe) || "");
  const goal = norm(snap?.primaryGoal) || norm(offer.goal) || "get results";
  const blocker = norm(snap?.biggestBlocker) || "friction";
  const priceAnchor = getPriceAnchor(offer.pricing);

  const offerName = offer.title;
  const promise = offer.promise;

  const headlines = [
    `${offerName}: ${promise}`,
    `Chicago signal check: ${offerName} for ${genre}`,
    `Stop guessing — run ${offerName} this month`,
    `If your goal is “${goal}”, this is the fastest path`,
    `${offerName}: built to beat “${blocker}”`,
  ];

  const subheads = [
    `Designed for ${genre} creators in ${city}. Clear deliverables. Fast turnaround. Real results.`,
    `A clean offer you can sell in DMs — without sounding spammy.`,
    `One offer. One funnel. One month. Execute and collect proof.`,
  ];

  const bullets = [
    `Clear outcome and scope (no vague “we’ll see”).`,
    `Fast delivery and a simple process.`,
    `DM-ready script + caption-ready positioning.`,
    `Upgrade path (Entry → Core → Premium) to increase AOV.`,
    `Built to reduce: ${blocker}.`,
  ];

  const faq = [
    { q: "How fast do I get it?", a: "Fast turnaround. You’ll get a clear timeline after checkout/confirmation." },
    { q: "What do you need from me?", a: "A short intake + references. Keep it simple — the system handles the rest." },
    { q: "What if I’m not ready?", a: "Start with Entry tier. Upgrade within 48 hours if you want more." },
    { q: "Is there a refund?", a: "If work hasn’t started, we can cancel. Once delivery begins, partial refunds aren’t typical." },
    { q: "How do I book?", a: "Reply ‘DETAILS’ or use the link in bio. Limited slots." },
  ];

  const ctaButtons = ["Send me the details", "Book a slot", "See the packages", "Start with Entry", "Lock in Core"];

  const opener = `Yo — I’m ${artist}. I’m running ${offerName} for ${genre} this week. Want the Entry/Core/Premium options?`;
  const followUp1 = `Quick follow-up — want me to send the details + pricing ladder? It’s built for “${goal}”.`;
  const followUp2 = `Last ping — I’ve got limited slots. If you want ${offerName}, reply “DETAILS” and I’ll send the link.`;
  const close = `All good either way. If timing’s not right, I can circle back next week.`;

  const short30 = `Chicago signal check. I’m ${artist}. If your goal is “${goal}”, I’m offering ${offerName}. It’s simple: clear deliverables, fast turnaround, and a clean upgrade path. Reply “DETAILS” and I’ll send Entry/Core/Premium. Limited slots.`;

  const long90 = `Alright — real talk. Most creators get stuck on “${blocker}” because they don’t have a clean offer they can sell fast. I’m ${artist}, and I built ${offerName} to fix that. You get: a clear scope, a simple process, and a result you can actually point to. There’s Entry for starters, Core as the main value tier (around ${priceAnchor}), and Premium if you want the full package. If you want the breakdown, reply “DETAILS” and I’ll send it.`;

  const emailSequence: EmailItem[] = [
    {
      subject: `${offerName} is live (limited slots)`,
      body:
        `Quick heads up — I’m running ${offerName} right now.\n\n` +
        `If your goal is “${goal}”, this is the cleanest path I’ve found.\n\n` +
        `Reply “DETAILS” and I’ll send Entry/Core/Premium options.\n\n– ${artist}`,
    },
    {
      subject: `Why most creators get stuck on "${blocker}"`,
      body:
        `Most creators don’t fail because they’re untalented.\n` +
        `They fail because of "${blocker}".\n\n` +
        `${offerName} is designed to cut through that with a clear scope + delivery.\n\n` +
        `Want the details? Reply “DETAILS”.\n\n– ${artist}`,
    },
    {
      subject: `What you get (in plain English)`,
      body:
        `Here’s what ${offerName} gives you:\n` +
        `• Clear deliverables\n• Simple process\n• Fast turnaround\n• Upgrade path\n\n` +
        `If you want the pricing ladder, reply “DETAILS” and I’ll send it.\n\n– ${artist}`,
    },
    {
      subject: `Proof + last chance for this week`,
      body:
        `Slots are almost gone for this week.\n\n` +
        `If you want ${offerName}, reply “DETAILS” today and I’ll lock you in.\n\n– ${artist}`,
    },
    {
      subject: `Closing tonight — want me to hold a spot?`,
      body:
        `Final call — closing out booking tonight.\n\n` +
        `Reply “DETAILS” if you want Entry/Core/Premium.\n\n– ${artist}`,
    },
  ];

  const socialPlan14 = Array.from({ length: 14 }).map((_, i) => {
    const dayNum = i + 1;
    const day = `Day ${dayNum}`;
    const prompts = [
      `Hook: “If your goal is '${goal}', stop doing this…” Explain ${offerName} in 15 seconds.`,
      `Show proof: clip, screenshot, or outcome. Mention limited slots.`,
      `Explain the 3 tiers: Entry/Core/Premium in one take.`,
      `Talk about "${blocker}" and how ${offerName} fixes it.`,
      `Behind-the-scenes: process + what’s included.`,
      `FAQ: answer top objection in 20 seconds.`,
      `Story post: why you built ${offerName}.`,
    ];
    const post = pick(prompts, i % prompts.length);
    const cta = `CTA: Reply “DETAILS” or link in bio for ${offerName}.`;
    return { day, post, cta };
  });

  return {
    offerPage: { headlines, subheads, bullets, faq, ctaButtons },
    dm: { opener, followUp1, followUp2, close },
    livePitch: { short30, long90 },
    emailSequence,
    socialPlan14,
  };
}