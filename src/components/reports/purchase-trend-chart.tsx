"use client";

/**
 * Purchase order value over time for counted (non-draft, non-cancelled) POs.
 */
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { TimeSeriesPoint } from "@/features/reports/types";

type PurchaseTrendChartProps = {
  data: TimeSeriesPoint[];
};

export function PurchaseTrendChart({ data }: PurchaseTrendChartProps) {
  const hasData = data.some((point) => point.purchases > 0);

  return (
    <Card className="border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader>
        <CardTitle>Purchase Trend</CardTitle>
        <CardDescription>
          Value of purchase orders placed in the selected period (excluding drafts and cancellations).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState
            title="No purchases in this period"
            description="Purchase order value will appear here once orders are created."
          />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportPurchaseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#111C32" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#111C32" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
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
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#758195", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    value >= 100000 ? `₹${Math.round(value / 1000)}k` : formatCurrency(value)
                  }
                  width={64}
                />
                <Tooltip
                  cursor={{ stroke: "#E6E9EF" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) {
                      return null;
                    }
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
                        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">
                          Purchases: {formatCurrency(Number(payload[0]?.value ?? 0))}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="purchases"
                  name="Purchases"
                  stroke="#111C32"
                  strokeWidth={2}
                  fill="url(#reportPurchaseFill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
