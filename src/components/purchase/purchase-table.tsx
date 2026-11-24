"use client";

import { useRouter } from "next/navigation";
import { Ban, Eye, MoreHorizontal, PackageCheck, Pencil } from "lucide-react";

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
import {
  canCancelPurchase,
  canEditPurchase,
  canReceivePurchase,
  orderedQuantity,
  receivedQuantity,
} from "@/features/purchase/calculations";
import { supplierName } from "@/features/purchase/selectors";
import {
  paymentStatusLabel,
  paymentStatusTone,
  purchaseStatusLabel,
  purchaseStatusTone,
} from "@/features/purchase/status";
import { formatCurrency, formatDate, formatNumber } from "@/lib/calculations";
import type { Purchase } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

type PurchaseTableProps = {
  purchases: Purchase[];
  suppliers: Supplier[];
  selectedIds: string[];
  page: number;
  pageSize: number;
  total: number;
  onSelectedIdsChange: (ids: string[]) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (purchase: Purchase) => void;
  onReceive: (purchase: Purchase) => void;
  onCancel: (purchase: Purchase) => void;
};

export function PurchaseTable({
  purchases,
  suppliers,
  selectedIds,
  page,
  pageSize,
  total,
  onSelectedIdsChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onReceive,
  onCancel,
}: PurchaseTableProps) {
  const router = useRouter();
  const visibleIds = purchases.map((purchase) => purchase.id);
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
          title="No purchase orders match these filters"
          description="Try another search or status, or create a new purchase order."
        />
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                aria-label="Select all purchase orders on this page"
                checked={allVisibleSelected}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
            </TableHead>
            <TableHead>Purchase ID</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Expected Date</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => {
            const selected = selectedIds.includes(purchase.id);
            const ordered = orderedQuantity(purchase);
            const received = receivedQuantity(purchase);
            return (
              <TableRow
                key={purchase.id}
                data-state={selected ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => router.push(`/purchase/${purchase.id}`)}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${purchase.purchaseOrderNumber}`}
                    checked={selected}
                    onCheckedChange={(checked) =>
                      toggleOne(purchase.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {purchase.purchaseOrderNumber}
                </TableCell>
                <TableCell>{supplierName(suppliers, purchase.supplierId)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(purchase.date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(purchase.expectedDate)}
                </TableCell>
                <TableCell className="text-right">{formatNumber(ordered)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(purchase.totalAmount)}
                </TableCell>
                <TableCell>
                  {formatNumber(received)}/{formatNumber(ordered)}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={paymentStatusLabel[purchase.paymentStatus]}
                    tone={paymentStatusTone[purchase.paymentStatus]}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge
                    label={purchaseStatusLabel[purchase.status]}
                    tone={purchaseStatusTone[purchase.status]}
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
                          aria-label={`Actions for ${purchase.purchaseOrderNumber}`}
                        />
                      }
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      <DropdownMenuItem
                        onClick={() => router.push(`/purchase/${purchase.id}`)}
                      >
                        <Eye />
                        View Details
                      </DropdownMenuItem>
                      {canReceivePurchase(purchase) ? (
                        <DropdownMenuItem onClick={() => onReceive(purchase)}>
                          <PackageCheck />
                          Receive Items
                        </DropdownMenuItem>
                      ) : null}
                      {canEditPurchase(purchase) ? (
                        <DropdownMenuItem onClick={() => onEdit(purchase)}>
                          <Pencil />
                          Edit Purchase
                        </DropdownMenuItem>
                      ) : null}
                      {canCancelPurchase(purchase) ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onCancel(purchase)}
                          >
                            <Ban />
                            Cancel Purchase
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
        noun="orders"
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
