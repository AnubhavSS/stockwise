import type { StatusTone } from "@/types/common";
import type { PaymentMethod, PaymentStatus, SaleStatus } from "@/types/sales";

export const saleStatusLabel: Record<SaleStatus, string> = {
  draft: "Draft",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank Transfer",
};

export const saleStatusTone: Record<SaleStatus, StatusTone> = {
  draft: "neutral",
  completed: "success",
  cancelled: "danger",
};

export const paymentStatusTone: Record<PaymentStatus, StatusTone> = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
};
