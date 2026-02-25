// app/dashboard/offers/[id]/CopyBlock.tsx
"use client";

import { useState } from "react";

export default function CopyBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // no-op fallback
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(217,70,239,0.08),transparent_35%)]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">Script Module</div>
            <div className="mt-1 text-sm font-semibold text-white/90">{title}</div>
          </div>

          <button
            onClick={copy}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              copied
                ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
                : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
            }`}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>

        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-white/85">
          {text?.trim() ? text : "—"}
        </pre>
      </div>
    </div>
  );
}