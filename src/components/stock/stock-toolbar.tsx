"use client";

import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStockStatusLabel } from "@/features/stock/status";
import type { StockFilters } from "@/features/stock/selectors";
import type { ProductCategory, StockStatus } from "@/types/inventory";

const STATUS_OPTIONS: Array<StockStatus | "all"> = [
  "all",
  "in_stock",
  "low_stock",
  "out_of_stock",
];

type StockToolbarProps = {
  filters: StockFilters;
  categories: ProductCategory[];
  hasActiveFilters: boolean;
  onFiltersChange: (filters: StockFilters) => void;
  onClear: () => void;
};

export function StockToolbar({
  filters,
  categories,
  hasActiveFilters,
  onFiltersChange,
  onClear,
}: StockToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <SearchInput
        className="min-w-0 flex-1"
        value={filters.search}
        onValueChange={(search) => onFiltersChange({ ...filters, search })}
        placeholder="Search by item name, SKU or category..."
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.category}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            onFiltersChange({
              ...filters,
              category: value as ProductCategory | "all",
            });
          }}
        >
          <SelectTrigger className="w-full min-w-40 bg-card sm:w-44" aria-label="Category">
            <SelectValue>
              {filters.category === "all" ? "All Categories" : filters.category}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            onFiltersChange({
              ...filters,
              status: value as StockStatus | "all",
            });
          }}
        >
          <SelectTrigger className="w-full min-w-40 bg-card sm:w-40" aria-label="Stock status">
            <SelectValue>
              {filters.status === "all"
                ? "All Status"
                : getStockStatusLabel(filters.status)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "All Status" : getStockStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters ? (
          <Button variant="ghost" onClick={onClear}>
            Clear Filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
