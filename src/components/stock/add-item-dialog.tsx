"use client";

/**
 * Create a product. Opening quantity is written as an adjustment movement.
 */
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
import {
  emptyProductForm,
  isProductCategory,
  parseOptionalNumber,
  validateProductForm,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/features/stock/validation";
import { useInventoryStore } from "@/store/inventory-store";
import { PRODUCT_CATEGORIES, type Product } from "@/types/inventory";

type AddItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (product: Product) => void;
};

export function AddItemDialog({
  open,
  onOpenChange,
  onCreated,
}: AddItemDialogProps) {
  const addProduct = useInventoryStore((state) => state.addProduct);
  const products = useInventoryStore((state) => state.products);
  const [values, setValues] = useState<ProductFormValues>(emptyProductForm());
  const [errors, setErrors] = useState<ProductFormErrors>({});

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setValues(emptyProductForm());
      setErrors({});
    }
    onOpenChange(next);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = validateProductForm(values, products, { requireQuantity: true });
    if (!validated.ok) {
      setErrors(validated.errors);
      return;
    }

    if (!isProductCategory(values.category)) {
      setErrors({ category: "Select a valid category." });
      return;
    }

    const costPrice = parseOptionalNumber(values.costPrice, "Cost price");
    if (!costPrice.ok) {
      setErrors({ costPrice: costPrice.error });
      return;
    }

    const result = addProduct({
      name: values.name,
      sku: values.sku,
      category: values.category,
      description: values.description,
      unitPrice: Number(values.unitPrice),
      costPrice: costPrice.value,
      quantity: Number(values.quantity),
      minimumStockLevel: Number(values.minimumStockLevel),
    });

    if ("error" in result) {
      setErrors({ sku: result.error });
      toast.error(result.error);
      return;
    }

    toast.success(`${result.name} added to inventory.`);
    onCreated?.(result);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Add a product to your inventory and start tracking its stock.
            </DialogDescription>
          </DialogHeader>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium">Basic Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="add-name" label="Product Name" required error={errors.name}>
                <Input
                  id="add-name"
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Wireless Mouse"
                  aria-invalid={Boolean(errors.name)}
                />
              </FormField>
              <FormField id="add-sku" label="SKU" required error={errors.sku}>
                <Input
                  id="add-sku"
                  value={values.sku}
                  onChange={(event) => update("sku", event.target.value)}
                  placeholder="WM-001"
                  aria-invalid={Boolean(errors.sku)}
                />
              </FormField>
            </div>
            <FormField id="add-category" label="Category" required error={errors.category}>
              <Select
                value={values.category}
                onValueChange={(value) => {
                  if (value) {
                    update("category", value);
                  }
                }}
              >
                <SelectTrigger id="add-category" className="w-full">
                  <SelectValue>{values.category}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="add-description" label="Description" error={errors.description}>
              <Textarea
                id="add-description"
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Optional product notes"
              />
            </FormField>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium">Pricing</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField id="add-price" label="Unit Price" required error={errors.unitPrice}>
                <Input
                  id="add-price"
                  type="number"
                  min={0}
                  step="1"
                  value={values.unitPrice}
                  onChange={(event) => update("unitPrice", event.target.value)}
                  placeholder="650"
                  aria-invalid={Boolean(errors.unitPrice)}
                />
              </FormField>
              <FormField id="add-cost" label="Cost Price" error={errors.costPrice}>
                <Input
                  id="add-cost"
                  type="number"
                  min={0}
                  step="1"
                  value={values.costPrice}
                  onChange={(event) => update("costPrice", event.target.value)}
                  placeholder="400"
                />
              </FormField>
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium">Stock Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                id="add-qty"
                label="Opening Quantity"
                required
                error={errors.quantity}
              >
                <Input
                  id="add-qty"
                  type="number"
                  min={0}
                  value={values.quantity}
                  onChange={(event) => update("quantity", event.target.value)}
                  aria-invalid={Boolean(errors.quantity)}
                />
              </FormField>
              <FormField
                id="add-min"
                label="Minimum Stock Level"
                required
                error={errors.minimumStockLevel}
              >
                <Input
                  id="add-min"
                  type="number"
                  min={0}
                  value={values.minimumStockLevel}
                  onChange={(event) => update("minimumStockLevel", event.target.value)}
                  aria-invalid={Boolean(errors.minimumStockLevel)}
                />
              </FormField>
            </div>
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
