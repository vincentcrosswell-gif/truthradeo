"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect, type CSSProperties, type ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  short: string;
  line: string;
  lineGlow: string;
  station: string;
  match?: "exact" | "prefix";
};

const WORKSPACE_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Command Center",
    short: "CTRL",
    station: "Clark/Lake",
    line: "from-cyan-400 to-blue-500",
    lineGlow: "shadow-cyan-400/30",
    match: "exact",
  },
  {
    href: "/dashboard/snapshot",
    label: "Creator Snapshot",
    short: "SNAP",
    station: "South Loop",
    line: "from-emerald-400 to-lime-400",
    lineGlow: "shadow-emerald-400/30",
    match: "exact",
  },
  {
    href: "/dashboard/snapshot/summary",
    label: "Snapshot Summary",
    short: "SUM",
    station: "Lakefront",
    line: "from-sky-400 to-indigo-400",
    lineGlow: "shadow-sky-400/30",
    match: "exact",
  },
  {
    href: "/dashboard/diagnostic",
    label: "Revenue Diagnostic",
    short: "DIAG",
    station: "Loop",
    line: "from-amber-300 to-orange-500",
    lineGlow: "shadow-amber-300/30",
    match: "prefix",
  },
  {
    href: "/dashboard/offers",
    label: "Offer Library",
    short: "OFR",
    station: "River North",
    line: "from-fuchsia-400 to-pink-500",
    lineGlow: "shadow-fuchsia-400/30",
    match: "prefix",
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    short: "ANLY",
    station: "UIC-Halsted",
    line: "from-rose-400 to-red-500",
    lineGlow: "shadow-rose-400/30",
    match: "exact",
  },
];

const ACCOUNT_NAV = [
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/", label: "Landing Page" },
] as const;

function isActive(pathname: string, item: Pick<NavItem, "href" | "match">) {
  const mode = item.match ?? "prefix";
  if (mode === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function normalizeDashboardRoute(pathname: string) {
  if (pathname === "/dashboard") return "/dashboard";
  if (pathname.startsWith("/dashboard/snapshot/summary")) return "/dashboard/snapshot/summary";
  if (pathname.startsWith("/dashboard/snapshot")) return "/dashboard/snapshot";
  if (pathname.startsWith("/dashboard/diagnostic")) return "/dashboard/diagnostic";
  if (pathname.startsWith("/dashboard/offers/new")) return "/dashboard/offers/new";
  if (pathname.startsWith("/dashboard/analytics")) return "/dashboard/analytics";
  if (/^\/dashboard\/offers\/[^/]+/.test(pathname)) return "/dashboard/offers/[id]";
  if (pathname.startsWith("/dashboard/offers")) return "/dashboard/offers";
  return "/dashboard";
}

function inferStep(route: string) {
  if (route.startsWith("/dashboard/snapshot")) return "snapshot";
  if (route.startsWith("/dashboard/diagnostic")) return "diagnostic";
  if (route.startsWith("/dashboard/offers/new")) return "offer_builder";
  if (route.startsWith("/dashboard/analytics")) return "analytics";
  if (route === "/dashboard/offers/[id]") return "execution";
  if (route.startsWith("/dashboard/offers")) return "offers";
  return "dashboard";
}

function topbarGlowStyle(pathname: string): CSSProperties {
  const active = WORKSPACE_NAV.find((item) => isActive(pathname, item));

  const color =
    active?.href === "/dashboard/snapshot"
      ? "rgba(16, 185, 129, 0.22)"
      : active?.href === "/dashboard/snapshot/summary"
      ? "rgba(56, 189, 248, 0.18)"
      : active?.href === "/dashboard/diagnostic"
      ? "rgba(251, 146, 60, 0.20)"
      : active?.href === "/dashboard/offers"
      ? "rgba(217, 70, 239, 0.18)"
      : active?.href === "/dashboard/analytics"
      ? "rgba(244, 63, 94, 0.18)"
      : "rgba(34, 211, 238, 0.18)";

  return {
    background: `radial-gradient(900px 220px at 10% 0%, ${color}, transparent 70%), radial-gradient(500px 220px at 90% 0%, rgba(255,255,255,0.08), transparent 70%)`,
  };
}

function NavRailItem({
  item,
  pathname,
  compact = false,
}: {
  item: NavItem;
  pathname: string;
  compact?: boolean;
}) {
  const active = isActive(pathname, item);

  return (
    <Link
      href={item.href}
      className={[
        "group relative block overflow-hidden rounded-2xl border transition",
        compact ? "min-w-[220px] p-3" : "p-3.5",
        active
          ? "border-white/20 bg-white/10 shadow-lg"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 flex flex-col items-center">
          <div
            className={[
              "h-3.5 w-3.5 rounded-full border",
              active
                ? `border-white/40 bg-gradient-to-br ${item.line} shadow ${item.lineGlow}`
                : "border-white/25 bg-white/10",
            ].join(" ")}
          />
          <div className="mt-1 h-9 w-px bg-gradient-to-b from-white/30 to-transparent" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold tracking-tight text-white">
              {item.label}
            </div>
            <span
              className={[
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-widest",
                active
                  ? "border-white/20 bg-black/40 text-white"
                  : "border-white/10 bg-black/20 text-white/70",
              ].join(" ")}
            >
              {item.short}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-white/60">
            <span className="truncate">{item.station}</span>
            <span className={active ? "text-emerald-200" : "text-white/40"}>
              {active ? "LIVE" : "STOP"}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10">
            <div
              className={[
                "h-1.5 rounded-full transition-all",
                active ? `w-full bg-gradient-to-r ${item.line}` : "w-4 bg-white/25",
              ].join(" ")}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TickerStrip({ pathname }: { pathname: string }) {
  const active = WORKSPACE_NAV.find((item) => isActive(pathname, item)) ?? WORKSPACE_NAV[0];
  const tickerText = [
    "CHICAGO STAGE • NIGHT TRANSIT MODE",
    `ACTIVE STOP • ${active.label.toUpperCase()}`,
    "SNAPSHOT → DIAGNOSTIC → OFFER → EXECUTION",
    "BUILD LOUD • SHIP FAST • TRACK SIGNAL",
    "HOUSE • DRILL • SOUL • INDIE • AFRO • ALT",
  ];

  return (
    <div className="border-t border-white/10 bg-black/40">
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 overflow-hidden px-4 py-2 sm:px-6">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-widest text-white/75 sm:inline-flex">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
          CITY TICKER
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/70 to-transparent" />
          <div className="tr-marquee flex min-w-max items-center gap-4 text-[11px] tracking-[0.14em] text-white/70 uppercase">
            {[...tickerText, ...tickerText].map((text, i) => (
              <span key={`${text}-${i}`} className="inline-flex items-center gap-3">
                <span className="text-cyan-200/80">✦</span>
                <span>{text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionDock({ pathname }: { pathname: string }) {
  const active = WORKSPACE_NAV.find((item) => isActive(pathname, item)) ?? WORKSPACE_NAV[0];

  return (
    <aside className="hidden 2xl:block">
      <div className="sticky top-24 grid gap-4">
        <section className="tr-noise relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.14),transparent_45%),radial-gradient(circle_at_90%_15%,rgba(244,63,94,0.14),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(250,204,21,0.12),transparent_45%)]" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.22em] text-white/55">Now Playing</div>
            <div className="mt-2 text-lg font-black tracking-tight text-white">{active.label}</div>
            <p className="mt-1 text-xs text-white/65">
              Station: <span className="text-white/85">{active.station}</span>
            </p>

            <div className="mt-4 grid gap-2">
              <QuickDockLink href="/dashboard/offers/new" label="New Blueprint" accent="cyan" />
              <QuickDockLink href="/dashboard/snapshot" label="Update Snapshot" accent="emerald" />
              <QuickDockLink href="/dashboard/diagnostic" label="Run Diagnostic" accent="amber" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/35 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/50">Daily Mission</div>
              <div className="mt-1 text-sm font-semibold text-white">Keep the line moving</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] tracking-widest text-white/70">
              CHI-01
            </span>
          </div>

          <ul className="mt-3 grid gap-2 text-xs text-white/75">
            <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">1) Refresh Snapshot signal</li>
            <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">2) Run Diagnostic and compare trend</li>
            <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">3) Ship one execution block</li>
          </ul>
        </section>
      </div>
    </aside>
  );
}

function QuickDockLink({
  href,
  label,
  accent,
}: {
  href: string;
  label: string;
  accent: "cyan" | "emerald" | "amber";
}) {
  const accentClass =
    accent === "cyan"
      ? "from-cyan-400/20 to-blue-500/20 border-cyan-300/15"
      : accent === "emerald"
      ? "from-emerald-400/20 to-lime-400/20 border-emerald-300/15"
      : "from-amber-300/20 to-orange-500/20 border-amber-300/15";

  return (
    <Link
      href={href}
      className={`rounded-xl border bg-gradient-to-r ${accentClass} px-3 py-2 text-xs font-semibold text-white/90 hover:brightness-110`}
    >
      {label} →
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !pathname.startsWith("/dashboard")) return;

    const route = normalizeDashboardRoute(pathname);
    const step = inferStep(route);

    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "page_view",
        route,
        step,
      }),
    }).catch(() => {
      // best-effort analytics (never block UI)
    });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(14,165,233,0.12),transparent_45%),radial-gradient(circle_at_85%_8%,rgba(244,63,94,0.10),transparent_35%),radial-gradient(circle_at_40%_85%,rgba(250,204,21,0.08),transparent_40%),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:auto,auto,auto,32px_32px,32px_32px]" />
        <div className="absolute inset-0 opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]">
          <div className="absolute -left-16 top-20 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-8 top-12 h-44 w-44 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-36 w-36 rounded-full bg-amber-400/15 blur-3xl" />
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/65 backdrop-blur-xl">
        <div className="absolute inset-0" style={topbarGlowStyle(pathname)} />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="tr-noise relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-fuchsia-400/15 to-amber-300/20" />
                <span className="relative text-sm font-black tracking-widest">TR</span>
              </div>

              <div className="min-w-0 leading-tight">
                <div className="truncate text-[11px] uppercase tracking-[0.2em] text-white/60">
                  TruthRadeo • Stage 1 • Chicago
                </div>
                <div className="truncate text-sm font-semibold tracking-tight sm:text-base">
                  Chicago Control Deck
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/offers/new"
                className="hidden rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/15 sm:inline-flex"
              >
                + New Blueprint
              </Link>
              <div className="rounded-xl border border-white/10 bg-white/5 p-1.5">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>

        <TickerStrip pathname={pathname} />

        <div className="relative mx-auto w-full max-w-[1600px] px-4 pb-3 sm:px-6 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {WORKSPACE_NAV.map((item) => (
              <NavRailItem key={item.href} item={item} pathname={pathname} compact />
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 grid gap-4">
            <section className="tr-noise overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/55">L Line</div>
                  <div className="mt-1 text-sm font-semibold text-white">Workspace Stations</div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] tracking-widest text-white/70">
                  CTA MODE
                </span>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute bottom-7 left-[9px] top-3 w-[2px] rounded-full bg-gradient-to-b from-cyan-400/60 via-fuchsia-400/40 to-red-400/40" />
                <div className="grid gap-2">
                  {WORKSPACE_NAV.map((item) => (
                    <NavRailItem key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/55">Quick Actions</div>
              <div className="mt-3 grid gap-2">
                <QuickDockLink href="/dashboard/offers/new" label="Create New Offer" accent="cyan" />
                <QuickDockLink href="/dashboard/snapshot" label="Update Snapshot" accent="emerald" />
                <QuickDockLink href="/dashboard/diagnostic" label="Run Diagnostic" accent="amber" />
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-black/30 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/55">Account</div>
              <div className="mt-3 grid gap-2">
                {ACCOUNT_NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "rounded-xl border px-3 py-2 text-sm transition",
                        active
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>

        <MissionDock pathname={pathname} />
      </div>
    </div>
  );
}