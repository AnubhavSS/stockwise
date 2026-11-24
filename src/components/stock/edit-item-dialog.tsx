"use client";

/**
 * Update catalogue fields. Quantity is not edited here — use Adjust Stock.
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
  isProductCategory,
  parseOptionalNumber,
  validateProductForm,
  valuesFromProduct,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/features/stock/validation";
import { useInventoryStore } from "@/store/inventory-store";
import { PRODUCT_CATEGORIES, type Product } from "@/types/inventory";

type EditItemDialogProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function EditItemForm({
  product,
  onOpenChange,
}: {
  product: Product;
  onOpenChange: (open: boolean) => void;
}) {
  const products = useInventoryStore((state) => state.products);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const [values, setValues] = useState<ProductFormValues>(valuesFromProduct(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) {
      return;
    }

    const validated = validateProductForm(values, products, {
      requireQuantity: false,
      excludeProductId: product.id,
    });
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

    const result = updateProduct(product.id, {
      name: values.name,
      sku: values.sku,
      category: values.category,
      description: values.description,
      unitPrice: Number(values.unitPrice),
      costPrice: costPrice.value,
      minimumStockLevel: Number(values.minimumStockLevel),
    });

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(`${result.name} updated.`);
    onOpenChange(false);
  }

  return (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update catalogue details. Quantity is changed with Adjust Stock.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="edit-name" label="Product Name" required error={errors.name}>
              <Input
                id="edit-name"
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
            </FormField>
            <FormField id="edit-sku" label="SKU" required error={errors.sku}>
              <Input
                id="edit-sku"
                value={values.sku}
                onChange={(event) => update("sku", event.target.value)}
                aria-invalid={Boolean(errors.sku)}
              />
            </FormField>
          </div>
          <FormField id="edit-category" label="Category" required error={errors.category}>
            <Select
              value={values.category}
              onValueChange={(value) => {
                if (value) {
                  update("category", value);
                }
              }}
            >
              <SelectTrigger id="edit-category" className="w-full">
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
          <FormField id="edit-description" label="Description">
            <Textarea
              id="edit-description"
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="edit-price" label="Unit Price" required error={errors.unitPrice}>
              <Input
                id="edit-price"
                type="number"
                min={0}
                value={values.unitPrice}
                onChange={(event) => update("unitPrice", event.target.value)}
                aria-invalid={Boolean(errors.unitPrice)}
              />
            </FormField>
            <FormField id="edit-cost" label="Cost Price" error={errors.costPrice}>
              <Input
                id="edit-cost"
                type="number"
                min={0}
                value={values.costPrice}
                onChange={(event) => update("costPrice", event.target.value)}
              />
            </FormField>
          </div>
          <FormField
            id="edit-min"
            label="Minimum Stock Level"
            required
            error={errors.minimumStockLevel}
          >
            <Input
              id="edit-min"
              type="number"
              min={0}
              value={values.minimumStockLevel}
              onChange={(event) => update("minimumStockLevel", event.target.value)}
              aria-invalid={Boolean(errors.minimumStockLevel)}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
  );
}

export function EditItemDialog({ product, open, onOpenChange }: EditItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        {open && product ? (
          <EditItemForm
            key={product.id}
            product={product}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
