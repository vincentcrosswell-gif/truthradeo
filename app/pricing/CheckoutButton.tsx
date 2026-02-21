"use client";

import { useState } from "react";
import type { Plan, Cadence } from "@/lib/billing/plans";

export default function CheckoutButton({
  plan,
  cadence,
  label,
  className,
}: {
  plan: Plan;
  cadence: Cadence;
  label: string;
  className: string;
}) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, cadence }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e: any) {
      alert(e.message ?? "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <button onClick={go} disabled={loading} className={className}>
      {loading ? "Redirecting..." : label}
    </button>
  );
}