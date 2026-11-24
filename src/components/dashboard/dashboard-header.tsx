"use client";

/**
 * Greeting, 7/30/90 day period, and shortcuts to create a sale or purchase.
 */
import { CalendarRange } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig } from "@/config/site";
import { getTimeOfDayGreeting } from "@/features/dashboard/greeting";
import {
  reportPeriodLabel,
  type ReportPeriod,
} from "@/features/reports/periods";

type DashboardHeaderProps = {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
};

export function DashboardHeader({
  period,
  onPeriodChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      {/* Personal greeting against the demo clock */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {getTimeOfDayGreeting()}, {"John Doe"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your inventory today.
        </p>
      </div>
      {/* Last 7 / 30 / 90 days — this is the dashboard period, not Reports */}
      <Select
        value={period}
        onValueChange={(value) => {
          if (value === "7d" || value === "30d" || value === "90d") {
            onPeriodChange(value);
          }
        }}
      >
        <SelectTrigger className="w-[168px] bg-card" aria-label="Date range">
          <CalendarRange className="size-4 text-muted-foreground" />
          <SelectValue>{reportPeriodLabel[period]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">{reportPeriodLabel["7d"]}</SelectItem>
          <SelectItem value="30d">{reportPeriodLabel["30d"]}</SelectItem>
          <SelectItem value="90d">{reportPeriodLabel["90d"]}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
