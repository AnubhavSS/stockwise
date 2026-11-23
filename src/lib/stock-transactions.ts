import { calculateLineTotal } from "@/lib/calculations";
import type { Product, StockMovement, StockMovementType } from "@/types/inventory";

type ApplyMovementInput = {
  products: Product[];
  movement: Omit<StockMovement, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  };
};

type ApplyMovementResult = {
  products: Product[];
  movement: StockMovement;
};

export function createStockMovement(input: {
  productId: string;
  type: StockMovementType;
  quantityChange: number;
  referenceId: string;
  remarks: string;
}): StockMovement {
  const now = new Date().toISOString();

  return {
    id: `mov-${crypto.randomUUID()}`,
    createdAt: now,
    ...input,
  };
}

export function applyStockMovement({
  products,
  movement,
}: ApplyMovementInput): ApplyMovementResult {
  const completeMovement: StockMovement = {
    id: movement.id ?? `mov-${crypto.randomUUID()}`,
    createdAt: movement.createdAt ?? new Date().toISOString(),
    productId: movement.productId,
    type: movement.type,
    quantityChange: movement.quantityChange,
    referenceId: movement.referenceId,
    remarks: movement.remarks,
  };

  const productsUpdated = products.map((product) => {
    if (product.id !== completeMovement.productId) {
      return product;
    }

    const nextQuantity = product.quantity + completeMovement.quantityChange;

    return {
      ...product,
      quantity: Math.max(0, nextQuantity),
      updatedAt: completeMovement.createdAt,
    };
  });

  return {
    products: productsUpdated,
    movement: completeMovement,
  };
}

export function saleQuantityChange(quantitySold: number): number {
  return -Math.abs(quantitySold);
}

export function purchaseQuantityChange(quantityReceived: number): number {
  return Math.abs(quantityReceived);
}

export function lineAmount(quantity: number, unitPrice: number): number {
  return calculateLineTotal(quantity, unitPrice);
}
