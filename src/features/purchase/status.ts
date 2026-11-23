import type { StatusTone } from "@/types/common";
import type { PurchaseStatus } from "@/types/purchase";

export const purchaseStatusLabel: Record<PurchaseStatus, string> = {
  draft: "Draft",
  ordered: "Ordered",
  partially_received: "Partially received",
  received: "Received",
  cancelled: "Cancelled",
};

export const purchaseStatusTone: Record<PurchaseStatus, StatusTone> = {
  draft: "neutral",
  ordered: "info",
  partially_received: "warning",
  received: "success",
  cancelled: "danger",
};
