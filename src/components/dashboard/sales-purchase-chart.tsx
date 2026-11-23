"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { DailyPerformancePoint } from "@/types/common";

type SalesPurchaseChartProps = {
  data: DailyPerformancePoint[];
};

export function SalesPurchaseChart({ data }: SalesPurchaseChartProps) {
  return (
    <Card className="border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader className="gap-1">
        <CardTitle>Sales & Purchase Overview</CardTitle>
        <CardDescription>Track your business performance over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F28C28" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#F28C28" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="purchaseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111C32" stopOpacity={0.12} />
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
                  value >= 100000
                    ? `₹${Math.round(value / 1000)}k`
                    : formatCurrency(value)
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
                      {payload.map((item) => (
                        <p key={String(item.dataKey)} className="text-sm font-medium">
                          <span className="text-muted-foreground">{item.name}: </span>
                          {formatCurrency(Number(item.value ?? 0))}
                        </p>
                      ))}
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
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#F28C28"
                strokeWidth={2}
                fill="url(#salesFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#F28C28" }}
              />
              <Area
                type="monotone"
                dataKey="purchases"
                name="Purchases"
                stroke="#111C32"
                strokeWidth={2}
                fill="url(#purchaseFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#111C32" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
