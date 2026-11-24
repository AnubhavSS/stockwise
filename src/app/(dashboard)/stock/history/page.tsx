/** Full stock movement log across the catalogue. */
import type { Metadata } from "next";

import { StockHistoryWorkspace } from "@/components/stock/stock-history-workspace";

export const metadata: Metadata = {
  title: "Stock History",
};

export default function StockHistoryPage() {
  return <StockHistoryWorkspace />;
}
