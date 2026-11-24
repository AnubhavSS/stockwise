/** Seed purchase orders and receipts used until the operator creates their own. */
import { calculatePurchaseTotals } from "@/features/purchase/calculations";
import type { Purchase, PurchaseStatus } from "@/types/purchase";
import type { PaymentMethod, PaymentStatus } from "@/types/sales";

const SUPPLIERS = [
  "supp-001",
  "supp-002",
  "supp-003",
  "supp-004",
  "supp-005",
  "supp-006",
];
const PRODUCTS: Array<{ id: string; unitCost: number }> = [
  { id: "prod-001", unitCost: 520 },
  { id: "prod-002", unitCost: 180 },
  { id: "prod-005", unitCost: 3100 },
  { id: "prod-007", unitCost: 780 },
  { id: "prod-008", unitCost: 4300 },
  { id: "prod-011", unitCost: 310 },
  { id: "prod-013", unitCost: 140 },
  { id: "prod-025", unitCost: 1550 },
];
const METHODS: PaymentMethod[] = ["bank_transfer", "upi", "cash", "card"];

function dateOffset(days: number, hour: number): string {
  const date = new Date(Date.UTC(2026, 10, 23, hour, 0, 0));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function amountForDay(daysAgo: number): number {
  const previousPeriod = daysAgo >= 30 && daysAgo < 60;
  const base = previousPeriod ? 9800 : 10600;
  const wave = Math.round(Math.sin(daysAgo / 4.2) * 2200);
  const step = ((daysAgo * 13) % 7) * 280;
  return Math.max(4200, base + wave + step);
}

function buildPurchase(daysAgo: number, index: number): Purchase {
  const product = PRODUCTS[index % PRODUCTS.length] ?? PRODUCTS[0];
  const totalAmount = amountForDay(daysAgo);
  const quantity = Math.max(1, Math.round(totalAmount / product.unitCost));
  const cancelled = daysAgo === 5;
  const draft = daysAgo === 3;
  const ordered = daysAgo === 0 || daysAgo === 1;
  const partial = daysAgo === 2;

  let status: PurchaseStatus = "received";
  let receivedQuantity = quantity;
  let paymentStatus: PaymentStatus = "paid";
  let receivedDate: string | null = dateOffset(-daysAgo, 11);

  if (cancelled) {
    status = "cancelled";
    receivedQuantity = 0;
    paymentStatus = "unpaid";
    receivedDate = null;
  } else if (draft) {
    status = "draft";
    receivedQuantity = 0;
    paymentStatus = "unpaid";
    receivedDate = null;
  } else if (ordered) {
    status = "ordered";
    receivedQuantity = 0;
    paymentStatus = daysAgo === 1 ? "partial" : "unpaid";
    receivedDate = null;
  } else if (partial) {
    status = "partially_received";
    receivedQuantity = Math.max(1, Math.floor(quantity / 2));
    paymentStatus = "partial";
    receivedDate = null;
  }

  const items = [
    {
      productId: product.id,
      quantity,
      unitCost: product.unitCost,
      discount: 0,
      lineTotal: quantity * product.unitCost,
      receivedQuantity,
    },
  ];
  const totals = calculatePurchaseTotals({
    items,
    taxRate: 0,
    paymentStatus,
    amountPaid:
      paymentStatus === "partial"
        ? Math.round((items[0]?.lineTotal ?? 0) * 0.45)
        : 0,
  });
  const date = dateOffset(-daysAgo, 9);

  return {
    id: `po-${String(index + 1).padStart(3, "0")}`,
    purchaseOrderNumber: `PUR-${1089 - index}`,
    supplierId: SUPPLIERS[index % SUPPLIERS.length] ?? "supp-001",
    items,
    ...totals,
    taxRate: 0,
    paymentMethod: METHODS[index % METHODS.length] ?? "bank_transfer",
    status,
    date,
    expectedDate: dateOffset(-daysAgo + 3, 0),
    receivedDate,
    notes: cancelled ? "Supplier could not fulfil this order." : "",
    createdAt: date,
    receipts:
      receivedQuantity > 0
        ? [
            {
              id: `rcpt-${index + 1}`,
              createdAt: receivedDate ?? date,
              items: [{ productId: product.id, quantity: receivedQuantity }],
            },
          ]
        : [],
  };
}

export const mockPurchases: Purchase[] = Array.from({ length: 90 }, (_, daysAgo) =>
  buildPurchase(daysAgo, daysAgo),
);
