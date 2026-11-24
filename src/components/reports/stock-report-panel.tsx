"use client";

/**
 * Current warehouse snapshot: counts, value by category, and inventory table.
 */
import { AlertTriangle, Boxes, Layers3, Package, PackageX, Wallet } from "lucide-react";

import { StockStatusChart } from "@/components/dashboard/stock-status-chart";
import { CategoryValueChart } from "@/components/reports/category-value-chart";
import { ReportKpiCards } from "@/components/reports/report-kpi-cards";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StockPagination } from "@/components/stock/stock-pagination";
import { StockStatusBadge } from "@/components/stock/stock-status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productUnitCost } from "@/features/reports/calculations";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory, type StockStatus } from "@/types/inventory";
import type { CategoryValueRow } from "@/features/reports/types";
import type { StockStatusSlice } from "@/types/common";

type StockReportPanelProps = {
  summary: {
    totalProducts: number;
    totalUnits: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    inventoryValue: number;
    inventoryEstimated: boolean;
    slices: StockStatusSlice[];
    categoryValues: CategoryValueRow[];
  };
  products: Product[];
  search: string;
  category: ProductCategory | "all";
  status: StockStatus | "all";
  attentionOnly: boolean;
  sort: "name" | "quantity" | "value";
  page: number;
  pageSize: number;
  total: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ProductCategory | "all") => void;
  onStatusChange: (value: StockStatus | "all") => void;
  onAttentionOnlyChange: (value: boolean) => void;
  onSortChange: (value: "name" | "quantity" | "value") => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export function StockReportPanel({
  summary,
  products,
  search,
  category,
  status,
  attentionOnly,
  sort,
  page,
  pageSize,
  total,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onAttentionOnlyChange,
  onSortChange,
  onClear,
  onPageChange,
  onPageSizeChange,
}: StockReportPanelProps) {
  const filtersActive =
    Boolean(search) || category !== "all" || status !== "all" || attentionOnly || sort !== "name";

  return (
    <div className="space-y-6">
      {/* Live warehouse snapshot — not stock as-of the selected date */}
      <ReportKpiCards
        cards={[
          {
            title: "Total Products",
            value: formatNumber(summary.totalProducts),
            hint: "Active catalogue",
            icon: Package,
            iconClass: "bg-primary/10 text-primary",
          },
          {
            title: "Units in Stock",
            value: formatNumber(summary.totalUnits),
            hint: "Current on-hand quantity",
            icon: Layers3,
            iconClass: "bg-[#111C32]/8 text-[#111C32]",
          },
          {
            title: "In Stock",
            value: formatNumber(summary.inStock),
            hint: "Above reorder point",
            icon: Boxes,
            iconClass: "bg-success/10 text-success",
          },
          {
            title: "Low Stock",
            value: formatNumber(summary.lowStock),
            hint: "At or below minimum",
            icon: AlertTriangle,
            iconClass: "bg-warning/15 text-[#8A5A12]",
          },
          {
            title: "Out of Stock",
            value: formatNumber(summary.outOfStock),
            hint: "Zero units available",
            icon: PackageX,
            iconClass: "bg-destructive/10 text-destructive",
          },
          {
            title: "Inventory Value",
            value: formatCurrency(summary.inventoryValue),
            hint: summary.inventoryEstimated
              ? "Quantity × unit cost (some costs estimated)"
              : "Current quantity × unit cost",
            icon: Wallet,
            iconClass: "bg-primary/10 text-primary",
          },
        ]}
        columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      />

      {/* Mix by status and inventory value by category (qty × unit cost) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <StockStatusChart slices={summary.slices} totalItems={summary.totalProducts} />
        <div className="xl:col-span-2">
          <CategoryValueChart data={summary.categoryValues} />
        </div>
      </div>

      {/* Catalogue table: search, category, status, attention-only, sort */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <SearchInput
            className="min-w-0 flex-1"
            value={search}
            onValueChange={onSearchChange}
            placeholder="Search by product name or SKU..."
          />
          <Select
            value={category}
            onValueChange={(value) => {
              if (value === "all" || PRODUCT_CATEGORIES.includes(value as ProductCategory)) {
                onCategoryChange(value as ProductCategory | "all");
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-40" aria-label="Category">
              <SelectValue>{category === "all" ? "All Categories" : category}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PRODUCT_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "in_stock" ||
                value === "low_stock" ||
                value === "out_of_stock"
              ) {
                onStatusChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-40" aria-label="Stock status">
              <SelectValue>
                {status === "all"
                  ? "All Status"
                  : status === "in_stock"
                    ? "In Stock"
                    : status === "low_stock"
                      ? "Low Stock"
                      : "Out of Stock"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              if (value === "name" || value === "quantity" || value === "value") {
                onSortChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-44" aria-label="Sort stock">
              <SelectValue>
                {sort === "name" ? "Sort by name" : sort === "quantity" ? "Sort by quantity" : "Sort by value"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by name</SelectItem>
              <SelectItem value="quantity">Sort by quantity</SelectItem>
              <SelectItem value="value">Sort by value</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant={attentionOnly ? "default" : "outline"}
            className={attentionOnly ? undefined : "bg-card"}
            onClick={() => onAttentionOnlyChange(!attentionOnly)}
          >
            Attention only
          </Button>
          {filtersActive ? (
            <Button variant="ghost" onClick={onClear}>
              Clear Filters
            </Button>
          ) : null}
        </div>
        {total === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState title="No products match these filters" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Minimum</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Inventory Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const cost = productUnitCost(product).cost;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">{formatNumber(product.quantity)}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(product.minimumStockLevel)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(cost)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.quantity * cost)}
                      </TableCell>
                      <TableCell>
                        <StockStatusBadge product={product} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <StockPagination
              page={page}
              pageSize={pageSize}
              total={total}
              noun="products"
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
