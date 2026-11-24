"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Ban, Download, Pencil, Printer } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { CancelSaleDialog } from "@/components/sales/cancel-sale-dialog";
import { CreateSaleSheet } from "@/components/sales/create-sale-sheet";
import { SaleInvoice } from "@/components/sales/sale-invoice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { canCancelSale, canEditSale } from "@/features/sales/calculations";
import { customerName } from "@/features/sales/selectors";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusTone,
  saleStatusLabel,
  saleStatusTone,
} from "@/features/sales/status";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { useInventoryStore } from "@/store/inventory-store";
import { useSalesStore } from "@/store/sales-store";

type SaleDetailsProps = {
  saleId: string;
};

export function SaleDetails({ saleId }: SaleDetailsProps) {
  const mounted = useHasMounted();
  const router = useRouter();
  const sale = useSalesStore((state) => state.sales.find((item) => item.id === saleId));
  const customers = useSalesStore((state) => state.customers);
  const products = useInventoryStore((state) => state.products);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!mounted) {
    return <LoadingState rows={8} />;
  }

  if (!sale) {
    return (
      <EmptyState
        title="Sale not found"
        description="This invoice may have been removed, or the link is no longer valid."
        action={<Button render={<Link href="/sales" />}>Back to Sales</Button>}
      />
    );
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    handlePrint();
    toast.success("Use the browser print dialog to save as PDF.");
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => router.push("/sales")}
        >
          <ArrowLeft />
          Back to Sales
        </Button>
      </div>

      <div className="print:hidden">
        <PageHeader
          title={sale.invoiceNumber}
          description={`${customerName(customers, sale.customerId)} · ${formatDate(sale.date)}`}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="bg-card" onClick={handleDownload}>
                <Download />
                Download Invoice
              </Button>
              <Button variant="outline" className="bg-card" onClick={handlePrint}>
                <Printer />
                Print Invoice
              </Button>
              {canEditSale(sale) ? (
                <Button variant="outline" className="bg-card" onClick={() => setEditOpen(true)}>
                  <Pencil />
                  Edit
                </Button>
              ) : null}
              {canCancelSale(sale) ? (
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                  <Ban />
                  Cancel Sale
                </Button>
              ) : null}
            </div>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <StatusBadge
          label={saleStatusLabel[sale.status]}
          tone={saleStatusTone[sale.status]}
        />
        <StatusBadge
          label={paymentStatusLabel[sale.paymentStatus]}
          tone={paymentStatusTone[sale.paymentStatus]}
        />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        {[
          { title: "Total Amount", value: formatCurrency(sale.totalAmount) },
          { title: "Amount Paid", value: formatCurrency(sale.amountPaid) },
          { title: "Balance", value: formatCurrency(sale.remainingBalance) },
          { title: "Payment Method", value: paymentMethodLabel[sale.paymentMethod] },
        ].map((card) => (
          <Card
            key={card.title}
            className="border-border bg-card py-4 shadow-sm ring-1 ring-border"
          >
            <div className="px-4">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">{card.value}</p>
            </div>
          </Card>
        ))}
      </section>

      <SaleInvoice sale={sale} customers={customers} products={products} />

      <CreateSaleSheet sale={sale} open={editOpen} onOpenChange={setEditOpen} />
      <CancelSaleDialog
        sale={sale}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCompleted={() => router.push("/sales")}
      />
    </div>
  );
}
