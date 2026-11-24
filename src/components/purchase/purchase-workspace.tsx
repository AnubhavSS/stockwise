"use client";

/**
 * Purchase module: filters, summary, chart, and PO table from the purchase store.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { CancelPurchaseDialog } from "@/components/purchase/cancel-purchase-dialog";
import { CreatePurchaseSheet } from "@/components/purchase/create-purchase-sheet";
import { PurchaseChart } from "@/components/purchase/purchase-chart";
import { PurchasePageHeader } from "@/components/purchase/purchase-page-header";
import { PurchaseSummaryCards } from "@/components/purchase/purchase-summary-cards";
import { PurchaseTable } from "@/components/purchase/purchase-table";
import { PurchaseTabs } from "@/components/purchase/purchase-tabs";
import { PurchaseToolbar } from "@/components/purchase/purchase-toolbar";
import { ReceiveItemsDialog } from "@/components/purchase/receive-items-dialog";
import { LoadingState } from "@/components/shared/loading-state";
import { exportPurchasesCsv } from "@/features/purchase/export";
import type { PurchasePeriod } from "@/features/purchase/periods";
import {
  DEFAULT_PURCHASE_FILTERS,
  derivePurchaseSeries,
  derivePurchaseSummary,
  filterPurchases,
  hasActivePurchaseFilters,
  paginateItems,
  tabCounts,
  type PurchaseFilters,
} from "@/features/purchase/selectors";
import { useCreateQuery } from "@/hooks/use-create-query";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { usePurchaseStore } from "@/store/purchase-store";
import type { Purchase } from "@/types/purchase";

export function PurchaseWorkspace() {
  const mounted = useHasMounted();
  const [createOpen, setCreateOpen] = useCreateQuery("/purchase");
  const purchases = usePurchaseStore((state) => state.purchases);
  const suppliers = usePurchaseStore((state) => state.suppliers);
  const [filters, setFilters] = useState<PurchaseFilters>(DEFAULT_PURCHASE_FILTERS);
  const [period, setPeriod] = useState<PurchasePeriod>("30d");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [receivePurchase, setReceivePurchase] = useState<Purchase | null>(null);
  const [cancelPurchase, setCancelPurchase] = useState<Purchase | null>(null);

  const summary = useMemo(
    () => derivePurchaseSummary(purchases, period),
    [period, purchases],
  );
  const series = useMemo(
    () => derivePurchaseSeries(purchases, period),
    [period, purchases],
  );
  const counts = useMemo(() => tabCounts(purchases), [purchases]);
  const filtered = useMemo(
    () => filterPurchases(purchases, suppliers, filters),
    [filters, purchases, suppliers],
  );
  const paged = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  function updateFilters(next: PurchaseFilters) {
    setFilters(next);
    setPage(1);
  }

  if (!mounted) {
    return <LoadingState label="Loading purchases…" />;
  }

  return (
    <div className="space-y-6">
      {/* Title, CSV export, create purchase order */}
      <PurchasePageHeader
        onExport={() => {
          exportPurchasesCsv(filtered, suppliers);
          toast.success("Purchases exported.");
        }}
        onCreate={() => setCreateOpen(true)}
      />
      {/* Order value, received vs pending, outstanding supplier payments */}
      <PurchaseSummaryCards summary={summary} />
      {/* Counted PO value over the selected period */}
      <PurchaseChart data={series} period={period} onPeriodChange={setPeriod} />
      {/* Status tabs, filters, and the purchase-order table */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
        <div className="space-y-4 p-4">
          <PurchaseTabs
            value={filters.tab}
            counts={counts}
            onValueChange={(tab) => updateFilters({ ...filters, tab })}
          />
          <PurchaseToolbar
            filters={filters}
            suppliers={suppliers}
            hasActiveFilters={hasActivePurchaseFilters(filters)}
            onFiltersChange={updateFilters}
            onClear={() => updateFilters(DEFAULT_PURCHASE_FILTERS)}
          />
        </div>
        <PurchaseTable
          purchases={paged.items}
          suppliers={suppliers}
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
          onEdit={setEditPurchase}
          onReceive={setReceivePurchase}
          onCancel={setCancelPurchase}
        />
      </section>

      {/* Create/edit, receive goods, and cancel — receive is the only stock-in path */}
      <CreatePurchaseSheet
        open={createOpen || Boolean(editPurchase)}
        purchase={editPurchase}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditPurchase(null);
          }
        }}
      />
      <ReceiveItemsDialog
        purchase={receivePurchase}
        open={Boolean(receivePurchase)}
        onOpenChange={(open) => {
          if (!open) {
            setReceivePurchase(null);
          }
        }}
      />
      <CancelPurchaseDialog
        purchase={cancelPurchase}
        open={Boolean(cancelPurchase)}
        onOpenChange={(open) => {
          if (!open) {
            setCancelPurchase(null);
          }
        }}
      />
    </div>
  );
}
