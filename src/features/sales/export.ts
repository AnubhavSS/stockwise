import { customerName } from "@/features/sales/selectors";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  saleStatusLabel,
} from "@/features/sales/status";
import { formatCurrency, formatDate } from "@/lib/calculations";
import type { Customer } from "@/types/customer";
import type { Sale } from "@/types/sales";

export function exportSalesCsv(sales: Sale[], customers: Customer[]) {
  const header = [
    "Sale ID",
    "Customer",
    "Date",
    "Items",
    "Total",
    "Amount Paid",
    "Balance",
    "Payment Method",
    "Payment Status",
    "Sale Status",
  ];

  const rows = sales.map((sale) => [
    sale.invoiceNumber,
    customerName(customers, sale.customerId),
    formatDate(sale.date),
    String(sale.items.reduce((sum, item) => sum + item.quantity, 0)),
    formatCurrency(sale.totalAmount),
    formatCurrency(sale.amountPaid),
    formatCurrency(sale.remainingBalance),
    paymentMethodLabel[sale.paymentMethod],
    paymentStatusLabel[sale.paymentStatus],
    saleStatusLabel[sale.status],
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stockwise-sales.csv";
  link.click();
  URL.revokeObjectURL(url);
}
