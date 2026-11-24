/**
 * Catalogue and stock-ledger types.
 *
 * `quantity` is current on-hand units. `minimumStockLevel` is the reorder
 * point used for In Stock / Low Stock / Out of Stock.
 * `costPrice` is optional; reports fall back to an estimated cost when missing.
 */
export const PRODUCT_CATEGORIES = [
  "Accessories",
  "Cables",
  "Peripherals",
  "Displays",
  "Storage",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description: string;
  quantity: number;
  minimumStockLevel: number;
  unitPrice: number;
  costPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StockMovementType = "purchase" | "sale" | "adjustment";

export type StockAdjustmentType = "add" | "remove" | "set";

/** One inventory change. Positive quantityChange adds stock; negative removes it. */
export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantityChange: number;
  referenceId: string;
  createdAt: string;
  remarks: string;
};

export type ProductDraft = {
  name: string;
  sku: string;
  category: ProductCategory;
  description: string;
  unitPrice: number;
  costPrice?: number;
  minimumStockLevel: number;
};

export type NewProductInput = ProductDraft & {
  quantity: number;
};
