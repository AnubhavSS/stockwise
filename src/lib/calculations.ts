import { CURRENCY_CODE, LOCALE } from "@/lib/constants";
import type { Product } from "@/types/inventory";
import type { Purchase } from "@/types/purchase";
import type { Sale } from "@/types/sales";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value);
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function calculateInventoryValue(products: Product[]): number {
  return products.reduce(
    (total, product) => total + product.quantity * product.unitPrice,
    0,
  );
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => product.quantity <= product.minimumStockLevel,
  );
}

export function sumSaleTotals(sales: Sale[]): number {
  return sales.reduce((total, sale) => total + sale.totalAmount, 0);
}

export function sumPurchaseTotals(purchases: Purchase[]): number {
  return purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
}
