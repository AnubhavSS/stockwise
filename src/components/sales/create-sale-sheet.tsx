"use client";

/**
 * Create or edit a draft, or complete immediately (which deducts stock).
 */
import { useMemo, useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AddCustomerDialog } from "@/components/sales/add-customer-dialog";
import { FormField } from "@/components/stock/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateSaleLineTotal,
  calculateSaleTotals,
  GST_RATE,
} from "@/features/sales/calculations";
import { paymentMethodLabel, paymentStatusLabel } from "@/features/sales/status";
import { APP_NOW_ISO } from "@/lib/constants";
import { formatCurrency, formatNumber } from "@/lib/calculations";
import { getActiveProducts } from "@/lib/calculations";
import { useInventoryStore } from "@/store/inventory-store";
import { useSalesStore } from "@/store/sales-store";
import {
  PAYMENT_METHODS,
  WALK_IN_CUSTOMER_ID,
  type PaymentMethod,
  type PaymentStatus,
  type Sale,
  type SaleItem,
} from "@/types/sales";

type LineState = {
  key: string;
  productId: string;
  quantity: number;
  discount: number;
};

function emptyLine(): LineState {
  return {
    key: crypto.randomUUID(),
    productId: "",
    quantity: 1,
    discount: 0,
  };
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

type CreateSaleSheetProps = {
  open: boolean;
  sale?: Sale | null;
  onOpenChange: (open: boolean) => void;
};

function CreateSaleForm({
  sale,
  onOpenChange,
}: {
  sale?: Sale | null;
  onOpenChange: (open: boolean) => void;
}) {
  const products = useInventoryStore((state) => state.products);
  const customers = useSalesStore((state) => state.customers);
  const createSale = useSalesStore((state) => state.createSale);
  const updateSale = useSalesStore((state) => state.updateSale);
  const completeSale = useSalesStore((state) => state.completeSale);

  const catalog = getActiveProducts(products);
  const [customerId, setCustomerId] = useState(
    sale?.customerId ?? WALK_IN_CUSTOMER_ID,
  );
  const [lines, setLines] = useState<LineState[]>(
    sale?.items.map((item) => ({
      key: crypto.randomUUID(),
      productId: item.productId,
      quantity: item.quantity,
      discount: item.discount,
    })) ?? [emptyLine()],
  );
  const [taxRate, setTaxRate] = useState(sale?.taxRate ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    sale?.paymentMethod ?? "upi",
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    sale?.paymentStatus ?? "paid",
  );
  const [amountPaid, setAmountPaid] = useState(String(sale?.amountPaid ?? 0));
  const [date, setDate] = useState(toDateInput(sale?.date ?? APP_NOW_ISO));
  const [notes, setNotes] = useState(sale?.notes ?? "");
  const [error, setError] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);

  const selectedCustomer = customers.find((customer) => customer.id === customerId);

  const lineItems: SaleItem[] = useMemo(
    () =>
      lines
        .filter((line) => line.productId)
        .map((line) => {
          const product = catalog.find((item) => item.id === line.productId);
          const unitPrice = product?.unitPrice ?? 0;
          return {
            productId: line.productId,
            quantity: line.quantity,
            unitPrice,
            discount: line.discount,
            lineTotal: calculateSaleLineTotal(line.quantity, unitPrice, line.discount),
          };
        }),
    [catalog, lines],
  );

  const totals = useMemo(
    () =>
      calculateSaleTotals({
        items: lineItems,
        taxRate,
        paymentStatus,
        amountPaid: Number(amountPaid) || 0,
      }),
    [amountPaid, lineItems, paymentStatus, taxRate],
  );

  function availableFor(productId: string, lineKey: string): number {
    const product = catalog.find((item) => item.id === productId);
    if (!product) {
      return 0;
    }
    const usedElsewhere = lines
      .filter((line) => line.key !== lineKey && line.productId === productId)
      .reduce((sum, line) => sum + line.quantity, 0);
    return Math.max(0, product.quantity - usedElsewhere);
  }

  function updateLine(key: string, patch: Partial<LineState>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
    setError("");
  }

  function validate(): string | null {
    if (!customerId) {
      return "Select a customer.";
    }
    if (lineItems.length === 0) {
      return "Add at least one product.";
    }
    for (const line of lines.filter((item) => item.productId)) {
      const available = availableFor(line.productId, line.key);
      if (line.quantity < 1) {
        return "Quantity must be at least 1.";
      }
      if (line.quantity > available) {
        const product = catalog.find((item) => item.id === line.productId);
        return `Only ${available} units of ${product?.name ?? "this item"} are available.`;
      }
      const product = catalog.find((item) => item.id === line.productId);
      const maxDiscount = (product?.unitPrice ?? 0) * line.quantity;
      if (line.discount < 0 || line.discount > maxDiscount) {
        return "Discount cannot exceed the line value.";
      }
    }
    if (paymentStatus === "partial") {
      const paid = Number(amountPaid);
      if (!Number.isFinite(paid) || paid <= 0) {
        return "Enter the amount paid for a partial payment.";
      }
      if (paid >= totals.totalAmount) {
        return "Partial payments must be less than the grand total.";
      }
    }
    return null;
  }

  function payload() {
    return {
      customerId,
      items: lineItems,
      taxRate,
      paymentMethod,
      paymentStatus: totals.paymentStatus,
      amountPaid: totals.amountPaid,
      date: new Date(`${date}T10:00:00.000Z`).toISOString(),
      notes,
    };
  }

  function handleSave(complete: boolean) {
    const message = validate();
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }

    if (sale) {
      const updated = updateSale(sale.id, payload());
      if (!updated.ok) {
        toast.error(updated.error);
        return;
      }
      if (complete) {
        const finished = completeSale(updated.sale.id);
        if (!finished.ok) {
          toast.error(finished.error);
          return;
        }
        toast.success(`${finished.sale.invoiceNumber} completed.`);
      } else {
        toast.success(`${updated.sale.invoiceNumber} saved as draft.`);
      }
      onOpenChange(false);
      return;
    }

    const created = createSale(payload(), complete);
    if (!created.ok) {
      toast.error(created.error);
      setError(created.error);
      return;
    }
    toast.success(
      complete
        ? `${created.sale.invoiceNumber} completed and stock updated.`
        : `${created.sale.invoiceNumber} saved as draft.`,
    );
    onOpenChange(false);
  }

  const sellable = catalog.filter((product) => product.quantity > 0);

  return (
    <>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave(true);
        }}
      >
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-4 py-2">
          <section className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Customer</h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setCustomerOpen(true)}
              >
                <UserPlus />
                Add customer
              </Button>
            </div>
            <FormField id="sale-customer" label="Customer" required>
              <Select
                value={customerId}
                onValueChange={(value) => {
                  if (value) {
                    setCustomerId(value);
                  }
                }}
              >
                <SelectTrigger id="sale-customer" className="w-full">
                  <SelectValue>
                    {selectedCustomer?.name ?? "Select customer"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers
                    .filter((customer) => customer.status === "active")
                    .map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
            {selectedCustomer ? (
              <p className="text-xs text-muted-foreground">
                {selectedCustomer.phone} · {selectedCustomer.city}
                {selectedCustomer.email ? ` · ${selectedCustomer.email}` : ""}
              </p>
            ) : null}
          </section>

          <section className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Products</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setLines((current) => [...current, emptyLine()])}
              >
                <Plus />
                Add product
              </Button>
            </div>
            <div className="space-y-3">
              {lines.map((line) => {
                const product = catalog.find((item) => item.id === line.productId);
                const available = line.productId
                  ? availableFor(line.productId, line.key)
                  : 0;
                const unitPrice = product?.unitPrice ?? 0;
                const subtotal = calculateSaleLineTotal(
                  line.quantity,
                  unitPrice,
                  line.discount,
                );
                const usedIds = lines
                  .filter((item) => item.key !== line.key)
                  .map((item) => item.productId);
                const options = sellable.filter(
                  (item) => item.id === line.productId || !usedIds.includes(item.id),
                );

                return (
                  <div
                    key={line.key}
                    className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1.4fr_repeat(4,minmax(0,0.7fr))_auto]"
                  >
                    <FormField id={`p-${line.key}`} label="Product" required>
                      <Select
                        value={line.productId}
                        onValueChange={(value) => {
                          if (value) {
                            updateLine(line.key, { productId: value, quantity: 1 });
                          }
                        }}
                      >
                        <SelectTrigger id={`p-${line.key}`} className="w-full">
                          <SelectValue>
                            {product?.name ?? "Select product"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField id={`sku-${line.key}`} label="SKU">
                      <Input id={`sku-${line.key}`} value={product?.sku ?? "—"} readOnly />
                    </FormField>
                    <FormField id={`stock-${line.key}`} label="Stock">
                      <Input
                        id={`stock-${line.key}`}
                        value={line.productId ? String(available) : "—"}
                        readOnly
                      />
                    </FormField>
                    <FormField id={`qty-${line.key}`} label="Qty" required>
                      <Input
                        id={`qty-${line.key}`}
                        type="number"
                        min={1}
                        max={available || undefined}
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(line.key, {
                            quantity: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </FormField>
                    <FormField id={`disc-${line.key}`} label="Discount">
                      <Input
                        id={`disc-${line.key}`}
                        type="number"
                        min={0}
                        value={line.discount}
                        onChange={(event) =>
                          updateLine(line.key, {
                            discount: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </FormField>
                    <div className="flex items-end justify-between gap-2 sm:flex-col sm:items-end">
                      <p className="text-sm font-medium">{formatCurrency(subtotal)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove product"
                        onClick={() =>
                          setLines((current) =>
                            current.length === 1
                              ? [emptyLine()]
                              : current.filter((item) => item.key !== line.key),
                          )
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    {product ? (
                      <p className="text-xs text-muted-foreground sm:col-span-6">
                        Unit price {formatCurrency(unitPrice)} · {formatNumber(product.quantity)} in warehouse
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>{formatCurrency(totals.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Grand Total</span>
                <span>{formatCurrency(totals.totalAmount)}</span>
              </div>
            </div>
            <FormField id="sale-tax" label="Tax">
              <Select
                value={String(taxRate)}
                onValueChange={(value) => {
                  if (value) {
                    setTaxRate(Number(value));
                  }
                }}
              >
                <SelectTrigger id="sale-tax" className="w-full">
                  <SelectValue>{taxRate === GST_RATE ? "GST 18%" : "No tax"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No tax</SelectItem>
                  <SelectItem value={String(GST_RATE)}>GST 18%</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <h3 className="text-sm font-medium sm:col-span-2">Payment</h3>
            <FormField id="sale-method" label="Payment Method" required>
              <Select
                value={paymentMethod}
                onValueChange={(value) => {
                  if (
                    value === "cash" ||
                    value === "upi" ||
                    value === "card" ||
                    value === "bank_transfer"
                  ) {
                    setPaymentMethod(value);
                  }
                }}
              >
                <SelectTrigger id="sale-method" className="w-full">
                  <SelectValue>{paymentMethodLabel[paymentMethod]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {paymentMethodLabel[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="sale-pay-status" label="Payment Status" required>
              <Select
                value={paymentStatus}
                onValueChange={(value) => {
                  if (value === "paid" || value === "partial" || value === "unpaid") {
                    setPaymentStatus(value);
                    setError("");
                  }
                }}
              >
                <SelectTrigger id="sale-pay-status" className="w-full">
                  <SelectValue>{paymentStatusLabel[paymentStatus]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">{paymentStatusLabel.paid}</SelectItem>
                  <SelectItem value="partial">{paymentStatusLabel.partial}</SelectItem>
                  <SelectItem value="unpaid">{paymentStatusLabel.unpaid}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="sale-paid" label="Amount Paid">
              <Input
                id="sale-paid"
                type="number"
                min={0}
                max={totals.totalAmount}
                value={
                  paymentStatus === "paid"
                    ? totals.totalAmount
                    : paymentStatus === "unpaid"
                      ? 0
                      : amountPaid
                }
                disabled={paymentStatus !== "partial"}
                onChange={(event) => setAmountPaid(event.target.value)}
              />
            </FormField>
            <FormField id="sale-balance" label="Remaining Balance">
              <Input
                id="sale-balance"
                value={formatCurrency(totals.remainingBalance)}
                readOnly
              />
            </FormField>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <FormField id="sale-date" label="Sale Date" required>
              <Input
                id="sale-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </FormField>
            <FormField id="sale-notes" label="Notes" className="sm:col-span-2">
              <Textarea
                id="sale-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional remarks for this invoice"
              />
            </FormField>
          </section>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="border-t bg-muted/40">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={() => handleSave(false)}>
            Save as Draft
          </Button>
          <Button type="submit">Complete Sale</Button>
        </SheetFooter>
      </form>
      <AddCustomerDialog
        open={customerOpen}
        onOpenChange={setCustomerOpen}
        onCreated={(customer) => setCustomerId(customer.id)}
      />
    </>
  );
}

export function CreateSaleSheet({ open, sale, onOpenChange }: CreateSaleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-4xl"
        showCloseButton
      >
        <SheetHeader className="border-b">
          <SheetTitle>{sale ? "Edit Sale" : "Create Sale"}</SheetTitle>
          <SheetDescription>
            Add products, collect payment and complete the invoice. Stock is deducted only when the sale is completed.
          </SheetDescription>
        </SheetHeader>
        {open ? (
          <CreateSaleForm
            key={sale?.id ?? "new-sale"}
            sale={sale}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
