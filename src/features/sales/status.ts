import type { StatusTone } from "@/types/common";
import type { PaymentStatus, SaleStatus } from "@/types/sales";

export const saleStatusLabel: Record<SaleStatus, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
};

export const saleStatusTone: Record<SaleStatus, StatusTone> = {
  draft: "neutral",
  confirmed: "warning",
  fulfilled: "success",
  cancelled: "danger",
};

export const paymentStatusTone: Record<PaymentStatus, StatusTone> = {
  unpaid: "danger",
  partial: "warning",
  paid: "success",
};
