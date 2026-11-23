import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Purchase",
};

export default function PurchasePage() {
  return (
    <ModulePlaceholder
      title="Purchase"
      description="Raise purchase orders, receive goods and restock inventory."
      highlights={[
        "Purchase order list with supplier context",
        "Partial and full goods receipt",
        "Stock increase through purchase movements",
        "Expected versus received dates",
      ]}
    />
  );
}
