"use client";

import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  saleStatusLabel,
} from "@/features/sales/status";
import type { SalesFilters } from "@/features/sales/selectors";
import { PAYMENT_METHODS, type PaymentMethod, type PaymentStatus, type SaleStatus } from "@/types/sales";

type SalesToolbarProps = {
  filters: SalesFilters;
  hasActiveFilters: boolean;
  onFiltersChange: (filters: SalesFilters) => void;
  onClear: () => void;
};

export function SalesToolbar({
  filters,
  hasActiveFilters,
  onFiltersChange,
  onClear,
}: SalesToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          className="min-w-0 flex-1"
          value={filters.search}
          onValueChange={(search) => onFiltersChange({ ...filters, search })}
          placeholder="Search by invoice, customer or item..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.paymentStatus}
            onValueChange={(value) => {
              if (!value) {
                return;
              }
              onFiltersChange({
                ...filters,
                paymentStatus: value as PaymentStatus | "all",
              });
            }}
          >
            <SelectTrigger className="w-full min-w-36 bg-card sm:w-40" aria-label="Payment status">
              <SelectValue>
                {filters.paymentStatus === "all"
                  ? "All Status"
                  : paymentStatusLabel[filters.paymentStatus]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">{paymentStatusLabel.paid}</SelectItem>
              <SelectItem value="partial">{paymentStatusLabel.partial}</SelectItem>
              <SelectItem value="unpaid">{paymentStatusLabel.unpaid}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.paymentMethod}
            onValueChange={(value) => {
              if (!value) {
                return;
              }
              onFiltersChange({
                ...filters,
                paymentMethod: value as PaymentMethod | "all",
              });
            }}
          >
            <SelectTrigger className="w-full min-w-40 bg-card sm:w-44" aria-label="Payment method">
              <SelectValue>
                {filters.paymentMethod === "all"
                  ? "All Methods"
                  : paymentMethodLabel[filters.paymentMethod]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {PAYMENT_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {paymentMethodLabel[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.saleStatus}
            onValueChange={(value) => {
              if (!value) {
                return;
              }
              onFiltersChange({
                ...filters,
                saleStatus: value as SaleStatus | "all",
              });
            }}
          >
            <SelectTrigger className="w-full min-w-36 bg-card sm:w-40" aria-label="Sale status">
              <SelectValue>
                {filters.saleStatus === "all"
                  ? "All Sales"
                  : saleStatusLabel[filters.saleStatus]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sales</SelectItem>
              <SelectItem value="draft">{saleStatusLabel.draft}</SelectItem>
              <SelectItem value="completed">{saleStatusLabel.completed}</SelectItem>
              <SelectItem value="cancelled">{saleStatusLabel.cancelled}</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters ? (
            <Button variant="ghost" onClick={onClear}>
              Clear Filters
            </Button>
          ) : null}
        </div>
      </div>
      <DateRangeFilter
        value={{ from: filters.from, to: filters.to }}
        onValueChange={(range) =>
          onFiltersChange({ ...filters, from: range.from, to: range.to })
        }
      />
    </div>
  );
}
