"use client";

/**
 * Reports screen: shared date range, export, tabs, and the active report panel.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { LoadingState } from "@/components/shared/loading-state";
import { MovementReportPanel } from "@/components/reports/movement-report-panel";
import { OverviewReport } from "@/components/reports/overview-report";
import { PurchaseReportPanel } from "@/components/reports/purchase-report-panel";
import { ReportsPageHeader } from "@/components/reports/reports-page-header";
import { ReportsTabs } from "@/components/reports/reports-tabs";
import { SalesReportPanel } from "@/components/reports/sales-report-panel";
import { StockReportPanel } from "@/components/reports/stock-report-panel";
import { exportReportCsv, tabTitle } from "@/features/reports/export";
import { productUnitCost } from "@/features/reports/calculations";
import { defaultAnalyticsRange, type AnalyticsRange } from "@/features/reports/range";
import {
  activitiesInRange,
  deriveMovementSummary,
  deriveOverviewKpis,
  derivePerformanceSeries,
  derivePurchaseReport,
  deriveSalesReport,
  deriveStockReport,
  deriveSupplierRows,
  deriveTopProducts,
  filterReportMovements,
  filterReportPurchases,
  filterReportSales,
  filterReportStock,
} from "@/features/reports/selectors";
import type { MovementKind, ReportTab } from "@/features/reports/types";
import { getCatalogProducts } from "@/features/stock/selectors";
import { paginateItems } from "@/lib/calculations";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import { useSalesStore } from "@/store/sales-store";
import type { ProductCategory, StockStatus } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { PaymentStatus, SaleStatus } from "@/types/sales";

export function ReportsWorkspace() {
  const mounted = useHasMounted();
  const products = useInventoryStore((state) => state.products);
  const movements = useInventoryStore((state) => state.stockMovements);
  const activities = useInventoryStore((state) => state.activities);
  const sales = useSalesStore((state) => state.sales);
  const customers = useSalesStore((state) => state.customers);
  const purchases = usePurchaseStore((state) => state.purchases);
  const suppliers = usePurchaseStore((state) => state.suppliers);

  const [range, setRange] = useState<AnalyticsRange>(defaultAnalyticsRange);
  const [tab, setTab] = useState<ReportTab>("overview");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [saleSearch, setSaleSearch] = useState("");
  const [salePayment, setSalePayment] = useState<PaymentStatus | "all">("all");
  const [saleStatus, setSaleStatus] = useState<SaleStatus | "all">("all");

  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState<Purchase["status"] | "all">("all");
  const [purchasePayment, setPurchasePayment] = useState<PaymentStatus | "all">("all");

  const [stockSearch, setStockSearch] = useState("");
  const [stockCategory, setStockCategory] = useState<ProductCategory | "all">("all");
  const [stockStatus, setStockStatus] = useState<StockStatus | "all">("all");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [stockSort, setStockSort] = useState<"name" | "quantity" | "value">("name");

  const [movementSearch, setMovementSearch] = useState("");
  const [movementKind, setMovementKind] = useState<MovementKind | "all">("all");
  const [movementProduct, setMovementProduct] = useState<string | "all">("all");
  const [movementReference, setMovementReference] = useState("");

  const kpis = useMemo(
    () => deriveOverviewKpis({ products, sales, purchases, range }),
    [products, purchases, range, sales],
  );
  const series = useMemo(
    () => derivePerformanceSeries({ sales, purchases, range }),
    [purchases, range, sales],
  );
  const stockReport = useMemo(() => deriveStockReport(products), [products]);
  const topProducts = useMemo(
    () => deriveTopProducts({ sales, products, range }),
    [products, range, sales],
  );
  const recent = useMemo(() => activitiesInRange(activities, range), [activities, range]);
  const salesSummary = useMemo(
    () => deriveSalesReport({ sales, products, range }),
    [products, range, sales],
  );
  const purchaseSummary = useMemo(
    () => derivePurchaseReport({ purchases, range }),
    [purchases, range],
  );
  const supplierRows = useMemo(
    () => deriveSupplierRows(purchases, suppliers, range),
    [purchases, range, suppliers],
  );
  const movementSummary = useMemo(
    () => deriveMovementSummary(movements, range),
    [movements, range],
  );

  const filteredSales = useMemo(
    () =>
      filterReportSales(sales, customers, range, {
        search: saleSearch,
        paymentStatus: salePayment,
        saleStatus,
      }),
    [customers, range, salePayment, saleSearch, saleStatus, sales],
  );
  const filteredPurchases = useMemo(
    () =>
      filterReportPurchases(purchases, suppliers, range, {
        search: purchaseSearch,
        status: purchaseStatus,
        paymentStatus: purchasePayment,
      }),
    [purchasePayment, purchaseSearch, purchaseStatus, purchases, range, suppliers],
  );
  const filteredStock = useMemo(() => {
    const rows = filterReportStock(products, {
      search: stockSearch,
      category: stockCategory,
      status: stockStatus,
      attentionOnly,
    });
    return [...rows].sort((left, right) => {
      if (stockSort === "quantity") {
        return right.quantity - left.quantity;
      }
      if (stockSort === "value") {
        return (
          right.quantity * productUnitCost(right).cost -
          left.quantity * productUnitCost(left).cost
        );
      }
      return left.name.localeCompare(right.name);
    });
  }, [attentionOnly, products, stockCategory, stockSearch, stockSort, stockStatus]);
  const filteredMovements = useMemo(
    () =>
      filterReportMovements(movements, products, range, {
        search: movementSearch,
        kind: movementKind,
        productId: movementProduct,
        reference: movementReference,
      }),
    [movementKind, movementProduct, movementReference, movementSearch, movements, products, range],
  );

  const pagedSales = useMemo(
    () => paginateItems(filteredSales, page, pageSize),
    [filteredSales, page, pageSize],
  );
  const pagedPurchases = useMemo(
    () => paginateItems(filteredPurchases, page, pageSize),
    [filteredPurchases, page, pageSize],
  );
  const pagedStock = useMemo(
    () => paginateItems(filteredStock, page, pageSize),
    [filteredStock, page, pageSize],
  );
  const pagedMovements = useMemo(
    () => paginateItems(filteredMovements, page, pageSize),
    [filteredMovements, page, pageSize],
  );

  function changeRange(next: AnalyticsRange) {
    setRange(next);
    setPage(1);
  }

  function changeTab(next: ReportTab) {
    setTab(next);
    setPage(1);
  }

  function handleExport() {
    const payload = {
      tab,
      range,
      sales: tab === "sales" ? filteredSales : sales,
      purchases: tab === "purchases" ? filteredPurchases : purchases,
      products: tab === "stock" ? filteredStock : products,
      movements: tab === "movements" ? filteredMovements : movements,
      customers,
      suppliers,
    };
    exportReportCsv(payload);
    toast.success(`${tabTitle(tab)} exported.`);
  }

  if (!mounted) {
    return <LoadingState label="Loading reports…" />;
  }

  return (
    <div className="space-y-6">
      {/* Title, global date range, CSV / print */}
      <ReportsPageHeader
        range={range}
        onRangeChange={changeRange}
        onExportCsv={handleExport}
        onPrint={() => window.print()}
      />
      {/* Switching tabs stays on /reports — only the panel below changes */}
      <ReportsTabs value={tab} onValueChange={changeTab} />

      {tab === "overview" ? (
        <OverviewReport
          kpis={kpis}
          series={series}
          stockSlices={stockReport.slices}
          totalProducts={stockReport.totalProducts}
          topProducts={topProducts}
          activities={recent}
        />
      ) : null}

      {tab === "sales" ? (
        <SalesReportPanel
          summary={salesSummary}
          series={series}
          topProducts={topProducts}
          sales={pagedSales.items}
          customers={customers}
          search={saleSearch}
          paymentStatus={salePayment}
          saleStatus={saleStatus}
          page={pagedSales.page}
          pageSize={pagedSales.pageSize}
          total={pagedSales.total}
          onSearchChange={(value) => {
            setSaleSearch(value);
            setPage(1);
          }}
          onPaymentStatusChange={(value) => {
            setSalePayment(value);
            setPage(1);
          }}
          onSaleStatusChange={(value) => {
            setSaleStatus(value);
            setPage(1);
          }}
          onClear={() => {
            setSaleSearch("");
            setSalePayment("all");
            setSaleStatus("all");
            setPage(1);
          }}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : null}

      {tab === "purchases" ? (
        <PurchaseReportPanel
          summary={purchaseSummary}
          series={series}
          suppliers={suppliers}
          supplierRows={supplierRows}
          purchases={pagedPurchases.items}
          search={purchaseSearch}
          status={purchaseStatus}
          paymentStatus={purchasePayment}
          page={pagedPurchases.page}
          pageSize={pagedPurchases.pageSize}
          total={pagedPurchases.total}
          onSearchChange={(value) => {
            setPurchaseSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setPurchaseStatus(value);
            setPage(1);
          }}
          onPaymentStatusChange={(value) => {
            setPurchasePayment(value);
            setPage(1);
          }}
          onClear={() => {
            setPurchaseSearch("");
            setPurchaseStatus("all");
            setPurchasePayment("all");
            setPage(1);
          }}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : null}

      {tab === "stock" ? (
        <StockReportPanel
          summary={stockReport}
          products={pagedStock.items}
          search={stockSearch}
          category={stockCategory}
          status={stockStatus}
          attentionOnly={attentionOnly}
          sort={stockSort}
          page={pagedStock.page}
          pageSize={pagedStock.pageSize}
          total={pagedStock.total}
          onSearchChange={(value) => {
            setStockSearch(value);
            setPage(1);
          }}
          onCategoryChange={(value) => {
            setStockCategory(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStockStatus(value);
            setPage(1);
          }}
          onAttentionOnlyChange={(value) => {
            setAttentionOnly(value);
            setPage(1);
          }}
          onSortChange={(value) => {
            setStockSort(value);
            setPage(1);
          }}
          onClear={() => {
            setStockSearch("");
            setStockCategory("all");
            setStockStatus("all");
            setAttentionOnly(false);
            setStockSort("name");
            setPage(1);
          }}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : null}

      {tab === "movements" ? (
        <MovementReportPanel
          summary={movementSummary}
          movements={pagedMovements.items}
          products={products}
          catalog={getCatalogProducts(products)}
          search={movementSearch}
          kind={movementKind}
          productId={movementProduct}
          reference={movementReference}
          page={pagedMovements.page}
          pageSize={pagedMovements.pageSize}
          total={pagedMovements.total}
          onSearchChange={(value) => {
            setMovementSearch(value);
            setPage(1);
          }}
          onKindChange={(value) => {
            setMovementKind(value);
            setPage(1);
          }}
          onProductChange={(value) => {
            setMovementProduct(value);
            setPage(1);
          }}
          onReferenceChange={(value) => {
            setMovementReference(value);
            setPage(1);
          }}
          onClear={() => {
            setMovementSearch("");
            setMovementKind("all");
            setMovementProduct("all");
            setMovementReference("");
            setPage(1);
          }}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      ) : null}
    </div>
  );
}
