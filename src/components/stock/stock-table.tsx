"use client";

import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductAvatar } from "@/components/stock/product-avatar";
import { StockPagination } from "@/components/stock/stock-pagination";
import { StockStatusBadge } from "@/components/stock/stock-status-badge";
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
import { getStockStatus } from "@/features/stock/status";
import { calculateStockValue, formatCurrency, formatNumber } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/inventory";

type StockTableProps = {
  products: Product[];
  selectedIds: string[];
  page: number;
  pageSize: number;
  total: number;
  onSelectedIdsChange: (ids: string[]) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEdit: (product: Product) => void;
  onAdjust: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function StockTable({
  products,
  selectedIds,
  page,
  pageSize,
  total,
  onSelectedIdsChange,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onAdjust,
  onDelete,
}: StockTableProps) {
  const router = useRouter();
  const visibleIds = products.map((product) => product.id);
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
          title="No products match these filters"
          description="Try another search, category or stock status, or add a new item."
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
                aria-label="Select all items on this page"
                checked={allVisibleSelected}
                onCheckedChange={(checked) => toggleAll(checked === true)}
              />
            </TableHead>
            <TableHead>Item</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Min. Level</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Stock Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const status = getStockStatus(product);
            const selected = selectedIds.includes(product.id);

            return (
              <TableRow
                key={product.id}
                data-state={selected ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => router.push(`/stock/${product.id}`)}
              >
                <TableCell
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    aria-label={`Select ${product.name}`}
                    checked={selected}
                    onCheckedChange={(checked) =>
                      toggleOne(product.id, checked === true)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductAvatar name={product.name} category={product.category} />
                    <span className="truncate font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    status === "out_of_stock" && "text-destructive",
                    status === "low_stock" && "text-[#C07A16]",
                    status === "in_stock" && "text-success",
                  )}
                >
                  {formatNumber(product.quantity)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatNumber(product.minimumStockLevel)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.unitPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(calculateStockValue(product))}
                </TableCell>
                <TableCell>
                  <StockStatusBadge product={product} />
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
                          aria-label={`Actions for ${product.name}`}
                        />
                      }
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-44">
                      <DropdownMenuItem
                        onClick={() => router.push(`/stock/${product.id}`)}
                      >
                        <Eye />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Pencil />
                        Edit Item
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAdjust(product)}>
                        <SlidersHorizontal />
                        Adjust Stock
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(product)}
                      >
                        <Trash2 />
                        Delete Item
                      </DropdownMenuItem>
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
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
