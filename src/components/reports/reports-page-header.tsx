"use client";

import { CalendarRange, Download, Printer } from "lucide-react";

import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ANALYTICS_PRESETS,
  analyticsPresetLabel,
  applyAnalyticsPreset,
  type AnalyticsPreset,
  type AnalyticsRange,
} from "@/features/reports/range";

type ReportsPageHeaderProps = {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
  onExportCsv: () => void;
  onPrint: () => void;
};

export function ReportsPageHeader({
  range,
  onRangeChange,
  onExportCsv,
  onPrint,
}: ReportsPageHeaderProps) {
  return (
    <PageHeader
      title="Reports & Analytics"
      description="Track business performance and make data-driven decisions."
      action={
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap justify-end gap-2 print:hidden">
            <Select
              value={range.preset}
              onValueChange={(value) => {
                if (
                  value === "today" ||
                  value === "7d" ||
                  value === "30d" ||
                  value === "90d" ||
                  value === "ytd" ||
                  value === "custom"
                ) {
                  onRangeChange(applyAnalyticsPreset(value as AnalyticsPreset, range));
                }
              }}
            >
              <SelectTrigger className="w-[168px] bg-card" aria-label="Date range">
                <CalendarRange className="size-4 text-muted-foreground" />
                <SelectValue>{analyticsPresetLabel[range.preset]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ANALYTICS_PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {analyticsPresetLabel[preset]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="bg-card" />
                }
              >
                <Download />
                Export Report
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportCsv}>
                  <Download />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onPrint}>
                  <Printer />
                  Print / Save as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {range.preset === "custom" ? (
            <DateRangeFilter
              value={{ from: range.from, to: range.to }}
              onValueChange={(next) =>
                onRangeChange({ ...range, from: next.from, to: next.to })
              }
            />
          ) : null}
        </div>
      }
    />
  );
}
