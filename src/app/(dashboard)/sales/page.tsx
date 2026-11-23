import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Sales",
};

export default function SalesPage() {
  return (
    <ModulePlaceholder
      title="Sales"
      description="Create invoices, track fulfilment and record customer payments."
      highlights={[
        "Invoice list with status and payment badges",
        "Line items linked to product SKUs",
        "Stock deduction through sale movements",
        "Customer outstanding balances",
      ]}
    />
  );
}
