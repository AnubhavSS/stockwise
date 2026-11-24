"use client";

/**
 * Paginated invoice list; row click opens the sale detail page.
 */
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Ban } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { StockPagination } from "@/components/stock/stock-pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { itemCount, canCancelSale, canEditSale } from "@/features/sales/calculations";
import { customerName } from "@/features/sales/selectors";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusTone,
  saleStatusLabel,
  saleStatusTone,
} from "@/features/sales/status";
import { formatCurrency, formatDate, formatNumber } from "@/lib/calculations";
import type { Customer } from "@/types/customer";
import type { Sale } from "@/types/sales";

type SalesTableProps = {
  sales: Sale[];
  customers: Customer[];
  selectedIds: string[];
  page: number;
  pageSize: number;
  total: number;
  onSelectedIdsChange: (ids: string[]) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (sale: Sale) => void;
  onCancel: (sale: Sale) => void;
};

export function SalesTable({
  sales,
  customers,
  selectedIds,
  page,
  pageSize,
  total,
  onSelectedIdsChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onCancel,
}: SalesTableProps) {
  const router = useRouter();
  const visibleIds = sales.map((sale) => sale.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  function toggleAll(checked: boolean) {
    if (checked) {
      onSelectedIdsChange([...new Set([...selectedIds, ...visibleIds])]);
      return;
    }
    onSelectedIdsChange(selectedIds.filter((id) => !visibleIds.includes(id)));
  }

  function toggleOne(id: string, checked: boolean) {
    if (checked) {
      onSelectedIdsChange([...selectedIds, id]);
      return;
    }
    onSelectedIdsChange(selectedIds.filter((item) => item !== id));
  }

  if (total === 0) {
    return (
      <div className="p-4 pt-0">
        <EmptyState
          title="No sales match these filters"
          description="Try another search, date range or status, or create a new sale."
        />
      </div>
    );
  }

  return (
    <div>
      {/* One page of filtered invoices; click a row to open the sale */}
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all sales on this page"
                checked={allVisibleSelected}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
            </TableHead>
            <TableHead>Sale ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Sale Status</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => {
            const selected = selectedIds.includes(sale.id);
            return (
              <TableRow
                key={sale.id}
                data-state={selected ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => router.push(`/sales/${sale.id}`)}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${sale.invoiceNumber}`}
                    checked={selected}
                    onCheckedChange={(checked) =>
                      toggleOne(sale.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                <TableCell>{customerName(customers, sale.customerId)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(sale.date)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(itemCount(sale))}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(sale.totalAmount)}
                </TableCell>
                <TableCell>{paymentMethodLabel[sale.paymentMethod]}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={paymentStatusLabel[sale.paymentStatus]}
                    tone={paymentStatusTone[sale.paymentStatus]}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={saleStatusLabel[sale.status]}
                    tone={saleStatusTone[sale.status]}
                  />
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${sale.invoiceNumber}`}
                        />
                      }
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-44">
                      <DropdownMenuItem onClick={() => router.push(`/sales/${sale.id}`)}>
                        <Eye />
                        View Details
                      </DropdownMenuItem>
                      {canEditSale(sale) ? (
                        <DropdownMenuItem onClick={() => onEdit(sale)}>
                          <Pencil />
                          Edit Sale
                        </DropdownMenuItem>
                      ) : null}
                      {canCancelSale(sale) ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onCancel(sale)}
                          >
                            <Ban />
                            Cancel Sale
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        noun="sales"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
