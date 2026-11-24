/** Purchase orders. */
import type { Metadata } from "next";

import { PurchaseWorkspace } from "@/components/purchase/purchase-workspace";

export const metadata: Metadata = {
  title: "Purchases",
};

export default function PurchasePage() {
  return <PurchaseWorkspace />;
}
