/** Seed invoices clustered around APP_NOW so dashboard and reports look populated. */
import { calculateSaleTotals } from "@/features/sales/calculations";
import type { PaymentMethod, Sale } from "@/types/sales";

const PRODUCT_PRICES: Record<string, number> = {
  "prod-001": 799,
  "prod-002": 349,
  "prod-003": 1899,
  "prod-004": 499,
  "prod-005": 4599,
  "prod-006": 12499,
  "prod-007": 1299,
  "prod-008": 6799,
  "prod-015": 18999,
  "prod-025": 2499,
};

const CUSTOMERS = [
  "cust-001",
  "cust-006",
  "cust-002",
  "cust-007",
  "cust-003",
  "cust-008",
  "cust-004",
  "cust-009",
  "cust-005",
  "cust-010",
];
const PRODUCT_IDS = Object.keys(PRODUCT_PRICES);
const METHODS: PaymentMethod[] = ["upi", "cash", "card", "bank_transfer"];

function dateDaysAgo(daysAgo: number, hour: number, minute: number): string {
  const date = new Date(Date.UTC(2026, 10, 23, hour, minute, 0));
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

function dailyAmount(daysAgo: number): number {
  const previousPeriod = daysAgo >= 30 && daysAgo < 60;
  const base = previousPeriod ? 13500 : 15200;
  const wave = Math.round(Math.sin(daysAgo / 3.4) * 3800);
  const step = ((daysAgo * 17) % 11) * 350;
  return Math.max(6200, base + wave + step);
}

function buildSale(daysAgo: number, index: number): Sale {
  const productId = PRODUCT_IDS[index % PRODUCT_IDS.length] ?? "prod-001";
  const unitPrice = PRODUCT_PRICES[productId] ?? 799;
  const totalAmount = dailyAmount(daysAgo);
  const quantity = Math.max(1, Math.round(totalAmount / unitPrice));
  const items = [
    {
      productId,
      quantity,
      unitPrice,
      discount: 0,
      lineTotal: quantity * unitPrice,
    },
  ];
  const cancelled = daysAgo === 6;
  const paymentStatus =
    cancelled || daysAgo === 0 ? "unpaid" : daysAgo === 1 ? "partial" : "paid";
  const totals = calculateSaleTotals({
    items,
    taxRate: 0,
    paymentStatus,
    amountPaid:
      paymentStatus === "partial"
        ? Math.round((items[0]?.lineTotal ?? 0) * 0.4)
        : 0,
  });
  const date = dateDaysAgo(daysAgo, 9 + (index % 6), 10 + (index % 40));

  return {
    id: `sale-${String(index + 1).padStart(3, "0")}`,
    invoiceNumber: `SALE-${1034 - index}`,
    customerId: CUSTOMERS[index % CUSTOMERS.length] ?? "cust-001",
    items,
    ...totals,
    taxRate: 0,
    paymentMethod: METHODS[index % METHODS.length] ?? "upi",
    status: cancelled ? "cancelled" : "completed",
    date,
    notes: cancelled ? "Customer requested cancellation before dispatch." : "",
    createdAt: date,
    inventoryApplied: false,
  };
}

export const mockSales: Sale[] = Array.from({ length: 90 }, (_, daysAgo) =>
  buildSale(daysAgo, daysAgo),
);
