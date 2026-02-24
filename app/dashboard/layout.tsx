"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type NavItem = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

const WORKSPACE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Command Center", match: "exact" },
  { href: "/dashboard/snapshot", label: "Creator Snapshot", match: "exact" },
  { href: "/dashboard/snapshot/summary", label: "Snapshot Summary", match: "exact" },
  { href: "/dashboard/diagnostic", label: "Revenue Diagnostic", match: "prefix" },
  { href: "/dashboard/offers", label: "Offer Library", match: "prefix" },
  { href: "/dashboard/analytics", label: "Analytics", match: "exact" },
];

const ACCOUNT_NAV: NavItem[] = [
  { href: "/pricing", label: "Pricing", match: "prefix" },
  { href: "/faq", label: "FAQ", match: "prefix" },
  { href: "/", label: "Landing Page", match: "exact" },
];

function isActive(pathname: string, item: NavItem) {
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

function NavLink({
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
        "group inline-flex items-center rounded-xl border transition",
        compact ? "px-3 py-2 text-xs" : "w-full px-3 py-2.5 text-sm",
        active
          ? "border-white/20 bg-white text-black"
          : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-white/20 to-white/5 ring-1 ring-white/15" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-xs tracking-wide text-white/60">
                TruthRadeo • Stage 1
              </div>
              <div className="truncate text-sm font-semibold sm:text-base">
                Chicago Workspace
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/offers/new"
              className="hidden rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 sm:inline-flex"
            >
              New Blueprint
            </Link>
            <div className="rounded-xl border border-white/10 bg-white/5 p-1">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>

        {/* Mobile quick nav */}
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 sm:px-6 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {WORKSPACE_NAV.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} compact />
            ))}
          </div>
        </div>
      </header>

      {/* Main shell */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 grid gap-4">
            <section className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-white/50">
                Workspace
              </div>
              <div className="grid gap-2">
                {WORKSPACE_NAV.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-white/50">
                Quick Actions
              </div>

              <div className="grid gap-2">
                <Link
                  href="/dashboard/offers/new"
                  className="w-full rounded-xl border border-white/15 bg-white px-3 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Create New Offer
                </Link>

                <Link
                  href="/dashboard/snapshot"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Update Snapshot
                </Link>

                <Link
                  href="/dashboard/diagnostic"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Run Diagnostic
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-white/50">
                Account
              </div>
              <div className="grid gap-2">
                {ACCOUNT_NAV.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}