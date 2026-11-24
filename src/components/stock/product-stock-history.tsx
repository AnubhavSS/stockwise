"use client";

/**
 * Movements for one SKU with running balance.
 */
import { StockHistoryTable } from "@/components/stock/stock-history-table";
import { deriveMovementBalances } from "@/lib/stock-transactions";
import type { Product, StockMovement } from "@/types/inventory";

export function ProductStockHistory({
  product,
  movements,
}: {
  product: Product;
  movements: StockMovement[];
}) {
  const balances = deriveMovementBalances(movements, product.quantity);
  const rows = [...movements]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .map((movement) => ({
      movement,
      product,
      stockAfter: balances.get(movement.id) ?? product.quantity,
    }));

  return <StockHistoryTable rows={rows} showProduct={false} />;
}
