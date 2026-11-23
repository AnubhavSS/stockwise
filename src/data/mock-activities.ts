import type { Activity } from "@/types/common";
import type { StockMovement } from "@/types/inventory";

const REFERENCE_NOW = Date.parse("2026-11-23T12:35:00.000Z");

function minutesAgo(minutes: number): string {
  return new Date(REFERENCE_NOW - minutes * 60 * 1000).toISOString();
}

export const mockStockMovements: StockMovement[] = [
  {
    id: "mov-001",
    productId: "prod-001",
    type: "adjustment",
    quantityChange: 50,
    referenceId: "adj-050",
    createdAt: minutesAgo(32),
    remarks: "Opening replenishment for Wireless Mouse",
  },
  {
    id: "mov-002",
    productId: "prod-002",
    type: "purchase",
    quantityChange: 80,
    referenceId: "po-004",
    createdAt: minutesAgo(18 * 60),
    remarks: "Goods received against PO-2026-089",
  },
  {
    id: "mov-003",
    productId: "prod-005",
    type: "sale",
    quantityChange: -6,
    referenceId: "sale-002",
    createdAt: minutesAgo(65),
    remarks: "Issued against INV-2026-1033",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "act-001",
    type: "sale_created",
    title: "Sale #S-1034 created",
    description: "Invoice raised for Apex Retail",
    referenceId: "sale-001",
    amount: 12500,
    createdAt: minutesAgo(2),
  },
  {
    id: "act-002",
    type: "purchase_received",
    title: "Purchase #P-089 received",
    description: "Stock received from Tech Distributors",
    referenceId: "po-001",
    amount: 45000,
    createdAt: minutesAgo(18),
  },
  {
    id: "act-003",
    type: "stock_adjusted",
    title: "Stock updated: Wireless Mouse",
    description: "Manual replenishment recorded",
    referenceId: "adj-050",
    quantityChange: 50,
    createdAt: minutesAgo(32),
  },
  {
    id: "act-004",
    type: "sale_paid",
    title: "Sale #S-1033 completed",
    description: "Payment collected from Bright Electronics",
    referenceId: "sale-002",
    amount: 28900,
    createdAt: minutesAgo(60),
  },
  {
    id: "act-005",
    type: "purchase_created",
    title: "Purchase #P-094 ordered",
    description: "Order sent to Prime Electronics",
    referenceId: "po-002",
    amount: 78400,
    createdAt: minutesAgo(210),
  },
  {
    id: "act-006",
    type: "stock_adjusted",
    title: "Stock updated: HDMI Cable",
    description: "Damaged units written off after QC",
    referenceId: "adj-001",
    quantityChange: -3,
    createdAt: minutesAgo(420),
  },
];
