"use client";

/**
 * Record goods in. Remaining qty is capped; this is the only path that increases stock.
 */
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/stock/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { remainingQuantity } from "@/features/purchase/calculations";
import { formatNumber } from "@/lib/calculations";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import type { Purchase } from "@/types/purchase";

type ReceiveItemsDialogProps = {
  purchase: Purchase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ReceiveForm({
  purchase,
  onOpenChange,
}: {
  purchase: Purchase;
  onOpenChange: (open: boolean) => void;
}) {
  const products = useInventoryStore((state) => state.products);
  const receivePurchaseItems = usePurchaseStore((state) => state.receivePurchaseItems);
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      purchase.items.map((item) => [item.productId, String(remainingQuantity(item))]),
    ),
  );
  const [error, setError] = useState("");

  const lines = useMemo(
    () =>
      purchase.items.map((item) => {
        const remaining = remainingQuantity(item);
        const receiveNow = Number(quantities[item.productId] ?? 0) || 0;
        const product = products.find((entry) => entry.id === item.productId);
        return {
          item,
          product,
          remaining,
          receiveNow,
          after: remaining - receiveNow,
        };
      }),
    [products, purchase.items, quantities],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const receipts = lines
      .filter((line) => line.receiveNow > 0)
      .map((line) => ({
        productId: line.item.productId,
        quantity: line.receiveNow,
      }));

    const result = receivePurchaseItems(purchase.id, receipts);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success(
      result.purchase.status === "received"
        ? `${purchase.purchaseOrderNumber} is fully received.`
        : `Stock updated for ${purchase.purchaseOrderNumber}.`,
    );
    onOpenChange(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Receive Items</DialogTitle>
        <DialogDescription>
          Record goods inward for {purchase.purchaseOrderNumber}. Stock increases only
          by the quantity received now.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        {lines.map((line) => (
          <div
            key={line.item.productId}
            className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-5"
          >
            <div className="sm:col-span-2">
              <p className="text-sm font-medium">{line.product?.name ?? "Product"}</p>
              <p className="text-xs text-muted-foreground">{line.product?.sku ?? "—"}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Ordered {formatNumber(line.item.quantity)}
              <br />
              Received {formatNumber(line.item.receivedQuantity)}
            </p>
            <p className="text-xs text-muted-foreground">
              Remaining {formatNumber(line.remaining)}
              <br />
              After {formatNumber(Math.max(0, line.after))}
            </p>
            <FormField
              id={`recv-${line.item.productId}`}
              label="Receive now"
            >
              <Input
                id={`recv-${line.item.productId}`}
                type="number"
                min={0}
                max={line.remaining}
                value={quantities[line.item.productId] ?? "0"}
                onChange={(event) => {
                  setQuantities((current) => ({
                    ...current,
                    [line.item.productId]: event.target.value,
                  }));
                  setError("");
                }}
              />
            </FormField>
          </div>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit">Receive Stock</Button>
      </DialogFooter>
    </form>
  );
}

export function ReceiveItemsDialog({
  purchase,
  open,
  onOpenChange,
}: ReceiveItemsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {open && purchase ? (
          <ReceiveForm
            key={purchase.id}
            purchase={purchase}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
