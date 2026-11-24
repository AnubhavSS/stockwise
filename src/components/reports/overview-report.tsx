"use client";

import {
  Boxes,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { SalesPurchaseChart } from "@/components/dashboard/sales-purchase-chart";
import { StockStatusChart } from "@/components/dashboard/stock-status-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ReportKpiCards } from "@/components/reports/report-kpi-cards";
import { SalesPerformanceChart } from "@/components/reports/sales-performance-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { Activity, StockStatusSlice } from "@/types/common";
import type { TimeSeriesPoint, TopProductRow } from "@/features/reports/types";

type OverviewReportProps = {
  kpis: {
    revenue: number;
    purchases: number;
    grossProfit: number;
    inventoryValue: number;
    inventoryEstimated: boolean;
    cogsEstimated: boolean;
    revenueChange: number;
    purchasesChange: number;
    profitChange: number;
  };
  series: TimeSeriesPoint[];
  stockSlices: StockStatusSlice[];
  totalProducts: number;
  topProducts: TopProductRow[];
  activities: Activity[];
};

export function OverviewReport({
  kpis,
  series,
  stockSlices,
  totalProducts,
  topProducts,
  activities,
}: OverviewReportProps) {
  return (
    <div className="space-y-6">
      <ReportKpiCards
        cards={[
          {
            title: "Total Revenue",
            value: formatCurrency(kpis.revenue),
            hint: "Completed sales vs previous period",
            trend: kpis.revenueChange,
            icon: Wallet,
            iconClass: "bg-primary/10 text-primary",
          },
          {
            title: "Total Purchases",
            value: formatCurrency(kpis.purchases),
            hint: "Orders placed, excluding drafts and cancellations",
            trend: kpis.purchasesChange,
            icon: ShoppingBag,
            iconClass: "bg-[#111C32]/8 text-[#111C32]",
          },
          {
            title: "Gross Profit",
            value: formatCurrency(kpis.grossProfit),
            hint: kpis.cogsEstimated
              ? "Revenue minus estimated COGS (current product cost)"
              : "Revenue minus cost of goods sold",
            trend: kpis.profitChange,
            icon: TrendingUp,
            iconClass: "bg-success/10 text-success",
          },
          {
            title: "Inventory Value",
            value: formatCurrency(kpis.inventoryValue),
            hint: kpis.inventoryEstimated
              ? "Current stock × unit cost (some costs estimated)"
              : "Current stock × unit cost",
            icon: Boxes,
            iconClass: "bg-warning/15 text-[#8A5A12]",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesPurchaseChart data={series} />
        </div>
        <StockStatusChart slices={stockSlices} totalItems={totalProducts} />
      </div>

      <SalesPerformanceChart data={series} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="border-border bg-card shadow-sm ring-1 ring-border xl:col-span-2">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Ranked by units sold from completed invoices.</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {topProducts.length === 0 ? (
              <EmptyState
                title="No sales in this period"
                description="Top products appear after completed sales."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((row) => (
                    <TableRow key={row.productId}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">{row.sku}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.unitsSold)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.stock)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}
