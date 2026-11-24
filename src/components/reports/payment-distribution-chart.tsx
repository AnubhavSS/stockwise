"use client";

/**
 * Donut of paid / partial / unpaid invoices (order counts, with amounts in the tooltip).
 */
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/calculations";
import type { PaymentSlice } from "@/features/reports/types";

type PaymentDistributionChartProps = {
  slices: PaymentSlice[];
};

export function PaymentDistributionChart({ slices }: PaymentDistributionChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);

  return (
    <Card className="flex h-full flex-col border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader>
        <CardTitle>Payment Distribution</CardTitle>
        <CardDescription>Share of invoices by payment status (order count).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-5">
        {total === 0 ? (
          <EmptyState
            title="No invoices in this period"
            description="Payment mix appears once sales are recorded."
          />
        ) : (
          <>
            {/* Slice size is invoice count, not rupees — amounts are in the tooltip */}
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
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) {
                        return null;
                      }
                      const slice = payload[0]?.payload as PaymentSlice;
                      return (
                        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm">
                          {slice.label}: {formatNumber(slice.count)} invoices
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-semibold leading-none">{formatNumber(total)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Invoices</p>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
