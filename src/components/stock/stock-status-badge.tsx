import { StatusBadge } from "@/components/shared/status-badge";
import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusTone,
} from "@/features/stock/status";
import type { Product } from "@/types/inventory";

export function StockStatusBadge({
  product,
}: {
  product: Pick<Product, "quantity" | "minimumStockLevel">;
}) {
  const status = getStockStatus(product);

  return (
    <StatusBadge
      label={getStockStatusLabel(status)}
      tone={getStockStatusTone(status)}
    />
  );
}
