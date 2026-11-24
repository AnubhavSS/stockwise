"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useHasMounted } from "@/hooks/use-has-mounted";
import { usePurchaseStore } from "@/store/purchase-store";
import type { Purchase } from "@/types/purchase";

export function PurchaseWorkspace() {
  const mounted = useHasMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchases = usePurchaseStore((state) => state.purchases);
  const suppliers = usePurchaseStore((state) => state.suppliers);
  const [filters, setFilters] = useState<PurchaseFilters>(DEFAULT_PURCHASE_FILTERS);
  const [period, setPeriod] = useState<PurchasePeriod>("30d");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(searchParams.get("create") === "1");
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
    return <LoadingState rows={8} />;
  }

  return (
    <div className="space-y-6">
      <PurchasePageHeader
        onExport={() => {
          exportPurchasesCsv(filtered, suppliers);
          toast.success("Purchases exported.");
        }}
        onCreate={() => setCreateOpen(true)}
      />
      <PurchaseSummaryCards summary={summary} />
      <PurchaseChart data={series} period={period} onPeriodChange={setPeriod} />
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

      <CreatePurchaseSheet
        open={createOpen || Boolean(editPurchase)}
        purchase={editPurchase}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditPurchase(null);
            if (searchParams.get("create") === "1") {
              router.replace("/purchase");
            }
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
