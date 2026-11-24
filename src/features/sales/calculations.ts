/**
 * Invoice math: line totals, GST, and payment remaining.
 * Choosing Paid forces amountPaid = total; Unpaid forces 0.
 */
import { calculateLineTotal } from "@/lib/calculations";
import type { PaymentStatus, Sale, SaleItem } from "@/types/sales";

export const GST_RATE = 0.18;

export function calculateSaleLineTotal(
  quantity: number,
  unitPrice: number,
  discount: number,
): number {
  return Math.max(0, calculateLineTotal(quantity, unitPrice) - discount);
}

export function calculateSaleTotals(input: {
  items: Array<Pick<SaleItem, "quantity" | "unitPrice" | "discount">>;
  taxRate: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
}): {
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
} {
  const subtotal = input.items.reduce(
    (sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice),
    0,
  );
  const discount = input.items.reduce((sum, item) => sum + item.discount, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * input.taxRate);
  const totalAmount = taxable + tax;

  let amountPaid = input.amountPaid;
  let paymentStatus = input.paymentStatus;

  if (paymentStatus === "unpaid") {
    amountPaid = 0;
  } else if (paymentStatus === "paid") {
    amountPaid = totalAmount;
  } else {
    amountPaid = Math.min(Math.max(0, amountPaid), totalAmount);
    if (amountPaid <= 0) {
      paymentStatus = "unpaid";
      amountPaid = 0;
    } else if (amountPaid >= totalAmount) {
      paymentStatus = "paid";
      amountPaid = totalAmount;
    }
  }

  return {
    subtotal,
    discount,
    tax,
    totalAmount,
    amountPaid,
    remainingBalance: Math.max(0, totalAmount - amountPaid),
    paymentStatus,
  };
}

export function itemCount(sale: Pick<Sale, "items">): number {
  return sale.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function isPendingPayment(sale: Pick<Sale, "status" | "paymentStatus">): boolean {
  return sale.status === "completed" && sale.paymentStatus !== "paid";
}

export function canCancelSale(sale: Pick<Sale, "status">): boolean {
  return sale.status === "completed";
}

export function canEditSale(sale: Pick<Sale, "status">): boolean {
  return sale.status === "draft";
}
