"use client";

/**
 * Sales analysis: summary, trend, payment mix, top products, and filtered invoices.
 */
import { Banknote, Package, Receipt, ShoppingCart, Wallet } from "lucide-react";

import { PaymentDistributionChart } from "@/components/reports/payment-distribution-chart";
import { ReportKpiCards } from "@/components/reports/report-kpi-cards";
import { SalesPerformanceChart } from "@/components/reports/sales-performance-chart";
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
import { customerName } from "@/features/sales/selectors";
import {
  paymentStatusLabel,
  paymentStatusTone,
  saleStatusLabel,
  saleStatusTone,
} from "@/features/sales/status";
import { formatCurrency, formatDate, formatNumber } from "@/lib/calculations";
import type { PaymentSlice, TimeSeriesPoint, TopProductRow } from "@/features/reports/types";
import type { Customer } from "@/types/customer";
import type { PaymentStatus, Sale, SaleStatus } from "@/types/sales";

type SalesReportPanelProps = {
  summary: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    itemsSold: number;
    pendingPayments: number;
    revenueChange: number;
    ordersChange: number;
    paymentSlices: PaymentSlice[];
  };
  series: TimeSeriesPoint[];
  topProducts: TopProductRow[];
  sales: Sale[];
  customers: Customer[];
  search: string;
  paymentStatus: PaymentStatus | "all";
  saleStatus: SaleStatus | "all";
  page: number;
  pageSize: number;
  total: number;
  onSearchChange: (value: string) => void;
  onPaymentStatusChange: (value: PaymentStatus | "all") => void;
  onSaleStatusChange: (value: SaleStatus | "all") => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function SalesReportPanel({
  summary,
  series,
  topProducts,
  sales,
  customers,
  search,
  paymentStatus,
  saleStatus,
  page,
  pageSize,
  total,
  onSearchChange,
  onPaymentStatusChange,
  onSaleStatusChange,
  onClear,
  onPageChange,
  onPageSizeChange,
}: SalesReportPanelProps) {
  const filtersActive = Boolean(search) || paymentStatus !== "all" || saleStatus !== "all";

  return (
    <div className="space-y-6">
      {/* Completed-sales KPIs for the selected date range */}
      <ReportKpiCards
        cards={[
          {
            title: "Total Revenue",
            value: formatCurrency(summary.revenue),
            hint: "Completed sales only",
            trend: summary.revenueChange,
            icon: ShoppingCart,
            iconClass: "bg-primary/10 text-primary",
          },
          {
            title: "Total Orders",
            value: formatNumber(summary.orders),
            hint: "Completed invoices",
            trend: summary.ordersChange,
            icon: Receipt,
            iconClass: "bg-[#111C32]/8 text-[#111C32]",
          },
          {
            title: "Average Order Value",
            value: formatCurrency(summary.averageOrderValue),
            hint: "Revenue per completed sale",
            icon: Banknote,
            iconClass: "bg-success/10 text-success",
          },
          {
            title: "Items Sold",
            value: formatNumber(summary.itemsSold),
            hint: "Units on completed invoices",
            icon: Package,
            iconClass: "bg-warning/15 text-[#8A5A12]",
          },
          {
            title: "Pending Payments",
            value: formatCurrency(summary.pendingPayments),
            hint: "Outstanding on completed sales",
            icon: Wallet,
            iconClass: "bg-destructive/10 text-destructive",
          },
        ]}
        columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
      />

      {/* Trend plus paid / partial / unpaid mix (order counts) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesPerformanceChart data={series} />
        </div>
        <PaymentDistributionChart slices={summary.paymentSlices} />
      </div>

      {/* Units, revenue, and % of completed sales revenue */}
      <Card className="border-border bg-card shadow-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Contribution is the share of completed sales revenue.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {topProducts.length === 0 ? (
            <EmptyState title="No product sales in this period" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">{row.sku}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.unitsSold)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                    <TableCell className="text-right">{row.share.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoices in range, after search and status filters */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <SearchInput
            className="min-w-0 flex-1"
            value={search}
            onValueChange={onSearchChange}
            placeholder="Search by sale ID or customer..."
          />
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
          <Select
            value={saleStatus}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "draft" ||
                value === "completed" ||
                value === "cancelled"
              ) {
                onSaleStatusChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-40" aria-label="Sale status">
              <SelectValue>
                {saleStatus === "all" ? "All Status" : saleStatusLabel[saleStatus]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
            <EmptyState
              title="No sales match these filters"
              description="Try another search, status or date range."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Amount Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Sale Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                    <TableCell>{customerName(customers, sale.customerId)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(sale.date)}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(sale.items.reduce((sum, item) => sum + item.quantity, 0))}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.amountPaid)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.remainingBalance)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={paymentStatusLabel[sale.paymentStatus]}
                        tone={paymentStatusTone[sale.paymentStatus]}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={saleStatusLabel[sale.status]}
                        tone={saleStatusTone[sale.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <StockPagination
              page={page}
              pageSize={pageSize}
              total={total}
              noun="sales"
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
