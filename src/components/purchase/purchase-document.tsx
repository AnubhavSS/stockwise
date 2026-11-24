import { siteConfig } from "@/config/site";
import { orderedQuantity, remainingQuantity } from "@/features/purchase/calculations";
import { supplierName } from "@/features/purchase/selectors";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  purchaseStatusLabel,
} from "@/features/purchase/status";
import { formatCurrency, formatDate, formatDateTime, formatNumber } from "@/lib/calculations";
import type { Product } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";

type PurchaseDocumentProps = {
  purchase: Purchase;
  suppliers: Supplier[];
  products: Product[];
};

export function PurchaseDocument({
  purchase,
  suppliers,
  products,
}: PurchaseDocumentProps) {
  const supplier = suppliers.find((item) => item.id === purchase.supplierId);

  return (
    <section
      id="purchase-order"
      className="rounded-xl border border-border bg-card p-6 text-sm shadow-sm print:border-0 print:shadow-none"
    >
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-muted-foreground">{siteConfig.tagline}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-base font-semibold">{purchase.purchaseOrderNumber}</p>
          <p className="text-muted-foreground">{formatDate(purchase.date)}</p>
          <p className="text-muted-foreground">{purchaseStatusLabel[purchase.status]}</p>
        </div>
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Supplier
          </p>
          <p className="mt-1 font-medium">{supplierName(suppliers, purchase.supplierId)}</p>
          {supplier ? (
            <>
              <p className="text-muted-foreground">{supplier.contactPerson}</p>
              <p className="text-muted-foreground">{supplier.phone}</p>
              <p className="text-muted-foreground">{supplier.email}</p>
              <p className="text-muted-foreground">{supplier.address || supplier.city}</p>
              {supplier.gstin ? (
                <p className="text-muted-foreground">GSTIN {supplier.gstin}</p>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Order details
          </p>
          <p className="mt-1">Expected {formatDate(purchase.expectedDate)}</p>
          <p>{paymentMethodLabel[purchase.paymentMethod]}</p>
          <p>{paymentStatusLabel[purchase.paymentStatus]}</p>
          <p>{formatNumber(orderedQuantity(purchase))} items ordered</p>
        </div>
      </div>

      <table className="mt-6 w-full text-left">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th>
            <th className="py-2 font-medium">SKU</th>
            <th className="py-2 text-right font-medium">Ordered</th>
            <th className="py-2 text-right font-medium">Received</th>
            <th className="py-2 text-right font-medium">Pending</th>
            <th className="py-2 text-right font-medium">Cost</th>
            <th className="py-2 text-right font-medium">Discount</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {purchase.items.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            return (
              <tr
                key={`${purchase.id}-${item.productId}`}
                className="border-b border-border"
              >
                <td className="py-2">{product?.name ?? "Product"}</td>
                <td className="py-2 text-muted-foreground">{product?.sku ?? "—"}</td>
                <td className="py-2 text-right">{formatNumber(item.quantity)}</td>
                <td className="py-2 text-right">{formatNumber(item.receivedQuantity)}</td>
                <td className="py-2 text-right">{formatNumber(remainingQuantity(item))}</td>
                <td className="py-2 text-right">{formatCurrency(item.unitCost)}</td>
                <td className="py-2 text-right">{formatCurrency(item.discount)}</td>
                <td className="py-2 text-right">{formatCurrency(item.lineTotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <dl className="mt-4 ml-auto grid max-w-xs gap-1">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatCurrency(purchase.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Discount</dt>
          <dd>{formatCurrency(purchase.discount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd>{formatCurrency(purchase.tax)}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt>Grand Total</dt>
          <dd>{formatCurrency(purchase.totalAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Amount Paid</dt>
          <dd>{formatCurrency(purchase.amountPaid)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Balance</dt>
          <dd>{formatCurrency(purchase.remainingBalance)}</dd>
        </div>
      </dl>

      {purchase.notes ? (
        <p className="mt-6 text-muted-foreground">Notes: {purchase.notes}</p>
      ) : null}

      {purchase.receipts.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Receiving history
          </p>
          <ul className="mt-2 space-y-1">
            {purchase.receipts.map((receipt) => (
              <li key={receipt.id} className="text-muted-foreground">
                {formatDateTime(receipt.createdAt)} ·{" "}
                {formatNumber(receipt.items.reduce((sum, item) => sum + item.quantity, 0))} units
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-8 text-xs text-muted-foreground">
        Generated by {siteConfig.name} on {formatDate(purchase.createdAt)}.
      </p>
    </section>
  );
}
