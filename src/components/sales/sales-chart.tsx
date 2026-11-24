"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarRange } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  salesPeriodLabel,
  type SalesPeriod,
} from "@/features/sales/periods";
import { formatCurrency } from "@/lib/calculations";

type SalesChartProps = {
  data: Array<{ date: string; label: string; sales: number }>;
  period: SalesPeriod;
  onPeriodChange: (period: SalesPeriod) => void;
};

const PERIODS: SalesPeriod[] = ["7d", "30d", "90d", "ytd"];

export function SalesChart({ data, period, onPeriodChange }: SalesChartProps) {
  return (
    <Card className="border-border bg-card shadow-sm ring-1 ring-border">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Sales Analytics</CardTitle>
          <CardDescription>Revenue trend for completed sales.</CardDescription>
        </div>
        <Select
          value={period}
          onValueChange={(value) => {
            if (value === "7d" || value === "30d" || value === "90d" || value === "ytd") {
              onPeriodChange(value);
            }
          }}
        >
          <SelectTrigger className="w-[168px] bg-card" aria-label="Sales period">
            <CalendarRange className="size-4 text-muted-foreground" />
            <SelectValue>{salesPeriodLabel[period]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((item) => (
              <SelectItem key={item} value={item}>
                {salesPeriodLabel[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesOnlyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F28C28" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#F28C28" stopOpacity={0.02} />
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
                        Revenue: {formatCurrency(Number(payload[0]?.value ?? 0))}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#F28C28"
                strokeWidth={2}
                fill="url(#salesOnlyFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#F28C28" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
