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
import type { PurchaseFilters } from "@/features/purchase/selectors";
import {
  paymentStatusLabel,
  purchaseStatusLabel,
} from "@/features/purchase/status";
import type { PurchaseStatus } from "@/types/purchase";
import type { PaymentStatus } from "@/types/sales";
import type { Supplier } from "@/types/supplier";

type PurchaseToolbarProps = {
  filters: PurchaseFilters;
  suppliers: Supplier[];
  hasActiveFilters: boolean;
  onFiltersChange: (filters: PurchaseFilters) => void;
  onClear: () => void;
};

export function PurchaseToolbar({
  filters,
  suppliers,
  hasActiveFilters,
  onFiltersChange,
  onClear,
}: PurchaseToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          className="min-w-0 flex-1"
          value={filters.search}
          onValueChange={(search) => onFiltersChange({ ...filters, search })}
          placeholder="Search by PO number, supplier or item..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filters.supplierId}
            onValueChange={(value) => {
              if (value) {
                onFiltersChange({ ...filters, supplierId: value });
              }
            }}
          >
            <SelectTrigger className="w-full min-w-40 bg-card sm:w-48" aria-label="Supplier">
              <SelectValue>
                {filters.supplierId === "all"
                  ? "All Suppliers"
                  : suppliers.find((supplier) => supplier.id === filters.supplierId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => {
              if (value) {
                onFiltersChange({
                  ...filters,
                  status: value as PurchaseStatus | "all",
                });
              }
            }}
          >
            <SelectTrigger className="w-full min-w-40 bg-card sm:w-44" aria-label="Purchase status">
              <SelectValue>
                {filters.status === "all"
                  ? "All Status"
                  : purchaseStatusLabel[filters.status]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {(
                [
                  "draft",
                  "ordered",
                  "partially_received",
                  "received",
                  "cancelled",
                ] as const
              ).map((status) => (
                <SelectItem key={status} value={status}>
                  {purchaseStatusLabel[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.paymentStatus}
            onValueChange={(value) => {
              if (value) {
                onFiltersChange({
                  ...filters,
                  paymentStatus: value as PaymentStatus | "all",
                });
              }
            }}
          >
            <SelectTrigger className="w-full min-w-36 bg-card sm:w-40" aria-label="Payment status">
              <SelectValue>
                {filters.paymentStatus === "all"
                  ? "All Payments"
                  : paymentStatusLabel[filters.paymentStatus]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">{paymentStatusLabel.paid}</SelectItem>
              <SelectItem value="partial">{paymentStatusLabel.partial}</SelectItem>
              <SelectItem value="unpaid">{paymentStatusLabel.unpaid}</SelectItem>
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
