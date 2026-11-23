import type { StockMovementType } from "@/types/inventory";

export function getMovementTypeLabel(type: StockMovementType): string {
  if (type === "purchase") {
    return "Purchase";
  }
  if (type === "sale") {
    return "Sale";
  }
  return "Adjustment";
}

export function formatQuantityChange(change: number): string {
  if (change > 0) {
    return `+${change}`;
  }
  return String(change);
}
