"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardPen,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";

import { ReportKpiCards } from "@/components/reports/report-kpi-cards";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { StockPagination } from "@/components/stock/stock-pagination";
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
import {
  movementKind,
  movementKindLabel,
} from "@/features/reports/selectors";
import type { MovementKind } from "@/features/reports/types";
import { formatDateTime, formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Product, StockMovement } from "@/types/inventory";

type MovementReportPanelProps = {
  summary: {
    stockIn: number;
    stockOut: number;
    purchaseReceipts: number;
    salesDeductions: number;
    adjustments: number;
  };
  movements: StockMovement[];
  products: Product[];
  catalog: Product[];
  search: string;
  kind: MovementKind | "all";
  productId: string | "all";
  reference: string;
  page: number;
  pageSize: number;
  total: number;
  onSearchChange: (value: string) => void;
  onKindChange: (value: MovementKind | "all") => void;
  onProductChange: (value: string) => void;
  onReferenceChange: (value: string) => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const kindTone: Record<MovementKind, "success" | "danger" | "info" | "warning"> = {
  purchase: "success",
  sale: "danger",
  adjustment_in: "info",
  adjustment_out: "warning",
};

export function MovementReportPanel({
  summary,
  movements,
  products,
  catalog,
  search,
  kind,
  productId,
  reference,
  page,
  pageSize,
  total,
  onSearchChange,
  onKindChange,
  onProductChange,
  onReferenceChange,
  onClear,
  onPageChange,
  onPageSizeChange,
}: MovementReportPanelProps) {
  const filtersActive =
    Boolean(search) || kind !== "all" || productId !== "all" || Boolean(reference);

  return (
    <div className="space-y-6">
      <ReportKpiCards
        cards={[
          {
            title: "Total Stock In",
            value: formatNumber(summary.stockIn),
            hint: "Positive quantity changes",
            icon: ArrowDownLeft,
            iconClass: "bg-success/10 text-success",
          },
          {
            title: "Total Stock Out",
            value: formatNumber(summary.stockOut),
            hint: "Negative quantity changes",
            icon: ArrowUpRight,
            iconClass: "bg-destructive/10 text-destructive",
          },
          {
            title: "Purchase Receipts",
            value: formatNumber(summary.purchaseReceipts),
            hint: "Units received from purchases",
            icon: ShoppingBag,
            iconClass: "bg-[#111C32]/8 text-[#111C32]",
          },
          {
            title: "Sales Deductions",
            value: formatNumber(summary.salesDeductions),
            hint: "Units issued on completed sales",
            icon: ShoppingCart,
            iconClass: "bg-primary/10 text-primary",
          },
          {
            title: "Manual Adjustments",
            value: formatNumber(summary.adjustments),
            hint: "Absolute units from adjustments",
            icon: ClipboardPen,
            iconClass: "bg-warning/15 text-[#8A5A12]",
          },
        ]}
        columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
      />

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <SearchInput
            className="min-w-0 flex-1"
            value={search}
            onValueChange={onSearchChange}
            placeholder="Search by product, SKU or reference..."
          />
          <Select
            value={kind}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "purchase" ||
                value === "sale" ||
                value === "adjustment_in" ||
                value === "adjustment_out"
              ) {
                onKindChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-44" aria-label="Movement type">
              <SelectValue>
                {kind === "all" ? "All Types" : movementKindLabel[kind]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="adjustment_in">Adjustment In</SelectItem>
              <SelectItem value="adjustment_out">Adjustment Out</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={productId}
            onValueChange={(value) => {
              if (value) {
                onProductChange(value);
              }
            }}
          >
            <SelectTrigger className="w-full bg-card sm:w-48" aria-label="Product">
              <SelectValue>
                {productId === "all"
                  ? "All Products"
                  : catalog.find((product) => product.id === productId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {catalog.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput
            className="w-full sm:w-48"
            value={reference}
            onValueChange={onReferenceChange}
            placeholder="Reference ID"
          />
          {filtersActive ? (
            <Button variant="ghost" onClick={onClear}>
              Clear Filters
            </Button>
          ) : null}
        </div>
        {total === 0 ? (
          <div className="p-4 pt-0">
            <EmptyState
              title="No stock movements in this period"
              description="Purchases, sales and adjustments will appear here."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Movement ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => {
                  const product = products.find((entry) => entry.id === movement.productId);
                  const kindValue = movementKind(movement);
                  return (
                    <TableRow key={movement.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(movement.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{movement.id}</TableCell>
                      <TableCell className="font-medium">
                        {product?.name ?? "Archived item"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product?.sku ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={movementKindLabel[kindValue]}
                          tone={kindTone[kindValue]}
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium",
                          movement.quantityChange > 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {movement.quantityChange > 0 ? "+" : ""}
                        {formatNumber(movement.quantityChange)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{movement.referenceId}</TableCell>
                      <TableCell className="text-muted-foreground">{movement.remarks}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <StockPagination
              page={page}
              pageSize={pageSize}
              total={total}
              noun="movements"
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
