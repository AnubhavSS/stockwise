import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <ModulePlaceholder
      title="Dashboard"
      description="A live snapshot of inventory health, sales, purchases and stock alerts."
      highlights={[
        "KPI cards derived from inventory, sales and purchase data",
        "Low-stock alerts from product thresholds",
        "Recent activity feed from sample movements",
        "Charts via Recharts in a later step",
      ]}
    />
  );
}
