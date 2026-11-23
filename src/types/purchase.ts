export type PurchaseStatus =
  | "draft"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export type PurchaseItem = {
  productId: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  receivedQuantity: number;
};

export type Purchase = {
  id: string;
  purchaseOrderNumber: string;
  supplierId: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: PurchaseStatus;
  expectedDate: string;
  receivedDate: string | null;
};
