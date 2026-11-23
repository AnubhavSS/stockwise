import { getLowStockProducts } from "@/lib/calculations";
import type { Product } from "@/types/inventory";

export function getStockAlerts(products: Product[]) {
  return getLowStockProducts(products).map((product) => ({
    productId: product.id,
    sku: product.sku,
    name: product.name,
    quantity: product.quantity,
    minimumStockLevel: product.minimumStockLevel,
    shortage: Math.max(0, product.minimumStockLevel - product.quantity),
  }));
}
