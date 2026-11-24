/** Product detail: quantities, movements, and adjust/edit actions. */
import type { Metadata } from "next";
import { Suspense } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { ProductDetails } from "@/components/stock/product-details";

export const metadata: Metadata = {
  title: "Product",
};

export const instant = false;

async function ProductDetailsLoader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetails productId={id} />;
}

export default function ProductDetailsPage({
  params,
}: PageProps<"/stock/[id]">) {
  return (
    <Suspense fallback={<LoadingState label="Loading product…" />}>
      <ProductDetailsLoader params={params} />
    </Suspense>
  );
}
