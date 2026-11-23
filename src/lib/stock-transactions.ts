import { calculateLineTotal } from "@/lib/calculations";
import type {
  Product,
  StockAdjustmentType,
  StockMovement,
  StockMovementType,
} from "@/types/inventory";

export type StockTransactionInput = Omit<StockMovement, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

export type StockTransactionSuccess = {
  ok: true;
  products: Product[];
  movement: StockMovement;
};

export type StockTransactionFailure = {
  ok: false;
  error: string;
};

export type StockTransactionResult = StockTransactionSuccess | StockTransactionFailure;

export type QuantityAdjustmentResult =
  | { ok: true; nextQuantity: number; quantityChange: number }
  | { ok: false; error: string };

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

export function computeAdjustment(
  currentQuantity: number,
  type: StockAdjustmentType,
  quantity: number,
): QuantityAdjustmentResult {
  if (!Number.isFinite(quantity) || quantity < 0) {
    return { ok: false, error: "Quantity must be a valid non-negative number." };
  }

  if (type !== "set" && quantity === 0) {
    return { ok: false, error: "Enter a quantity greater than zero." };
  }

  if (type === "add") {
    return {
      ok: true,
      nextQuantity: currentQuantity + quantity,
      quantityChange: quantity,
    };
  }

  if (type === "remove") {
    if (quantity > currentQuantity) {
      return {
        ok: false,
        error: `Cannot remove ${quantity} units. Only ${currentQuantity} are available.`,
      };
    }

    return {
      ok: true,
      nextQuantity: currentQuantity - quantity,
      quantityChange: -quantity,
    };
  }

  return {
    ok: true,
    nextQuantity: quantity,
    quantityChange: quantity - currentQuantity,
  };
}

export function applyStockMovement({
  products,
  movement,
}: {
  products: Product[];
  movement: StockTransactionInput;
}): StockTransactionResult {
  const product = products.find((item) => item.id === movement.productId);

  if (!product) {
    return { ok: false, error: "Product was not found in inventory." };
  }

  if (!Number.isFinite(movement.quantityChange) || movement.quantityChange === 0) {
    return { ok: false, error: "Stock movements must change quantity by a non-zero amount." };
  }

  const nextQuantity = product.quantity + movement.quantityChange;

  if (nextQuantity < 0) {
    return {
      ok: false,
      error: `This movement would take ${product.name} below zero. Available quantity is ${product.quantity}.`,
    };
  }

  const completeMovement: StockMovement = {
    id: movement.id ?? `mov-${crypto.randomUUID()}`,
    createdAt: movement.createdAt ?? new Date().toISOString(),
    productId: movement.productId,
    type: movement.type,
    quantityChange: movement.quantityChange,
    referenceId: movement.referenceId,
    remarks: movement.remarks,
  };

  return {
    ok: true,
    movement: completeMovement,
    products: products.map((item) =>
      item.id === product.id
        ? {
            ...item,
            quantity: nextQuantity,
            updatedAt: completeMovement.createdAt,
          }
        : item,
    ),
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

export function deriveMovementBalances(
  movements: StockMovement[],
  currentQuantity: number,
): Map<string, number> {
  const chronological = [...movements].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
  const newestFirst = [...chronological].reverse();
  const balances = new Map<string, number>();
  let running = currentQuantity;

  for (const movement of newestFirst) {
    balances.set(movement.id, running);
    running -= movement.quantityChange;
  }

  return balances;
}
