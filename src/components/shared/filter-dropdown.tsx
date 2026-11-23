"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/types/common";

type FilterDropdownProps = {
  label: string;
  value: string | null;
  options: SelectOption[];
  onValueChange: (value: string | null) => void;
  placeholder?: string;
};

export function FilterDropdown({
  label,
  value,
  options,
  onValueChange,
  placeholder = "All",
}: FilterDropdownProps) {
  return (
    <div className="flex min-w-40 flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next || null)}
      >
        <SelectTrigger className="w-full bg-card" aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
