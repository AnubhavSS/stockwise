/** Home overview: KPIs, sales vs purchases, stock mix, alerts, and activity. */
import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
