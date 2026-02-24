import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import FunnelDropoffPanel from "../FunnelDropoffPanel";

export default async function DashboardAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="grid gap-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-white/50">Dashboard</div>
        <h1 className="mt-1 text-2xl font-extrabold">Analytics</h1>
        <p className="mt-2 text-sm text-white/65">
          Internal funnel tracking for Chicago Stage. Uses first-party event logging in your own database.
        </p>
      </div>

      <FunnelDropoffPanel userId={userId} />
    </div>
  );
}