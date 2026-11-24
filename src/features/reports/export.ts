import { orderedQuantity, receivedQuantity } from "@/features/purchase/calculations";
import { supplierName } from "@/features/purchase/selectors";
import { paymentStatusLabel, purchaseStatusLabel } from "@/features/purchase/status";
import { productUnitCost } from "@/features/reports/calculations";
import { formatRangeLabel, type AnalyticsRange } from "@/features/reports/range";
import { movementKind, movementKindLabel } from "@/features/reports/selectors";
import type { ReportTab } from "@/features/reports/types";
import { customerName } from "@/features/sales/selectors";
import { paymentStatusLabel as salePaymentLabel, saleStatusLabel } from "@/features/sales/status";
import { getStockStatus, getStockStatusLabel } from "@/features/stock/status";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/calculations";
import type { Customer } from "@/types/customer";
import type { Product, StockMovement } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sales";
import type { Supplier } from "@/types/supplier";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function tabTitle(tab: ReportTab): string {
  if (tab === "overview") {
    return "Overview";
  }
  if (tab === "sales") {
    return "Sales Report";
  }
  if (tab === "purchases") {
    return "Purchase Report";
  }
  if (tab === "stock") {
    return "Stock Report";
  }
  return "Stock Movement Report";
}

function heading(tab: ReportTab, range: AnalyticsRange): string[][] {
  return [
    ["Stockwise Reports"],
    [tabTitle(tab)],
    ["Period", formatRangeLabel(range)],
    [],
  ];
}

export function exportReportCsv(input: {
  tab: ReportTab;
  range: AnalyticsRange;
  sales: Sale[];
  purchases: Purchase[];
  products: Product[];
  movements: StockMovement[];
  customers: Customer[];
  suppliers: Supplier[];
}) {
  const intro = heading(input.tab, input.range);

  if (input.tab === "sales") {
    downloadCsv("stockwise-sales-report.csv", [
      ...intro,
      [
        "Sale ID",
        "Customer",
        "Date",
        "Items",
        "Total",
        "Paid",
        "Balance",
        "Payment Status",
        "Sale Status",
      ],
      ...input.sales.map((sale) => [
        sale.invoiceNumber,
        customerName(input.customers, sale.customerId),
        formatDate(sale.date),
        formatNumber(sale.items.reduce((sum, item) => sum + item.quantity, 0)),
        formatCurrency(sale.totalAmount),
        formatCurrency(sale.amountPaid),
        formatCurrency(sale.remainingBalance),
        salePaymentLabel[sale.paymentStatus],
        saleStatusLabel[sale.status],
      ]),
    ]);
    return;
  }

  if (input.tab === "purchases") {
    downloadCsv("stockwise-purchase-report.csv", [
      ...intro,
      [
        "Purchase ID",
        "Supplier",
        "Order Date",
        "Expected Date",
        "Total",
        "Received",
        "Pending",
        "Payment Status",
        "Status",
      ],
      ...input.purchases.map((purchase) => [
        purchase.purchaseOrderNumber,
        supplierName(input.suppliers, purchase.supplierId),
        formatDate(purchase.date),
        formatDate(purchase.expectedDate),
        formatCurrency(purchase.totalAmount),
        formatNumber(receivedQuantity(purchase)),
        formatNumber(Math.max(0, orderedQuantity(purchase) - receivedQuantity(purchase))),
        paymentStatusLabel[purchase.paymentStatus],
        purchaseStatusLabel[purchase.status],
      ]),
    ]);
    return;
  }

  if (input.tab === "stock") {
    downloadCsv("stockwise-stock-report.csv", [
      ...intro,
      [
        "Product",
        "SKU",
        "Category",
        "Quantity",
        "Minimum",
        "Unit Cost",
        "Inventory Value",
        "Status",
      ],
      ...input.products.map((product) => {
        const cost = productUnitCost(product).cost;
        return [
          product.name,
          product.sku,
          product.category,
          formatNumber(product.quantity),
          formatNumber(product.minimumStockLevel),
          formatCurrency(cost),
          formatCurrency(product.quantity * cost),
          getStockStatusLabel(getStockStatus(product)),
        ];
      }),
    ]);
    return;
  }

  if (input.tab === "movements") {
    downloadCsv("stockwise-stock-movements.csv", [
      ...intro,
      ["Date", "Movement ID", "Product", "SKU", "Type", "Quantity", "Reference", "Description"],
      ...input.movements.map((movement) => {
        const product = input.products.find((entry) => entry.id === movement.productId);
        return [
          formatDateTime(movement.createdAt),
          movement.id,
          product?.name ?? "Product",
          product?.sku ?? "—",
          movementKindLabel[movementKind(movement)],
          String(movement.quantityChange),
          movement.referenceId,
          movement.remarks,
        ];
      }),
    ]);
    return;
  }

  downloadCsv("stockwise-overview-report.csv", [
    ...intro,
    ["Metric", "Value"],
    [
      "Completed sales",
      String(input.sales.filter((sale) => sale.status === "completed").length),
    ],
    [
      "Sales revenue",
      formatCurrency(
        input.sales
          .filter((sale) => sale.status === "completed")
          .reduce((sum, sale) => sum + sale.totalAmount, 0),
      ),
    ],
    [
      "Purchase orders",
      String(
        input.purchases.filter(
          (purchase) => purchase.status !== "draft" && purchase.status !== "cancelled",
        ).length,
      ),
    ],
    [
      "Purchase value",
      formatCurrency(
        input.purchases
          .filter((purchase) => purchase.status !== "draft" && purchase.status !== "cancelled")
          .reduce((sum, purchase) => sum + purchase.totalAmount, 0),
      ),
    ],
  ]);
}
