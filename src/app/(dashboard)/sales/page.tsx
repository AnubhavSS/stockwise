/** Sales list. Wrapped in Suspense because filters read search params. */
import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { SalesWorkspace } from "@/components/sales/sales-workspace";

export const metadata: Metadata = {
  title: "Sales",
};

export default function SalesPage() {
  return (
    <Suspense fallback={<LoadingState rows={8} />}>
      <SalesWorkspace />
    </Suspense>
  );
}
