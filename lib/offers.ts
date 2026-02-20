export type OfferLane = "service" | "digital" | "membership" | "live" | "hybrid";

export type OfferInputs = {
  lane: OfferLane;
  artistName: string;
  genre: string;
  vibeTags: string;
  primaryGoal: string;
  audienceSize: string;
  biggestBlocker: string;
};

export function buildOfferBlueprint(i: OfferInputs) {
  const vibe = (i.vibeTags || "").split(",")[0]?.trim() || "high-energy";
  const baseTitle =
    i.lane === "service" ? "Feature / Session Pack" :
    i.lane === "digital" ? "Sample Pack / Preset Drop" :
    i.lane === "membership" ? "Fan Club Membership" :
    i.lane === "live" ? "Live Show Bundle" :
    "Creator Bundle";

  const title = `${baseTitle} • ${vibe}`;

  const promise =
    i.lane === "membership"
      ? "Turn casual listeners into paying supporters with a simple monthly value loop."
      : i.lane === "digital"
      ? "Sell a repeatable product once and let it compound with every drop."
      : i.lane === "service"
      ? "Convert demand into revenue with a clear offer + fast turnaround."
      : i.lane === "live"
      ? "Package shows + merch + follow-up into one conversion system."
      : "Bundle the simplest revenue moves into one easy pitch.";

  const pricing =
    i.lane === "membership"
      ? [
          { tier: "Entry", price: "$5/mo", includes: ["early access", "member posts"] },
          { tier: "Core", price: "$15/mo", includes: ["monthly live", "exclusive drop"] },
          { tier: "Premium", price: "$50/mo", includes: ["1:1 shoutout", "VIP access"] },
        ]
      : i.lane === "digital"
      ? [
          { tier: "Entry", price: "$15", includes: ["starter pack"] },
          { tier: "Core", price: "$39", includes: ["full pack + bonus"] },
          { tier: "Premium", price: "$99", includes: ["commercial license + extras"] },
        ]
      : i.lane === "service"
      ? [
          { tier: "Entry", price: "$75", includes: ["quick feature / hook"] },
          { tier: "Core", price: "$150", includes: ["full feature verse"] },
          { tier: "Premium", price: "$300", includes: ["rush + promo collab clip"] },
        ]
      : i.lane === "live"
      ? [
          { tier: "Entry", price: "$20", includes: ["ticket + QR follow"] },
          { tier: "Core", price: "$45", includes: ["ticket + merch item"] },
          { tier: "Premium", price: "$120", includes: ["VIP + meet + exclusive item"] },
        ]
      : [
          { tier: "Entry", price: "$25", includes: ["starter offer"] },
          { tier: "Core", price: "$75", includes: ["main offer"] },
          { tier: "Premium", price: "$200", includes: ["premium add-on"] },
        ];

  const deliverables =
    i.lane === "service"
      ? ["Clear scope + turnaround time", "Proof/examples", "Payment link", "Delivery method"]
      : i.lane === "digital"
      ? ["Product files", "License terms", "Delivery email", "Refund policy"]
      : i.lane === "membership"
      ? ["Monthly value loop", "Content schedule", "Community platform", "Onboarding message"]
      : i.lane === "live"
      ? ["Show CTA plan", "QR funnel", "Follow-up DM/email", "Merch bundle offer"]
      : ["Bundle components", "CTA", "Fulfillment plan", "Follow-up"];

  const funnel = [
    { step: "Traffic", action: "IG/TikTok post + story linking to Offer Page" },
    { step: "Convert", action: "Simple offer page → pay link / sign-up" },
    { step: "Deliver", action: "Auto-confirmation + delivery steps" },
    { step: "Upsell", action: "Offer tier upgrade within 48 hours" },
  ];

  const scripts = {
    dm: `Yo — I’m ${i.artistName || "an artist"} (${i.genre || "Chicago"}) dropping a ${baseTitle}. Want me to send the details?`,
    caption: `Chicago signal check. Dropping a ${baseTitle} this week. Link in bio — limited slots.`,
    followUp: `Quick follow-up — want the Entry/Core/Premium options? I can send the link.`,
  };

  return { title, promise, pricing, deliverables, funnel, scripts };
}
