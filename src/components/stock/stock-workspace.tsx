"use client";

import { useMemo, useState } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { AddItemDialog } from "@/components/stock/add-item-dialog";
import { AdjustStockDialog } from "@/components/stock/adjust-stock-dialog";
import { DeleteItemDialog } from "@/components/stock/delete-item-dialog";
import { EditItemDialog } from "@/components/stock/edit-item-dialog";
import { StockPageHeader } from "@/components/stock/stock-page-header";
import { StockSummaryCards } from "@/components/stock/stock-summary-cards";
import { StockTable } from "@/components/stock/stock-table";
import { StockTabs } from "@/components/stock/stock-tabs";
import { StockToolbar } from "@/components/stock/stock-toolbar";
import {
  DEFAULT_STOCK_FILTERS,
  deriveStockSummary,
  filterProducts,
  getProductCategories,
  hasActiveStockFilters,
  paginateItems,
  sortProducts,
  type StockFilters,
} from "@/features/stock/selectors";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useInventoryStore } from "@/store/inventory-store";
import type { Product } from "@/types/inventory";

export function StockWorkspace() {
  const mounted = useHasMounted();
  const products = useInventoryStore((state) => state.products);
  const [filters, setFilters] = useState<StockFilters>(DEFAULT_STOCK_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const summary = useMemo(() => deriveStockSummary(products), [products]);
  const categories = useMemo(() => getProductCategories(products), [products]);
  const filtered = useMemo(
    () => sortProducts(filterProducts(products, filters)),
    [filters, products],
  );
  const paged = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  function updateFilters(next: StockFilters) {
    setFilters(next);
    setPage(1);
  }

  if (!mounted) {
    return <LoadingState rows={8} />;
  }

  return (
    <div className="space-y-6">
      <StockPageHeader onAddItem={() => setAddOpen(true)} />
      <StockSummaryCards summary={summary} />
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
        <div className="space-y-4 p-4">
          <StockTabs
            value={filters.tab}
            summary={summary}
            onValueChange={(tab) => updateFilters({ ...filters, tab })}
          />
          <StockToolbar
            filters={filters}
            categories={categories}
            hasActiveFilters={hasActiveStockFilters(filters)}
            onFiltersChange={updateFilters}
            onClear={() => updateFilters(DEFAULT_STOCK_FILTERS)}
          />
        </div>
        <div className="px-0 pb-0">
          <StockTable
            products={paged.items}
            selectedIds={selectedIds}
            page={paged.page}
            pageSize={paged.pageSize}
            total={paged.total}
            onSelectedIdsChange={setSelectedIds}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onEdit={setEditProduct}
            onAdjust={setAdjustProduct}
            onDelete={setDeleteProduct}
          />
        </div>
      </section>

      <AddItemDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditItemDialog
        product={editProduct}
        open={Boolean(editProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setEditProduct(null);
          }
        }}
      />
      <AdjustStockDialog
        product={adjustProduct}
        open={Boolean(adjustProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setAdjustProduct(null);
          }
        }}
      />
      <DeleteItemDialog
        product={deleteProduct}
        open={Boolean(deleteProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteProduct(null);
          }
        }}
      />
    </div>
  );
}
