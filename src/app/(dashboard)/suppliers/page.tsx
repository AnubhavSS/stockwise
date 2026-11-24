/** Supplier directory placeholder — suppliers are already used on purchase orders. */
import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Suppliers",
};

export default function SuppliersPage() {
  return (
    <ModulePlaceholder
      title="Suppliers"
      description="Directory of suppliers used on purchase orders and receipts."
      highlights={[
        "Contact, city and GSTIN details",
        "Lead time used for expected dates",
        "Active supplier status",
        "Linked from the purchase module",
      ]}
    />
  );
}
