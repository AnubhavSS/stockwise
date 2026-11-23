import type { Purchase } from "@/types/purchase";

const SUPPLIERS = ["supp-001", "supp-002", "supp-003", "supp-004"];
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

function dateDaysAgo(daysAgo: number, hour: number): string {
  const date = new Date(Date.UTC(2026, 10, 23, hour, 0, 0));
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString();
}

function amountForDay(daysAgo: number): number {
  const previousPeriod = daysAgo >= 30 && daysAgo < 60;
  const base = previousPeriod ? 9800 : 10600;
  const wave = Math.round(Math.sin(daysAgo / 4.2) * 2200);
  const step = (daysAgo * 13) % 7 * 280;
  return Math.max(4200, base + wave + step);
}

export const mockPurchases: Purchase[] = Array.from({ length: 90 }, (_, index) => {
  const daysAgo = index;
  const product = PRODUCTS[index % PRODUCTS.length] ?? PRODUCTS[0];
  const totalAmount = amountForDay(daysAgo);
  const quantity = Math.max(1, Math.round(totalAmount / product.unitCost));
  const lineTotal = quantity * product.unitCost;
  const recent = daysAgo <= 4;

  return {
    id: `po-${String(index + 1).padStart(3, "0")}`,
    purchaseOrderNumber: `PO-2026-${89 + index}`,
    supplierId: SUPPLIERS[index % SUPPLIERS.length] ?? "supp-001",
    items: [
      {
        productId: product.id,
        quantity,
        unitCost: product.unitCost,
        lineTotal,
        receivedQuantity: recent && index === 2 ? Math.floor(quantity / 2) : quantity,
      },
    ],
    totalAmount: lineTotal,
    status: recent && index === 2 ? "partially_received" : "received",
    expectedDate: dateDaysAgo(Math.max(0, daysAgo - 1), 0),
    receivedDate: dateDaysAgo(daysAgo, 11),
  };
});
