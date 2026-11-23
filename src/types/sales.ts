export type SaleStatus = "draft" | "confirmed" | "fulfilled" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export type SaleItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Sale = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  items: SaleItem[];
  totalAmount: number;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  date: string;
};
