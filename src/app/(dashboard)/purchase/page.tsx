import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { PurchaseWorkspace } from "@/components/purchase/purchase-workspace";

export const metadata: Metadata = {
  title: "Purchases",
};

export default function PurchasePage() {
  return (
    <Suspense fallback={<LoadingState rows={8} />}>
      <PurchaseWorkspace />
    </Suspense>
  );
}
