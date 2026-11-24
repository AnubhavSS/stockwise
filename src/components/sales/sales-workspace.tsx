"use client";

/**
 * Sales module: filters, summary, chart, and invoice table from the sales store.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { LoadingState } from "@/components/shared/loading-state";
import { CancelSaleDialog } from "@/components/sales/cancel-sale-dialog";
import { CreateSaleSheet } from "@/components/sales/create-sale-sheet";
import { SalesChart } from "@/components/sales/sales-chart";
import { SalesPageHeader } from "@/components/sales/sales-page-header";
import { SalesSummaryCards } from "@/components/sales/sales-summary-cards";
import { SalesTable } from "@/components/sales/sales-table";
import { SalesTabs } from "@/components/sales/sales-tabs";
import { SalesToolbar } from "@/components/sales/sales-toolbar";
import { exportSalesCsv } from "@/features/sales/export";
import type { SalesPeriod } from "@/features/sales/periods";
import {
  DEFAULT_SALES_FILTERS,
  deriveSalesSeries,
  deriveSalesSummary,
  filterSales,
  hasActiveSalesFilters,
  paginateItems,
  tabCounts,
  type SalesFilters,
} from "@/features/sales/selectors";
import { useCreateQuery } from "@/hooks/use-create-query";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useSalesStore } from "@/store/sales-store";
import type { Sale } from "@/types/sales";

export function SalesWorkspace() {
  const mounted = useHasMounted();
  const [createOpen, setCreateOpen] = useCreateQuery("/sales");
  const sales = useSalesStore((state) => state.sales);
  const customers = useSalesStore((state) => state.customers);
  const [filters, setFilters] = useState<SalesFilters>(DEFAULT_SALES_FILTERS);
  const [period, setPeriod] = useState<SalesPeriod>("30d");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [cancelSale, setCancelSale] = useState<Sale | null>(null);

  const summary = useMemo(() => deriveSalesSummary(sales, period), [period, sales]);
  const series = useMemo(() => deriveSalesSeries(sales, period), [period, sales]);
  const counts = useMemo(() => tabCounts(sales), [sales]);
  const filtered = useMemo(
    () => filterSales(sales, customers, filters),
    [customers, filters, sales],
  );
  const paged = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  function updateFilters(next: SalesFilters) {
    setFilters(next);
    setPage(1);
  }

  if (!mounted) {
    return <LoadingState label="Loading sales…" />;
  }

  return (
    <div className="space-y-6">
      {/* Title, CSV export, create invoice */}
      <SalesPageHeader
        onExport={() => {
          exportSalesCsv(filtered, customers);
          toast.success("Sales exported.");
        }}
        onCreate={() => setCreateOpen(true)}
      />
      {/* Period KPIs: revenue, orders, AOV, pending payments */}
      <SalesSummaryCards summary={summary} />
      {/* Completed-sales trend for the selected period */}
      <SalesChart data={series} period={period} onPeriodChange={setPeriod} />
      {/* Tabs + search/filters sit above the paginated invoice table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
        <div className="space-y-4 p-4">
          <SalesTabs
            value={filters.tab}
            counts={counts}
            onValueChange={(tab) => updateFilters({ ...filters, tab })}
          />
          <SalesToolbar
            filters={filters}
            hasActiveFilters={hasActiveSalesFilters(filters)}
            onFiltersChange={updateFilters}
            onClear={() => updateFilters(DEFAULT_SALES_FILTERS)}
          />
        </div>
        <SalesTable
          sales={paged.items}
          customers={customers}
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
          onEdit={setEditSale}
          onCancel={setCancelSale}
        />
      </section>

      {/* Create/edit sheet and cancel confirmation — not part of the page layout */}
      <CreateSaleSheet
        open={createOpen || Boolean(editSale)}
        sale={editSale}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditSale(null);
          }
        }}
      />
      <CancelSaleDialog
        sale={cancelSale}
        open={Boolean(cancelSale)}
        onOpenChange={(open) => {
          if (!open) {
            setCancelSale(null);
          }
        }}
      />
    </div>
  );
}
