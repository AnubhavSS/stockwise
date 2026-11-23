"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { computeAdjustment } from "@/lib/stock-transactions";
import { useInventoryStore } from "@/store/inventory-store";
import type { Product, StockAdjustmentType } from "@/types/inventory";

const ADJUSTMENT_TYPES: Array<{ value: StockAdjustmentType; label: string }> = [
  { value: "add", label: "Add Stock" },
  { value: "remove", label: "Remove Stock" },
  { value: "set", label: "Set New Quantity" },
];

const REASON_PRESETS = [
  "Damaged goods",
  "Physical stock correction",
  "Opening balance correction",
  "Manual stock addition",
];

type AdjustStockDialogProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AdjustStockForm({
  product,
  onOpenChange,
}: {
  product: Product;
  onOpenChange: (open: boolean) => void;
}) {
  const adjustStock = useInventoryStore((state) => state.adjustStock);
  const [type, setType] = useState<StockAdjustmentType>("add");
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) {
      return;
    }

    const parsed = Number(quantity);
    const computed = computeAdjustment(product.quantity, type, parsed);
    if (!computed.ok) {
      setError(computed.error);
      return;
    }
    if (!remarks.trim()) {
      setError("A reason is required for every stock adjustment.");
      return;
    }

    const result = adjustStock({
      productId: product.id,
      type,
      quantity: parsed,
      remarks: remarks.trim(),
    });

    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    const updated = result.products.find((item) => item.id === product.id);
    toast.success(
      `${product.name} is now ${updated?.quantity ?? computed.nextQuantity} units.`,
    );
    onOpenChange(false);
  }

  return (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Record a movement so inventory history stays accurate.
            </DialogDescription>
          </DialogHeader>

          <FormField id="adjust-name" label="Product Name">
            <Input id="adjust-name" value={product?.name ?? ""} readOnly />
          </FormField>
          <p className="text-xs text-muted-foreground">
            Current quantity: {product?.quantity ?? 0}
          </p>

          <FormField id="adjust-type" label="Adjustment Type" required>
            <Select
              value={type}
              onValueChange={(value) => {
                if (value === "add" || value === "remove" || value === "set") {
                  setType(value);
                  setError("");
                }
              }}
            >
              <SelectTrigger id="adjust-type" className="w-full">
                <SelectValue>
                  {ADJUSTMENT_TYPES.find((item) => item.value === type)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="adjust-qty" label="Quantity" required error={error}>
            <Input
              id="adjust-qty"
              type="number"
              min={0}
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value);
                setError("");
              }}
              aria-invalid={Boolean(error)}
            />
          </FormField>

          <FormField id="adjust-reason" label="Reason / Remarks" required>
            <Textarea
              id="adjust-reason"
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value);
                setError("");
              }}
              placeholder="Why is this quantity changing?"
            />
            <div className="flex flex-wrap gap-1.5">
              {REASON_PRESETS.map((reason) => (
                <Button
                  key={reason}
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => setRemarks(reason)}
                >
                  {reason}
                </Button>
              ))}
            </div>
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Adjustment</Button>
          </DialogFooter>
        </form>
  );
}

export function AdjustStockDialog({
  product,
  open,
  onOpenChange,
}: AdjustStockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && product ? (
          <AdjustStockForm
            key={product.id}
            product={product}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
