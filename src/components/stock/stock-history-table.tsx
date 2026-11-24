"use client";

/**
 * Movement rows with signed quantity and reference id.
 */
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatQuantityChange,
  getMovementTypeLabel,
} from "@/features/stock/movements";
import { formatDateTime, formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Product, StockMovement } from "@/types/inventory";

type HistoryRow = {
  movement: StockMovement;
  product?: Product;
  stockAfter: number;
};

type StockHistoryTableProps = {
  rows: HistoryRow[];
  showProduct?: boolean;
};

export function StockHistoryTable({
  rows,
  showProduct = true,
}: StockHistoryTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No stock movements yet"
        description="Purchases, sales and manual adjustments will appear here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Date & Time</TableHead>
            {showProduct ? <TableHead>Product</TableHead> : null}
            {showProduct ? <TableHead>SKU</TableHead> : null}
            <TableHead>Movement Type</TableHead>
            <TableHead>Reference ID</TableHead>
            <TableHead className="text-right">Quantity Change</TableHead>
            <TableHead className="text-right">Stock After</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ movement, product, stockAfter }) => {
            const incoming = movement.quantityChange > 0;
            return (
              <TableRow key={movement.id}>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(movement.createdAt)}
                </TableCell>
                {showProduct ? (
                  <TableCell className="font-medium">
                    {product?.name ?? "Archived item"}
                  </TableCell>
                ) : null}
                {showProduct ? (
                  <TableCell className="text-muted-foreground">
                    {product?.sku ?? "—"}
                  </TableCell>
                ) : null}
                <TableCell>{getMovementTypeLabel(movement.type)}</TableCell>
                <TableCell className="font-mono text-xs">
                  {movement.referenceId}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    incoming ? "text-success" : "text-destructive",
                  )}
                >
                  {formatQuantityChange(movement.quantityChange)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(stockAfter)}
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {movement.remarks}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export type { HistoryRow };
