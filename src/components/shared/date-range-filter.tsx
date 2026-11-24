"use client";

/**
 * From/to date inputs for custom report and list ranges.
 */
import { Input } from "@/components/ui/input";
import type { DateRange } from "@/types/common";

type DateRangeFilterProps = {
  value: DateRange;
  onValueChange: (value: DateRange) => void;
};

export function DateRangeFilter({ value, onValueChange }: DateRangeFilterProps) {
  return (
    <fieldset className="flex flex-wrap items-end gap-3">
      <legend className="sr-only">Date range</legend>
      <label className="flex min-w-40 flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">From</span>
        <Input
          type="date"
          value={value.from}
          onChange={(event) =>
            onValueChange({ ...value, from: event.target.value })
          }
          className="bg-card"
        />
      </label>
      <label className="flex min-w-40 flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">To</span>
        <Input
          type="date"
          value={value.to}
          onChange={(event) =>
            onValueChange({ ...value, to: event.target.value })
          }
          className="bg-card"
        />
      </label>
    </fieldset>
  );
}
