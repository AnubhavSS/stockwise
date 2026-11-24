import {
  calculateSaleLineTotal,
  calculateSaleTotals,
  GST_RATE,
} from "@/features/sales/calculations";
import type { Purchase, PurchaseItem, PurchaseStatus } from "@/types/purchase";

export { GST_RATE };

export function calculatePurchaseLineTotal(
  quantity: number,
  unitCost: number,
  discount: number,
): number {
  return calculateSaleLineTotal(quantity, unitCost, discount);
}

export function calculatePurchaseTotals(input: {
  items: Array<Pick<PurchaseItem, "quantity" | "unitCost" | "discount">>;
  taxRate: number;
  paymentStatus: Purchase["paymentStatus"];
  amountPaid: number;
}) {
  return calculateSaleTotals({
    items: input.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitCost,
      discount: item.discount,
    })),
    taxRate: input.taxRate,
    paymentStatus: input.paymentStatus,
    amountPaid: input.amountPaid,
  });
}

export function orderedQuantity(purchase: Pick<Purchase, "items">): number {
  return purchase.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function receivedQuantity(purchase: Pick<Purchase, "items">): number {
  return purchase.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
}

export function remainingQuantity(item: PurchaseItem): number {
  return Math.max(0, item.quantity - item.receivedQuantity);
}

export function deriveReceiptStatus(items: PurchaseItem[]): Extract<
  PurchaseStatus,
  "ordered" | "partially_received" | "received"
> {
  const ordered = items.reduce((sum, item) => sum + item.quantity, 0);
  const received = items.reduce((sum, item) => sum + item.receivedQuantity, 0);

  if (ordered > 0 && received >= ordered) {
    return "received";
  }
  if (received > 0) {
    return "partially_received";
  }
  return "ordered";
}

export function canReceivePurchase(purchase: Pick<Purchase, "status">): boolean {
  return purchase.status === "ordered" || purchase.status === "partially_received";
}

export function canEditPurchase(
  purchase: Pick<Purchase, "status">,
): boolean {
  return (
    purchase.status === "draft" ||
    purchase.status === "ordered" ||
    purchase.status === "partially_received"
  );
}

export function canCancelPurchase(
  purchase: Pick<Purchase, "status" | "items">,
): boolean {
  if (purchase.status === "cancelled" || purchase.status === "received") {
    return false;
  }
  return purchase.items.every((item) => item.receivedQuantity === 0);
}

export function hasReceivedGoods(purchase: Pick<Purchase, "items">): boolean {
  return purchase.items.some((item) => item.receivedQuantity > 0);
}
