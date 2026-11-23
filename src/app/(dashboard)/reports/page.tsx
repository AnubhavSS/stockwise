import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Reports"
      description="Analyse sales, purchases, stock value and inventory movement over time."
      highlights={[
        "Period filters for 7, 30 and 90 days",
        "Sales versus purchase totals in INR",
        "Inventory valuation from on-hand quantity",
        "Recharts visualisations in a later step",
      ]}
    />
  );
}
