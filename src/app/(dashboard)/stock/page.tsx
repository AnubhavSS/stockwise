import type { Metadata } from "next";

import { StockWorkspace } from "@/components/stock/stock-workspace";

export const metadata: Metadata = {
  title: "Stock",
};

export default function StockPage() {
  return <StockWorkspace />;
}
