"use client";

/**
 * Global movement log with type and product filters.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StockHistoryTable } from "@/components/stock/stock-history-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMovementTypeLabel } from "@/features/stock/movements";
import { filterStockMovements, type HistoryFilters } from "@/features/stock/selectors";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { deriveMovementBalances } from "@/lib/stock-transactions";
import { useInventoryStore } from "@/store/inventory-store";
import type { StockMovementType } from "@/types/inventory";

const TYPE_OPTIONS: Array<StockMovementType | "all"> = [
  "all",
  "purchase",
  "sale",
  "adjustment",
];

export function StockHistoryWorkspace() {
  const mounted = useHasMounted();
  const products = useInventoryStore((state) => state.products);
  const stockMovements = useInventoryStore((state) => state.stockMovements);
  const [filters, setFilters] = useState<HistoryFilters>({
    search: "",
    type: "all",
    from: "",
    to: "",
  });

  const rows = useMemo(() => {
    const filtered = filterStockMovements(stockMovements, products, filters);
    const productMap = new Map(products.map((product) => [product.id, product]));
    const result = filtered.map((movement) => {
      const product = productMap.get(movement.productId);
      const productMovements = stockMovements.filter(
        (item) => item.productId === movement.productId,
      );
      const balances = deriveMovementBalances(
        productMovements,
        product?.quantity ?? 0,
      );

      return {
        movement,
        product,
        stockAfter: balances.get(movement.id) ?? product?.quantity ?? 0,
      };
    });

    return result.sort(
      (left, right) =>
        new Date(right.movement.createdAt).getTime() -
        new Date(left.movement.createdAt).getTime(),
    );
  }, [filters, products, stockMovements]);

  if (!mounted) {
    return <LoadingState rows={8} />;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/stock" />}>
        <ArrowLeft />
        Back to Stock
      </Button>
      <PageHeader
        title="Stock History"
        description="Incoming and outgoing inventory movements across all products."
      />
      {/* Search, movement type, and optional from/to dates */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-border lg:flex-row lg:items-end">
        <SearchInput
          className="min-w-0 flex-1"
          value={filters.search}
          onValueChange={(search) => setFilters((current) => ({ ...current, search }))}
          placeholder="Search by product, SKU or reference..."
        />
        <Select
          value={filters.type}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            setFilters((current) => ({
              ...current,
              type: value as StockMovementType | "all",
            }));
          }}
        >
          <SelectTrigger className="w-full min-w-40 bg-card lg:w-44" aria-label="Movement type">
            <SelectValue>
              {filters.type === "all" ? "All Types" : getMovementTypeLabel(filters.type)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "All Types" : getMovementTypeLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangeFilter
          value={{ from: filters.from, to: filters.to }}
          onValueChange={(range) =>
            setFilters((current) => ({ ...current, from: range.from, to: range.to }))
          }
        />
      </div>
      {/* Newest first, with running stock-after from the ledger */}
      <StockHistoryTable rows={rows} />
    </div>
  );
}
