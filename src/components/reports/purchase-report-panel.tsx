"use client";

/**
 * Purchase analysis: order vs received, supplier spend, and PO table.
 */
import { ClipboardList, PackageCheck, PackageSearch, ShoppingBag, Wallet } from "lucide-react";

import { PurchaseTrendChart } from "@/components/reports/purchase-trend-chart";
import { ReportKpiCards } from "@/components/reports/report-kpi-cards";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { StockPagination } from "@/components/stock/stock-pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderedQuantity, receivedQuantity } from "@/features/purchase/calculations";
import { supplierName } from "@/features/purchase/selectors";
import {
  paymentStatusLabel,
  paymentStatusTone,
  purchaseStatusLabel,
  purchaseStatusTone,
} from "@/features/purchase/status";
import { formatCurrency, formatDate, formatNumber } from "@/lib/calculations";
import type { SupplierReportRow, TimeSeriesPoint } from "@/features/reports/types";
import type { Purchase } from "@/types/purchase";
import type { PaymentStatus } from "@/types/sales";
import type { Supplier } from "@/types/supplier";

type PurchaseReportPanelProps = {
  summary: {
    totalValue: number;
    orderCount: number;
    receivedCount: number;
    pendingCount: number;
    pendingPayments: number;
    receivedValue: number;
    valueChange: number;
    ordersChange: number;
  };
  series: TimeSeriesPoint[];
  suppliers: Supplier[];
  supplierRows: SupplierReportRow[];
  purchases: Purchase[];
  search: string;
  status: Purchase["status"] | "all";
  paymentStatus: PaymentStatus | "all";
  page: number;
  pageSize: number;
  total: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: Purchase["status"] | "all") => void;
  onPaymentStatusChange: (value: PaymentStatus | "all") => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function PurchaseReportPanel({
  summary,
  series,
  suppliers,
  supplierRows,
  purchases,
  search,
  status,
  paymentStatus,
  page,
  pageSize,
  total,
  onSearchChange,
  onStatusChange,
  onPaymentStatusChange,
  onClear,
  onPageChange,
  onPageSizeChange,
}: PurchaseReportPanelProps) {
  const filtersActive = Boolean(search) || status !== "all" || paymentStatus !== "all";

  return (
    <div className="space-y-6">
      {/* Order value vs goods received — drafts and cancellations are excluded */}
      <ReportKpiCards
        cards={[
          {
            title: "Total Purchase Value",
            value: formatCurrency(summary.totalValue),
            hint: "Orders placed, excluding drafts and cancellations",
            trend: summary.valueChange,
            icon: ShoppingBag,
            iconClass: "bg-primary/10 text-primary",
          },
          {
            title: "Purchase Orders",
            value: formatNumber(summary.orderCount),
            hint: "Counted orders in this period",
            trend: summary.ordersChange,
            icon: ClipboardList,
            iconClass: "bg-[#111C32]/8 text-[#111C32]",
          },
          {
            title: "Orders Received",
            value: formatNumber(summary.receivedCount),
            hint: `Fully received · ${formatCurrency(summary.receivedValue)}`,
            icon: PackageCheck,
            iconClass: "bg-success/10 text-success",
          },
          {
            title: "Pending Orders",
            value: formatNumber(summary.pendingCount),
            hint: "Ordered or partially received",
            icon: PackageSearch,
            iconClass: "bg-warning/15 text-[#8A5A12]",
          },
          {
            title: "Pending Payments",
            value: formatCurrency(summary.pendingPayments),
            hint: "Outstanding to suppliers",
            icon: Wallet,
            iconClass: "bg-destructive/10 text-destructive",
          },
        ]}
        columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
      />

      <PurchaseTrendChart data={series} />

      {/* Spend, receipts, and outstanding by supplier */}
      <Card className="border-border bg-card shadow-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle>Supplier Analysis</CardTitle>
          <CardDescription>Sorted by purchase order value in the selected period.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {supplierRows.length === 0 ? (
            <EmptyState title="No supplier purchases in this period" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Purchase Value</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierRows.map((row) => (
                  <TableRow key={row.supplierId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.orderCount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.totalValue)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.receivedCount)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.pendingCount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.outstanding)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Purchase orders in range after search and status filters */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <SearchInput
            className="min-w-0 flex-1"
            value={search}
            onValueChange={onSearchChange}
            placeholder="Search by purchase ID or supplier..."
          />
          <Select
            value={status}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "draft" ||
                value === "ordered" ||
                value === "partially_received" ||
                value === "received" ||
                value === "cancelled"
              ) {
                onStatusChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-44" aria-label="Purchase status">
              <SelectValue>
                {status === "all" ? "All Status" : purchaseStatusLabel[status]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="partially_received">Partially Received</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={paymentStatus}
            onValueChange={(value) => {
              if (value === "all" || value === "paid" || value === "partial" || value === "unpaid") {
                onPaymentStatusChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-40" aria-label="Payment status">
              <SelectValue>
                {paymentStatus === "all" ? "All Payments" : paymentStatusLabel[paymentStatus]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          {filtersActive ? (
            <Button variant="ghost" onClick={onClear}>
              Clear Filters
            </Button>
          ) : null}
        </div>
        {total === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState title="No purchase orders match these filters" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => {
                  const ordered = orderedQuantity(purchase);
                  const received = receivedQuantity(purchase);
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.purchaseOrderNumber}
                      </TableCell>
                      <TableCell>{supplierName(suppliers, purchase.supplierId)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(purchase.date)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(purchase.expectedDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(purchase.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(received)}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(Math.max(0, ordered - received))}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={paymentStatusLabel[purchase.paymentStatus]}
                          tone={paymentStatusTone[purchase.paymentStatus]}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={purchaseStatusLabel[purchase.status]}
                          tone={purchaseStatusTone[purchase.status]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <StockPagination
              page={page}
              pageSize={pageSize}
              total={total}
              noun="orders"
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
