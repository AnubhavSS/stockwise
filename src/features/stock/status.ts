import type { Product, StockStatus } from "@/types/inventory";
import type { StatusTone } from "@/types/common";

export function getStockStatus(product: Pick<Product, "quantity" | "minimumStockLevel">): StockStatus {
  if (product.quantity === 0) {
    return "out_of_stock";
  }

  if (product.quantity <= product.minimumStockLevel) {
    return "low_stock";
  }

  return "in_stock";
}

export function getStockStatusLabel(status: StockStatus): string {
  if (status === "in_stock") {
    return "In Stock";
  }
  if (status === "low_stock") {
    return "Low Stock";
  }
  return "Out of Stock";
}

export function getStockStatusTone(status: StockStatus): StatusTone {
  if (status === "in_stock") {
    return "success";
  }
  if (status === "low_stock") {
    return "warning";
  }
  return "danger";
}

export function matchesStockStatus(
  product: Pick<Product, "quantity" | "minimumStockLevel">,
  status: StockStatus | "all",
): boolean {
  if (status === "all") {
    return true;
  }
  return getStockStatus(product) === status;
}
