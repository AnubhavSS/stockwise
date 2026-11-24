/**
 * Sales documents.
 *
 * Only `completed` sales count as revenue and deduct stock.
 * Drafts can be edited; cancelled sales restore inventory if it was applied.
 * `inventoryApplied` prevents double-deducting when completing a sale twice.
 */
export type SaleStatus = "draft" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type PaymentMethod = "cash" | "upi" | "card" | "bank_transfer";

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
};

export type Sale = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  date: string;
  notes: string;
  createdAt: string;
  inventoryApplied: boolean;
};

export type SaleDraftInput = {
  customerId: string;
  items: SaleItem[];
  taxRate: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  date: string;
  notes: string;
};

export const WALK_IN_CUSTOMER_ID = "cust-walk-in";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "upi",
  "card",
  "bank_transfer",
];
