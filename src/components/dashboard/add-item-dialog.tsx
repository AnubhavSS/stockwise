"use client";

/**
 * Quick-create product from the dashboard; opening qty is recorded as an adjustment.
 */
import { useState } from "react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryStore } from "@/store/inventory-store";
import type { ProductCategory } from "@/types/inventory";

const CATEGORIES: ProductCategory[] = [
  "Accessories",
  "Cables",
  "Peripherals",
  "Displays",
  "Storage",
];

type AddItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddItemDialog({ open, onOpenChange }: AddItemDialogProps) {
  const addProduct = useInventoryStore((state) => state.addProduct);
  const products = useInventoryStore((state) => state.products);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Accessories");
  const [quantity, setQuantity] = useState("0");
  const [minimumStockLevel, setMinimumStockLevel] = useState("10");
  const [unitPrice, setUnitPrice] = useState("0");

  function reset() {
    setName("");
    setSku("");
    setCategory("Accessories");
    setQuantity("0");
    setMinimumStockLevel("10");
    setUnitPrice("0");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedSku = sku.trim().toUpperCase();
    const duplicate = products.some(
      (product) => product.sku.toLowerCase() === trimmedSku.toLowerCase(),
    );

    if (!name.trim() || !trimmedSku) {
      toast.error("Name and SKU are required.");
      return;
    }

    if (duplicate) {
      toast.error("A product with this SKU already exists.");
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedMin = Number(minimumStockLevel);
    const parsedPrice = Number(unitPrice);

    if ([parsedQuantity, parsedMin, parsedPrice].some((value) => Number.isNaN(value) || value < 0)) {
      toast.error("Quantity, minimum stock and price must be valid numbers.");
      return;
    }

    const result = addProduct({
      name: name.trim(),
      sku: trimmedSku,
      category,
      description: "",
      quantity: parsedQuantity,
      minimumStockLevel: parsedMin,
      unitPrice: parsedPrice,
    });

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(`${name.trim()} added to inventory.`);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add item</DialogTitle>
            <DialogDescription>
              Create a catalogue item. Stock, sales and purchases can use it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Wireless Mouse"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="item-sku">SKU</Label>
              <Input
                id="item-sku"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="WM-001"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="item-category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  if (CATEGORIES.includes(value as ProductCategory)) {
                    setCategory(value as ProductCategory);
                  }
                }}
              >
                <SelectTrigger id="item-category" className="w-full">
                  <SelectValue>{category}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="item-qty">Qty</Label>
                <Input
                  id="item-qty"
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-min">Min</Label>
                <Input
                  id="item-min"
                  type="number"
                  min={0}
                  value={minimumStockLevel}
                  onChange={(event) => setMinimumStockLevel(event.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="item-price">Price</Label>
                <Input
                  id="item-price"
                  type="number"
                  min={0}
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
