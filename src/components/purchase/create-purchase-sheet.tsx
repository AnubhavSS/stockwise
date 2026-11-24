"use client";

import { useMemo, useState } from "react";
import { PackagePlus, Plus, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

import { AddSupplierDialog } from "@/components/purchase/add-supplier-dialog";
import { AddItemDialog } from "@/components/stock/add-item-dialog";
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
  calculatePurchaseLineTotal,
  calculatePurchaseTotals,
  GST_RATE,
} from "@/features/purchase/calculations";
import { paymentMethodLabel, paymentStatusLabel } from "@/features/purchase/status";
import { APP_NOW_ISO } from "@/lib/constants";
import { formatCurrency, formatNumber, getActiveProducts } from "@/lib/calculations";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import type { Purchase, PurchaseItem } from "@/types/purchase";
import { PAYMENT_METHODS, type PaymentMethod, type PaymentStatus } from "@/types/sales";

type LineState = {
  key: string;
  productId: string;
  quantity: number;
  unitCost: number;
  discount: number;
};

function emptyLine(): LineState {
  return {
    key: crypto.randomUUID(),
    productId: "",
    quantity: 1,
    unitCost: 0,
    discount: 0,
  };
}

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

function defaultExpectedDate(iso: string): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + 7);
  return toDateInput(date.toISOString());
}

type CreatePurchaseSheetProps = {
  open: boolean;
  purchase?: Purchase | null;
  onOpenChange: (open: boolean) => void;
};

function CreatePurchaseForm({
  purchase,
  onOpenChange,
}: {
  purchase?: Purchase | null;
  onOpenChange: (open: boolean) => void;
}) {
  const products = useInventoryStore((state) => state.products);
  const suppliers = usePurchaseStore((state) => state.suppliers);
  const createPurchase = usePurchaseStore((state) => state.createPurchase);
  const updatePurchase = usePurchaseStore((state) => state.updatePurchase);
  const catalog = getActiveProducts(products);
  const lockedProducts = Boolean(
    purchase && purchase.items.some((item) => item.receivedQuantity > 0),
  );

  const [supplierId, setSupplierId] = useState(purchase?.supplierId ?? "");
  const [lines, setLines] = useState<LineState[]>(
    purchase?.items.map((item) => ({
      key: crypto.randomUUID(),
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      discount: item.discount,
    })) ?? [emptyLine()],
  );
  const [taxRate, setTaxRate] = useState(purchase?.taxRate ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    purchase?.paymentMethod ?? "bank_transfer",
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    purchase?.paymentStatus ?? "unpaid",
  );
  const [amountPaid, setAmountPaid] = useState(String(purchase?.amountPaid ?? 0));
  const [date, setDate] = useState(toDateInput(purchase?.date ?? APP_NOW_ISO));
  const [expectedDate, setExpectedDate] = useState(
    toDateInput(purchase?.expectedDate ?? defaultExpectedDate(APP_NOW_ISO)),
  );
  const [notes, setNotes] = useState(purchase?.notes ?? "");
  const [error, setError] = useState("");
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId);

  const lineItems: PurchaseItem[] = useMemo(
    () =>
      lines
        .filter((line) => line.productId)
        .map((line) => {
          const previous = purchase?.items.find((item) => item.productId === line.productId);
          return {
            productId: line.productId,
            quantity: line.quantity,
            unitCost: line.unitCost,
            discount: line.discount,
            lineTotal: calculatePurchaseLineTotal(
              line.quantity,
              line.unitCost,
              line.discount,
            ),
            receivedQuantity: previous?.receivedQuantity ?? 0,
          };
        }),
    [lines, purchase?.items],
  );

  const totals = useMemo(
    () =>
      calculatePurchaseTotals({
        items: lineItems,
        taxRate,
        paymentStatus,
        amountPaid: Number(amountPaid) || 0,
      }),
    [amountPaid, lineItems, paymentStatus, taxRate],
  );

  function updateLine(key: string, patch: Partial<LineState>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
    setError("");
  }

  function validate(): string | null {
    if (!supplierId) {
      return "Select a supplier.";
    }
    if (lineItems.length === 0) {
      return "Add at least one product.";
    }
    for (const line of lines.filter((item) => item.productId)) {
      const received =
        purchase?.items.find((item) => item.productId === line.productId)?.receivedQuantity ?? 0;
      if (line.quantity < 1) {
        return "Quantity must be at least 1.";
      }
      if (line.quantity < received) {
        return "Ordered quantity cannot be lower than the quantity already received.";
      }
      if (line.unitCost < 0) {
        return "Unit cost cannot be negative.";
      }
      const maxDiscount = line.unitCost * line.quantity;
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
    if (paymentStatus === "paid" && totals.totalAmount < 0) {
      return "Grand total is invalid.";
    }
    return null;
  }

  function payload() {
    return {
      supplierId,
      items: lineItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        discount: item.discount,
        receivedQuantity: item.receivedQuantity,
      })),
      taxRate,
      paymentMethod,
      paymentStatus: totals.paymentStatus,
      amountPaid: totals.amountPaid,
      date: new Date(`${date}T10:00:00.000Z`).toISOString(),
      expectedDate: new Date(`${expectedDate}T10:00:00.000Z`).toISOString(),
      notes,
    };
  }

  function handleSave(asDraft: boolean) {
    const message = validate();
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }

    if (purchase) {
      const updated = updatePurchase(purchase.id, payload());
      if (!updated.ok) {
        toast.error(updated.error);
        return;
      }
      toast.success(`${updated.purchase.purchaseOrderNumber} updated.`);
      onOpenChange(false);
      return;
    }

    const created = createPurchase(payload(), asDraft);
    if (!created.ok) {
      toast.error(created.error);
      setError(created.error);
      return;
    }
    toast.success(
      asDraft
        ? `${created.purchase.purchaseOrderNumber} saved as draft.`
        : `${created.purchase.purchaseOrderNumber} created. Stock will update when items are received.`,
    );
    onOpenChange(false);
  }

  return (
    <>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave(false);
        }}
      >
        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-4 py-2">
          <section className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Supplier</h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSupplierOpen(true)}
              >
                <Truck />
                Add supplier
              </Button>
            </div>
            <FormField id="po-supplier" label="Supplier" required>
              <Select
                value={supplierId}
                onValueChange={(value) => {
                  if (value) {
                    setSupplierId(value);
                  }
                }}
              >
                <SelectTrigger id="po-supplier" className="w-full">
                  <SelectValue>
                    {selectedSupplier?.name ?? "Select supplier"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {suppliers
                    .filter((supplier) => supplier.status === "active")
                    .map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>
            {selectedSupplier ? (
              <p className="text-xs text-muted-foreground">
                {selectedSupplier.contactPerson} · {selectedSupplier.phone}
                {selectedSupplier.email ? ` · ${selectedSupplier.email}` : ""}
                {selectedSupplier.address ? ` · ${selectedSupplier.address}` : ""}
              </p>
            ) : null}
          </section>

          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Products</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setProductOpen(true)}
                >
                  <PackagePlus />
                  New product
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={lockedProducts}
                  onClick={() => setLines((current) => [...current, emptyLine()])}
                >
                  <Plus />
                  Add product
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {lines.map((line) => {
                const product = catalog.find((item) => item.id === line.productId);
                const received =
                  purchase?.items.find((item) => item.productId === line.productId)
                    ?.receivedQuantity ?? 0;
                const subtotal = calculatePurchaseLineTotal(
                  line.quantity,
                  line.unitCost,
                  line.discount,
                );
                const usedIds = lines
                  .filter((item) => item.key !== line.key)
                  .map((item) => item.productId);
                const options = catalog.filter(
                  (item) => item.id === line.productId || !usedIds.includes(item.id),
                );

                return (
                  <div
                    key={line.key}
                    className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1.4fr_repeat(5,minmax(0,0.7fr))_auto]"
                  >
                    <FormField id={`pp-${line.key}`} label="Product" required>
                      <Select
                        value={line.productId}
                        disabled={lockedProducts}
                        onValueChange={(value) => {
                          if (!value) {
                            return;
                          }
                          const next = catalog.find((item) => item.id === value);
                          updateLine(line.key, {
                            productId: value,
                            unitCost: next?.costPrice ?? next?.unitPrice ?? 0,
                            quantity: 1,
                          });
                        }}
                      >
                        <SelectTrigger id={`pp-${line.key}`} className="w-full">
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
                    <FormField id={`psku-${line.key}`} label="SKU">
                      <Input id={`psku-${line.key}`} value={product?.sku ?? "—"} readOnly />
                    </FormField>
                    <FormField id={`pstock-${line.key}`} label="Stock">
                      <Input
                        id={`pstock-${line.key}`}
                        value={product ? formatNumber(product.quantity) : "—"}
                        readOnly
                      />
                    </FormField>
                    <FormField id={`pqty-${line.key}`} label="Qty" required>
                      <Input
                        id={`pqty-${line.key}`}
                        type="number"
                        min={Math.max(1, received)}
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(line.key, {
                            quantity: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </FormField>
                    <FormField id={`pcost-${line.key}`} label="Unit Cost" required>
                      <Input
                        id={`pcost-${line.key}`}
                        type="number"
                        min={0}
                        value={line.unitCost}
                        onChange={(event) =>
                          updateLine(line.key, {
                            unitCost: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </FormField>
                    <FormField id={`pdisc-${line.key}`} label="Discount">
                      <Input
                        id={`pdisc-${line.key}`}
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
                        disabled={lockedProducts || lines.length === 1}
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
                      <p className="text-xs text-muted-foreground sm:col-span-7">
                        Warehouse {formatNumber(product.quantity)}
                        {received > 0 ? ` · Already received ${formatNumber(received)}` : ""}
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
            <FormField id="po-tax" label="Tax">
              <Select
                value={String(taxRate)}
                onValueChange={(value) => {
                  if (value) {
                    setTaxRate(Number(value));
                  }
                }}
              >
                <SelectTrigger id="po-tax" className="w-full">
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
            <FormField id="po-method" label="Payment Method" required>
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
                <SelectTrigger id="po-method" className="w-full">
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
            <FormField id="po-pay-status" label="Payment Status" required>
              <Select
                value={paymentStatus}
                onValueChange={(value) => {
                  if (value === "paid" || value === "partial" || value === "unpaid") {
                    setPaymentStatus(value);
                    setError("");
                  }
                }}
              >
                <SelectTrigger id="po-pay-status" className="w-full">
                  <SelectValue>{paymentStatusLabel[paymentStatus]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">{paymentStatusLabel.paid}</SelectItem>
                  <SelectItem value="partial">{paymentStatusLabel.partial}</SelectItem>
                  <SelectItem value="unpaid">{paymentStatusLabel.unpaid}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="po-paid" label="Amount Paid">
              <Input
                id="po-paid"
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
            <FormField id="po-balance" label="Remaining Balance">
              <Input
                id="po-balance"
                value={formatCurrency(totals.remainingBalance)}
                readOnly
              />
            </FormField>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <FormField id="po-date" label="Purchase Order Date" required>
              <Input
                id="po-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </FormField>
            <FormField id="po-expected" label="Expected Delivery Date" required>
              <Input
                id="po-expected"
                type="date"
                value={expectedDate}
                onChange={(event) => setExpectedDate(event.target.value)}
              />
            </FormField>
            <FormField id="po-notes" label="Notes" className="sm:col-span-2">
              <Textarea
                id="po-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional remarks for this purchase order"
              />
            </FormField>
          </section>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <SheetFooter className="border-t bg-muted/40">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {purchase ? (
            <Button type="submit">Save Changes</Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => handleSave(true)}>
                Save as Draft
              </Button>
              <Button type="submit">Create Purchase Order</Button>
            </>
          )}
        </SheetFooter>
      </form>
      <AddSupplierDialog
        open={supplierOpen}
        onOpenChange={setSupplierOpen}
        onCreated={(supplier) => setSupplierId(supplier.id)}
      />
      <AddItemDialog
        open={productOpen}
        onOpenChange={setProductOpen}
        onCreated={(product) =>
          setLines((current) => {
            const blank = current.find((line) => !line.productId);
            if (blank) {
              return current.map((line) =>
                line.key === blank.key
                  ? {
                      ...line,
                      productId: product.id,
                      unitCost: product.costPrice ?? product.unitPrice,
                    }
                  : line,
              );
            }
            return [
              ...current,
              {
                ...emptyLine(),
                productId: product.id,
                unitCost: product.costPrice ?? product.unitPrice,
              },
            ];
          })
        }
      />
    </>
  );
}

export function CreatePurchaseSheet({
  open,
  purchase,
  onOpenChange,
}: CreatePurchaseSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-4xl"
        showCloseButton
      >
        <SheetHeader className="border-b">
          <SheetTitle>{purchase ? "Edit Purchase" : "Create Purchase"}</SheetTitle>
          <SheetDescription>
            Add supplier, products and payment details. Stock increases only when goods are
            received.
          </SheetDescription>
        </SheetHeader>
        {open ? (
          <CreatePurchaseForm
            key={purchase?.id ?? "new-purchase"}
            purchase={purchase}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
