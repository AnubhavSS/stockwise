import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { SaleDetails } from "@/components/sales/sale-details";

export const metadata: Metadata = {
  title: "Sale",
};

export const instant = false;

async function SaleDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SaleDetails saleId={id} />;
}

export default function SaleDetailsPage({
  params,
}: PageProps<"/sales/[id]">) {
  return (
    <Suspense fallback={<LoadingState rows={8} />}>
      <SaleDetailsLoader params={params} />
    </Suspense>
  );
}
