import { supplierName } from "@/features/purchase/selectors";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  purchaseStatusLabel,
} from "@/features/purchase/status";
import { formatCurrency, formatDate } from "@/lib/calculations";
import type { Purchase } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

export function exportPurchasesCsv(purchases: Purchase[], suppliers: Supplier[]) {
  const header = [
    "Purchase ID",
    "Supplier",
    "Order Date",
    "Expected Date",
    "Items",
    "Total",
    "Amount Paid",
    "Balance",
    "Payment Method",
    "Payment Status",
    "Status",
  ];

  const rows = purchases.map((purchase) => [
    purchase.purchaseOrderNumber,
    supplierName(suppliers, purchase.supplierId),
    formatDate(purchase.date),
    formatDate(purchase.expectedDate),
    String(purchase.items.reduce((sum, item) => sum + item.quantity, 0)),
    formatCurrency(purchase.totalAmount),
    formatCurrency(purchase.amountPaid),
    formatCurrency(purchase.remainingBalance),
    paymentMethodLabel[purchase.paymentMethod],
    paymentStatusLabel[purchase.paymentStatus],
    purchaseStatusLabel[purchase.status],
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stockwise-purchases.csv";
  link.click();
  URL.revokeObjectURL(url);
}
