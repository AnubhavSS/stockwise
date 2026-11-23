import type { Sale } from "@/types/sales";

export const mockSales: Sale[] = [
  {
    id: "sale-001",
    invoiceNumber: "INV-2026-0142",
    customerId: "cust-001",
    items: [
      {
        productId: "prod-001",
        quantity: 20,
        unitPrice: 799,
        lineTotal: 15980,
      },
      {
        productId: "prod-002",
        quantity: 15,
        unitPrice: 349,
        lineTotal: 5235,
      },
    ],
    totalAmount: 21215,
    status: "fulfilled",
    paymentStatus: "paid",
    date: "2026-11-04T10:15:00.000Z",
  },
  {
    id: "sale-002",
    invoiceNumber: "INV-2026-0148",
    customerId: "cust-002",
    items: [
      {
        productId: "prod-004",
        quantity: 6,
        unitPrice: 4599,
        lineTotal: 27594,
      },
      {
        productId: "prod-003",
        quantity: 4,
        unitPrice: 1899,
        lineTotal: 7596,
      },
    ],
    totalAmount: 35190,
    status: "fulfilled",
    paymentStatus: "paid",
    date: "2026-11-08T12:40:00.000Z",
  },
  {
    id: "sale-003",
    invoiceNumber: "INV-2026-0155",
    customerId: "cust-003",
    items: [
      {
        productId: "prod-005",
        quantity: 3,
        unitPrice: 12499,
        lineTotal: 37497,
      },
    ],
    totalAmount: 37497,
    status: "confirmed",
    paymentStatus: "unpaid",
    date: "2026-11-14T09:05:00.000Z",
  },
  {
    id: "sale-004",
    invoiceNumber: "INV-2026-0161",
    customerId: "cust-001",
    items: [
      {
        productId: "prod-007",
        quantity: 8,
        unitPrice: 1299,
        lineTotal: 10392,
      },
      {
        productId: "prod-006",
        quantity: 10,
        unitPrice: 499,
        lineTotal: 4990,
      },
    ],
    totalAmount: 15382,
    status: "confirmed",
    paymentStatus: "partial",
    date: "2026-11-18T15:20:00.000Z",
  },
  {
    id: "sale-005",
    invoiceNumber: "INV-2026-0166",
    customerId: "cust-004",
    items: [
      {
        productId: "prod-008",
        quantity: 2,
        unitPrice: 6799,
        lineTotal: 13598,
      },
      {
        productId: "prod-002",
        quantity: 12,
        unitPrice: 349,
        lineTotal: 4188,
      },
    ],
    totalAmount: 17786,
    status: "draft",
    paymentStatus: "unpaid",
    date: "2026-11-21T07:50:00.000Z",
  },
];
