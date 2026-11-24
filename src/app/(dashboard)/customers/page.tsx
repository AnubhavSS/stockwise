/** Customer directory placeholder — customers are already used on sales invoices. */
import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <ModulePlaceholder
      title="Customers"
      description="Directory of Indian trade customers used on sales invoices."
      highlights={[
        "Contact, city and GSTIN details",
        "Outstanding balances from unpaid invoices",
        "Active and inactive customer status",
        "Linked from the sales module",
      ]}
    />
  );
}
