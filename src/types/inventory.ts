export type ProductCategory =
  | "Accessories"
  | "Cables"
  | "Peripherals"
  | "Displays"
  | "Storage";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  quantity: number;
  minimumStockLevel: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
};

export type StockMovementType = "purchase" | "sale" | "adjustment";

export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantityChange: number;
  referenceId: string;
  createdAt: string;
  remarks: string;
};
