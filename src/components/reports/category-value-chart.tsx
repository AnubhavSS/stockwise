"use client";

/**
 * Inventory value by category using qty × unit cost (estimated cost when missing).
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { CategoryValueRow } from "@/features/reports/types";

type CategoryValueChartProps = {
  data: CategoryValueRow[];
};

export function CategoryValueChart({ data }: CategoryValueChartProps) {
  return (
    <Card className="border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader>
        <CardTitle>Inventory Value by Category</CardTitle>
        <CardDescription>
          Current quantity × unit cost. Snapshot of today&apos;s warehouse, not historical stock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="No inventory to value" description="Add products to see category value." />
        ) : (
          /* One bar per category: on-hand qty × unit cost */
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E6E9EF" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#758195", fontSize: 12 }}
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
                  cursor={{ fill: "#F7F8FA" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) {
                      return null;
                    }
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">
                          {formatCurrency(Number(payload[0]?.value ?? 0))}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" name="Inventory value" fill="#111C32" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
