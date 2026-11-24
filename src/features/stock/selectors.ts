/** Catalogue filters, summary counts, and movement history queries. */
import {
  getActiveProducts,
  getInStockProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  paginateItems,
} from "@/lib/calculations";
import { getStockStatus, matchesStockStatus } from "@/features/stock/status";
import type { Product, ProductCategory, StockMovement, StockMovementType, StockStatus } from "@/types/inventory";

export { paginateItems };

export type StockTab = "all" | "low_stock" | "out_of_stock";

export type StockFilters = {
  search: string;
  category: ProductCategory | "all";
  status: StockStatus | "all";
  tab: StockTab;
};

export type StockSummary = {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
};

export const DEFAULT_STOCK_FILTERS: StockFilters = {
  search: "",
  category: "all",
  status: "all",
  tab: "all",
};

export function getCatalogProducts(products: Product[]): Product[] {
  return getActiveProducts(products);
}

export function deriveStockSummary(products: Product[]): StockSummary {
  const catalog = getCatalogProducts(products);

  return {
    totalItems: catalog.length,
    inStock: getInStockProducts(catalog).length,
    lowStock: getLowStockProducts(catalog).length,
    outOfStock: getOutOfStockProducts(catalog).length,
  };
}

export function getProductCategories(products: Product[]): ProductCategory[] {
  return [...new Set(getCatalogProducts(products).map((product) => product.category))].sort();
}

export function productMatchesSearch(product: Product, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return [product.name, product.sku, product.category, product.description].some((value) =>
    value.toLowerCase().includes(query),
  );
}

export function filterProducts(products: Product[], filters: StockFilters): Product[] {
  const tabStatus: StockStatus | "all" =
    filters.tab === "all" ? "all" : filters.tab;

  return getCatalogProducts(products).filter((product) => {
    if (!productMatchesSearch(product, filters.search)) {
      return false;
    }
    if (filters.category !== "all" && product.category !== filters.category) {
      return false;
    }
    if (!matchesStockStatus(product, filters.status)) {
      return false;
    }
    if (!matchesStockStatus(product, tabStatus)) {
      return false;
    }
    return true;
  });
}

export function hasActiveStockFilters(filters: StockFilters): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.tab !== "all"
  );
}

export function skuExists(products: Product[], sku: string, excludeId?: string): boolean {
  const normalized = sku.trim().toLowerCase();
  return products.some(
    (product) =>
      product.id !== excludeId && product.sku.trim().toLowerCase() === normalized,
  );
}

export type HistoryFilters = {
  search: string;
  type: StockMovementType | "all";
  from: string;
  to: string;
};

export function filterStockMovements(
  movements: StockMovement[],
  products: Product[],
  filters: HistoryFilters,
): StockMovement[] {
  const query = filters.search.trim().toLowerCase();
  const productById = new Map(products.map((product) => [product.id, product]));

  return movements.filter((movement) => {
    if (filters.type !== "all" && movement.type !== filters.type) {
      return false;
    }

    if (filters.from) {
      const fromTime = new Date(`${filters.from}T00:00:00.000Z`).getTime();
      if (new Date(movement.createdAt).getTime() < fromTime) {
        return false;
      }
    }

    if (filters.to) {
      const toTime = new Date(`${filters.to}T23:59:59.999Z`).getTime();
      if (new Date(movement.createdAt).getTime() > toTime) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    const product = productById.get(movement.productId);
    const haystack = [
      product?.name ?? "",
      product?.sku ?? "",
      movement.referenceId,
      movement.remarks,
      movement.type,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((left, right) => {
    const leftStatus = getStockStatus(left);
    const rightStatus = getStockStatus(right);
    const rank = { out_of_stock: 0, low_stock: 1, in_stock: 2 };
    if (rank[leftStatus] !== rank[rightStatus]) {
      return rank[leftStatus] - rank[rightStatus];
    }
    return left.name.localeCompare(right.name);
  });
}
