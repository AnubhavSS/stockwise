"use client";

/**
 * Sales and purchases that referenced this product.
 */
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatNumber } from "@/lib/calculations";
import type { Customer } from "@/types/customer";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sales";
import type { Supplier } from "@/types/supplier";

type ProductTransactionsProps = {
  productId: string;
  sales: Sale[];
  purchases: Purchase[];
  customers: Customer[];
  suppliers: Supplier[];
};

export function ProductTransactions({
  productId,
  sales,
  purchases,
  customers,
  suppliers,
}: ProductTransactionsProps) {
  const relatedSales = sales.filter((sale) =>
    sale.items.some((item) => item.productId === productId),
  );
  const relatedPurchases = purchases.filter((purchase) =>
    purchase.items.some((item) => item.productId === productId),
  );

  if (relatedSales.length === 0 && relatedPurchases.length === 0) {
    return (
      <EmptyState
        title="No sales or purchases yet"
        description="When this product is sold or received, those documents will be listed here."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Sales</h3>
        {relatedSales.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales recorded for this item.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedSales.slice(0, 12).map((sale) => {
                  const item = sale.items.find((entry) => entry.productId === productId);
                  const customer = customers.find((entry) => entry.id === sale.customerId);
                  return (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                      <TableCell>{customer?.name ?? "Customer"}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item?.quantity ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item?.lineTotal ?? 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={sale.status.replace("_", " ")}
                          tone={sale.status === "cancelled" ? "danger" : "info"}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
      <section className="space-y-3">
        <h3 className="text-sm font-medium">Purchases</h3>
        {relatedPurchases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No purchase orders recorded for this item.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Purchase Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedPurchases.slice(0, 12).map((purchase) => {
                  const item = purchase.items.find((entry) => entry.productId === productId);
                  const supplier = suppliers.find((entry) => entry.id === purchase.supplierId);
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">
                        {purchase.purchaseOrderNumber}
                      </TableCell>
                      <TableCell>{supplier?.name ?? "Supplier"}</TableCell>
                      <TableCell>
                        {formatDate(purchase.receivedDate ?? purchase.expectedDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(item?.quantity ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item?.lineTotal ?? 0)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={purchase.status.replaceAll("_", " ")}
                          tone={
                            purchase.status === "cancelled" ? "danger" : "success"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
