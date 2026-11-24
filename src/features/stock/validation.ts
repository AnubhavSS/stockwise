/** Add/edit product form parsing. SKU must be unique; cost price is optional. */
import { skuExists } from "@/features/stock/selectors";
import type { Product, ProductCategory } from "@/types/inventory";
import { PRODUCT_CATEGORIES } from "@/types/inventory";

export type ProductFormValues = {
  name: string;
  sku: string;
  category: string;
  description: string;
  unitPrice: string;
  costPrice: string;
  quantity: string;
  minimumStockLevel: string;
};

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export function emptyProductForm(overrides?: Partial<ProductFormValues>): ProductFormValues {
  return {
    name: "",
    sku: "",
    category: "Accessories",
    description: "",
    unitPrice: "",
    costPrice: "",
    quantity: "0",
    minimumStockLevel: "10",
    ...overrides,
  };
}

export function valuesFromProduct(product: Product): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    description: product.description,
    unitPrice: String(product.unitPrice),
    costPrice: product.costPrice === undefined ? "" : String(product.costPrice),
    quantity: String(product.quantity),
    minimumStockLevel: String(product.minimumStockLevel),
  };
}

function parseRequiredNumber(value: string, label: string): { ok: true; value: number } | { ok: false; error: string } {
  if (value.trim() === "") {
    return { ok: false, error: `${label} is required.` };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: `${label} must be a valid number.` };
  }
  if (parsed < 0) {
    return { ok: false, error: `${label} cannot be negative.` };
  }

  return { ok: true, value: parsed };
}

export function parseOptionalNumber(value: string, label: string): { ok: true; value?: number } | { ok: false; error: string } {
  if (value.trim() === "") {
    return { ok: true };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { ok: false, error: `${label} must be a valid non-negative number.` };
  }

  return { ok: true, value: parsed };
}

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory);
}

export function validateProductForm(
  values: ProductFormValues,
  products: Product[],
  options: { requireQuantity: boolean; excludeProductId?: string },
): { ok: true; values: ProductFormValues } | { ok: false; errors: ProductFormErrors } {
  const errors: ProductFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Product name is required.";
  }

  if (!values.sku.trim()) {
    errors.sku = "SKU is required.";
  } else if (skuExists(products, values.sku, options.excludeProductId)) {
    errors.sku = "A product with this SKU already exists.";
  }

  if (!isProductCategory(values.category)) {
    errors.category = "Select a valid category.";
  }

  const unitPrice = parseRequiredNumber(values.unitPrice, "Unit price");
  if (!unitPrice.ok) {
    errors.unitPrice = unitPrice.error;
  }

  const costPrice = parseOptionalNumber(values.costPrice, "Cost price");
  if (!costPrice.ok) {
    errors.costPrice = costPrice.error;
  }

  const minimumStockLevel = parseRequiredNumber(values.minimumStockLevel, "Minimum stock level");
  if (!minimumStockLevel.ok) {
    errors.minimumStockLevel = minimumStockLevel.error;
  }

  if (options.requireQuantity) {
    const quantity = parseRequiredNumber(values.quantity, "Opening quantity");
    if (!quantity.ok) {
      errors.quantity = quantity.error;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, values };
}
