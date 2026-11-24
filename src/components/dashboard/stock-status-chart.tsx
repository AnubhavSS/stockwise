"use client";

/**
 * Donut of current In Stock / Low Stock / Out of Stock product counts.
 */
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/calculations";
import type { StockStatusSlice } from "@/types/common";

type StockStatusChartProps = {
  slices: StockStatusSlice[];
  totalItems: number;
};

export function StockStatusChart({ slices, totalItems }: StockStatusChartProps) {
  return (
    <Card className="flex h-full flex-col border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader>
        <CardTitle>Stock Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* Donut of SKU counts; total sits in the hole */}
        <div className="relative h-[180px] w-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="count"
                nameKey="label"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={3}
                stroke="none"
              >
                {slices.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold leading-none">{formatNumber(totalItems)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Items</p>
          </div>
        </div>
        <ul className="w-full space-y-2">
          {slices.map((slice) => (
            <li key={slice.key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: slice.color }}
                  aria-hidden
                />
                {slice.label}
              </span>
              <span className="text-muted-foreground">
                {formatNumber(slice.count)} ({slice.percent.toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
