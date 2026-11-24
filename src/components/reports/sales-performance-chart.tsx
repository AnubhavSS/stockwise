"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import type { TimeSeriesPoint } from "@/features/reports/types";

type SalesPerformanceChartProps = {
  data: TimeSeriesPoint[];
};

export function SalesPerformanceChart({ data }: SalesPerformanceChartProps) {
  const hasData = data.some((point) => point.sales > 0);

  return (
    <Card className="border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader>
        <CardTitle>Sales Performance</CardTitle>
        <CardDescription>Completed revenue and order count over the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState
            title="No completed sales in this period"
            description="Completed invoices will appear here once sales are recorded."
          />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E6E9EF" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#758195", fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  yAxisId="revenue"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#758195", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    value >= 100000 ? `₹${Math.round(value / 1000)}k` : formatCurrency(value)
                  }
                  width={64}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#758195", fontSize: 12 }}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  cursor={{ fill: "#F7F8FA" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) {
                      return null;
                    }
                    const sales = Number(
                      payload.find((item) => item.dataKey === "sales")?.value ?? 0,
                    );
                    const orders = Number(
                      payload.find((item) => item.dataKey === "orders")?.value ?? 0,
                    );
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
                        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">Revenue: {formatCurrency(sales)}</p>
                        <p className="text-sm font-medium">Orders: {formatNumber(orders)}</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "#758195", paddingBottom: 12 }}
                />
                <Bar
                  yAxisId="revenue"
                  dataKey="sales"
                  name="Revenue"
                  fill="#F28C28"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#111C32"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
