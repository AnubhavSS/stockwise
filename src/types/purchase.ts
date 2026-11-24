/**
 * Purchase orders and receipts.
 *
 * Creating a PO does not add stock. Stock increases only when goods are
 * received (`receivedQuantity` and `receipts`). Cancelled/draft orders are
 * excluded from spend totals.
 */
import type { PaymentMethod, PaymentStatus } from "@/types/sales";

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
  discount: number;
  lineTotal: number;
  receivedQuantity: number;
};

export type PurchaseReceiptLine = {
  productId: string;
  quantity: number;
};

export type PurchaseReceipt = {
  id: string;
  createdAt: string;
  items: PurchaseReceiptLine[];
};

export type Purchase = {
  id: string;
  purchaseOrderNumber: string;
  supplierId: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: PurchaseStatus;
  date: string;
  expectedDate: string;
  receivedDate: string | null;
  notes: string;
  createdAt: string;
  receipts: PurchaseReceipt[];
};

export type PurchaseDraftInput = {
  supplierId: string;
  items: Array<Omit<PurchaseItem, "receivedQuantity" | "lineTotal"> & {
    receivedQuantity?: number;
    lineTotal?: number;
  }>;
  taxRate: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  date: string;
  expectedDate: string;
  notes: string;
};
