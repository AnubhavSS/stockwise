import type { Purchase } from "@/types/purchase";

export const mockPurchases: Purchase[] = [
  {
    id: "po-001",
    purchaseOrderNumber: "PO-2026-0088",
    supplierId: "supp-001",
    items: [
      {
        productId: "prod-001",
        quantity: 50,
        unitCost: 520,
        lineTotal: 26000,
        receivedQuantity: 50,
      },
      {
        productId: "prod-002",
        quantity: 120,
        unitCost: 180,
        lineTotal: 21600,
        receivedQuantity: 120,
      },
    ],
    totalAmount: 47600,
    status: "received",
    expectedDate: "2026-10-28T00:00:00.000Z",
    receivedDate: "2026-10-27T11:00:00.000Z",
  },
  {
    id: "po-002",
    purchaseOrderNumber: "PO-2026-0094",
    supplierId: "supp-004",
    items: [
      {
        productId: "prod-005",
        quantity: 12,
        unitCost: 9800,
        lineTotal: 117600,
        receivedQuantity: 12,
      },
      {
        productId: "prod-006",
        quantity: 40,
        unitCost: 240,
        lineTotal: 9600,
        receivedQuantity: 40,
      },
    ],
    totalAmount: 127200,
    status: "received",
    expectedDate: "2026-11-06T00:00:00.000Z",
    receivedDate: "2026-11-05T16:30:00.000Z",
  },
  {
    id: "po-003",
    purchaseOrderNumber: "PO-2026-0101",
    supplierId: "supp-002",
    items: [
      {
        productId: "prod-004",
        quantity: 20,
        unitCost: 3100,
        lineTotal: 62000,
        receivedQuantity: 10,
      },
      {
        productId: "prod-003",
        quantity: 15,
        unitCost: 1250,
        lineTotal: 18750,
        receivedQuantity: 15,
      },
    ],
    totalAmount: 80750,
    status: "partially_received",
    expectedDate: "2026-11-18T00:00:00.000Z",
    receivedDate: null,
  },
  {
    id: "po-004",
    purchaseOrderNumber: "PO-2026-0107",
    supplierId: "supp-003",
    items: [
      {
        productId: "prod-006",
        quantity: 80,
        unitCost: 240,
        lineTotal: 19200,
        receivedQuantity: 0,
      },
      {
        productId: "prod-007",
        quantity: 25,
        unitCost: 780,
        lineTotal: 19500,
        receivedQuantity: 0,
      },
    ],
    totalAmount: 38700,
    status: "ordered",
    expectedDate: "2026-11-26T00:00:00.000Z",
    receivedDate: null,
  },
];
