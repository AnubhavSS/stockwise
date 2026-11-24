/** Single purchase order: receive goods, payments, and cancel rules. */
import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { PurchaseDetails } from "@/components/purchase/purchase-details";

export const metadata: Metadata = {
  title: "Purchase Order",
};

export const instant = false;

async function PurchaseDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PurchaseDetails purchaseId={id} />;
}

export default function PurchaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState rows={8} />}>
      <PurchaseDetailsLoader params={params} />
    </Suspense>
  );
}
