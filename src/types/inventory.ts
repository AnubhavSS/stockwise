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
