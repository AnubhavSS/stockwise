"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Pencil, SlidersHorizontal } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { AdjustStockDialog } from "@/components/stock/adjust-stock-dialog";
import { EditItemDialog } from "@/components/stock/edit-item-dialog";
import { ProductAvatar } from "@/components/stock/product-avatar";
import { ProductStockHistory } from "@/components/stock/product-stock-history";
import { ProductTransactions } from "@/components/stock/product-transactions";
import { StockStatusBadge } from "@/components/stock/stock-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { calculateStockValue, formatCurrency, formatDate, formatNumber } from "@/lib/calculations";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import { useSalesStore } from "@/store/sales-store";

type ProductDetailsProps = {
  productId: string;
};

export function ProductDetails({ productId }: ProductDetailsProps) {
  const mounted = useHasMounted();
  const router = useRouter();
  const product = useInventoryStore((state) =>
    state.products.find((item) => item.id === productId),
  );
  const movements = useInventoryStore((state) =>
    state.stockMovements.filter((movement) => movement.productId === productId),
  );
  const sales = useSalesStore((state) => state.sales);
  const customers = useSalesStore((state) => state.customers);
  const purchases = usePurchaseStore((state) => state.purchases);
  const suppliers = usePurchaseStore((state) => state.suppliers);

  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const summaryCards = useMemo(() => {
    if (!product) {
      return [];
    }
    return [
      {
        title: "Current Stock",
        value: formatNumber(product.quantity),
      },
      {
        title: "Minimum Stock Level",
        value: formatNumber(product.minimumStockLevel),
      },
      {
        title: "Unit Price",
        value: formatCurrency(product.unitPrice),
      },
      {
        title: "Total Stock Value",
        value: formatCurrency(calculateStockValue(product)),
      },
    ];
  }, [product]);

  if (!mounted) {
    return <LoadingState rows={8} />;
  }

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This item may have been deleted, or the link is no longer valid."
        action={
          <Button render={<Link href="/stock" />}>Back to Stock</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => router.push("/stock")}
        >
          <ArrowLeft />
          Back to Stock
        </Button>
      </div>

      <PageHeader
        title={product.name}
        description={`${product.sku} · ${product.category}${product.isActive ? "" : " · Archived"}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="bg-card" onClick={() => setEditOpen(true)}>
              <Pencil />
              Edit Item
            </Button>
            <Button onClick={() => setAdjustOpen(true)}>
              <SlidersHorizontal />
              Adjust Stock
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <ProductAvatar
          name={product.name}
          category={product.category}
          className="size-12 rounded-xl"
        />
        <StockStatusBadge product={product} />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className="border-border bg-card py-4 shadow-sm ring-1 ring-border"
          >
            <div className="px-4">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{card.value}</p>
            </div>
          </Card>
        ))}
      </section>

      <Tabs defaultValue="history">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="history">Stock History</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Sales & Purchases</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="pt-4">
          <ProductStockHistory product={product} movements={movements} />
        </TabsContent>
        <TabsContent value="details" className="pt-4">
          <Card className="border-border bg-card shadow-sm ring-1 ring-border">
            <dl className="grid gap-4 px-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Description</dt>
                <dd className="mt-1 text-sm">
                  {product.description || "No description added."}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">SKU</dt>
                <dd className="mt-1 text-sm font-medium">{product.sku}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Category</dt>
                <dd className="mt-1 text-sm font-medium">{product.category}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Unit Price</dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatCurrency(product.unitPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Cost Price</dt>
                <dd className="mt-1 text-sm font-medium">
                  {product.costPrice === undefined
                    ? "—"
                    : formatCurrency(product.costPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Minimum Stock Level</dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatNumber(product.minimumStockLevel)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(product.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last Updated</dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(product.updatedAt)}
                </dd>
              </div>
            </dl>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="pt-4">
          <ProductTransactions
            productId={product.id}
            sales={sales}
            purchases={purchases}
            customers={customers}
            suppliers={suppliers}
          />
        </TabsContent>
      </Tabs>

      <EditItemDialog product={product} open={editOpen} onOpenChange={setEditOpen} />
      <AdjustStockDialog product={product} open={adjustOpen} onOpenChange={setAdjustOpen} />
    </div>
  );
}
