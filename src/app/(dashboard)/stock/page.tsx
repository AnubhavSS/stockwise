import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Stock",
};

export default function StockPage() {
  return (
    <ModulePlaceholder
      title="Stock"
      description="Manage the product catalogue, quantities, valuation and adjustments."
      highlights={[
        "Product catalogue with SKU and category",
        "Minimum stock thresholds and alerts",
        "Manual adjustments with audit remarks",
        "Movement history from sales and purchases",
      ]}
    />
  );
}
