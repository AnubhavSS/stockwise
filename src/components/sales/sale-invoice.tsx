import { siteConfig } from "@/config/site";
import { itemCount } from "@/features/sales/calculations";
import { customerName } from "@/features/sales/selectors";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  saleStatusLabel,
} from "@/features/sales/status";
import { formatCurrency, formatDate, formatNumber } from "@/lib/calculations";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/inventory";
import type { Sale } from "@/types/sales";

type SaleInvoiceProps = {
  sale: Sale;
  customers: Customer[];
  products: Product[];
};

export function SaleInvoice({ sale, customers, products }: SaleInvoiceProps) {
  const customer = customers.find((item) => item.id === sale.customerId);

  return (
    <section
      id="sale-invoice"
      className="rounded-xl border border-border bg-card p-6 text-sm shadow-sm print:border-0 print:shadow-none"
    >
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="text-muted-foreground">{siteConfig.tagline}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-base font-semibold">{sale.invoiceNumber}</p>
          <p className="text-muted-foreground">{formatDate(sale.date)}</p>
          <p className="text-muted-foreground">{saleStatusLabel[sale.status]}</p>
        </div>
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Bill to
          </p>
          <p className="mt-1 font-medium">
            {customerName(customers, sale.customerId)}
          </p>
          {customer ? (
            <>
              <p className="text-muted-foreground">{customer.contactPerson}</p>
              <p className="text-muted-foreground">{customer.phone}</p>
              <p className="text-muted-foreground">{customer.city}</p>
              {customer.gstin ? (
                <p className="text-muted-foreground">GSTIN {customer.gstin}</p>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Payment
          </p>
          <p className="mt-1">{paymentMethodLabel[sale.paymentMethod]}</p>
          <p>{paymentStatusLabel[sale.paymentStatus]}</p>
          <p>{formatNumber(itemCount(sale))} items</p>
        </div>
      </div>

      <table className="mt-6 w-full text-left">
        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th>
            <th className="py-2 font-medium">SKU</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Price</th>
            <th className="py-2 text-right font-medium">Discount</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            return (
              <tr key={`${sale.id}-${item.productId}`} className="border-b border-border">
                <td className="py-2">{product?.name ?? "Product"}</td>
                <td className="py-2 text-muted-foreground">{product?.sku ?? "—"}</td>
                <td className="py-2 text-right">{formatNumber(item.quantity)}</td>
                <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
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
          <dd>{formatCurrency(sale.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Discount</dt>
          <dd>{formatCurrency(sale.discount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tax</dt>
          <dd>{formatCurrency(sale.tax)}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt>Grand Total</dt>
          <dd>{formatCurrency(sale.totalAmount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Amount Paid</dt>
          <dd>{formatCurrency(sale.amountPaid)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Balance</dt>
          <dd>{formatCurrency(sale.remainingBalance)}</dd>
        </div>
      </dl>

      {sale.notes ? (
        <p className="mt-6 text-muted-foreground">Notes: {sale.notes}</p>
      ) : null}
      <p className="mt-8 text-xs text-muted-foreground">
        Generated by {siteConfig.name} on {formatDate(sale.createdAt)}.
      </p>
    </section>
  );
}
