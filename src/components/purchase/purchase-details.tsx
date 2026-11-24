"use client";

/**
 * PO view with receive, edit, cancel, and print.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Ban, Download, PackageCheck, Pencil, Printer } from "lucide-react";
import { toast } from "sonner";

import { CancelPurchaseDialog } from "@/components/purchase/cancel-purchase-dialog";
import { CreatePurchaseSheet } from "@/components/purchase/create-purchase-sheet";
import { PurchaseDocument } from "@/components/purchase/purchase-document";
import { ReceiveItemsDialog } from "@/components/purchase/receive-items-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  canCancelPurchase,
  canEditPurchase,
  canReceivePurchase,
} from "@/features/purchase/calculations";
import { supplierName } from "@/features/purchase/selectors";
import {
  paymentMethodLabel,
  paymentStatusLabel,
  paymentStatusTone,
  purchaseStatusLabel,
  purchaseStatusTone,
} from "@/features/purchase/status";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { formatCurrency, formatDate } from "@/lib/calculations";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";

type PurchaseDetailsProps = {
  purchaseId: string;
};

export function PurchaseDetails({ purchaseId }: PurchaseDetailsProps) {
  const mounted = useHasMounted();
  const router = useRouter();
  const purchase = usePurchaseStore((state) =>
    state.purchases.find((item) => item.id === purchaseId),
  );
  const suppliers = usePurchaseStore((state) => state.suppliers);
  const products = useInventoryStore((state) => state.products);
  const [editOpen, setEditOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!mounted) {
    return <LoadingState rows={8} />;
  }

  if (!purchase) {
    return (
      <EmptyState
        title="Purchase order not found"
        description="This purchase order may have been removed, or the link is no longer valid."
        action={<Button render={<Link href="/purchase" />}>Back to Purchases</Button>}
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
      {/* Screen chrome is hidden when printing the purchase order */}
      <div className="print:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => router.push("/purchase")}
        >
          <ArrowLeft />
          Back to Purchases
        </Button>
      </div>

      <div className="print:hidden">
        <PageHeader
          title={purchase.purchaseOrderNumber}
          description={`${supplierName(suppliers, purchase.supplierId)} · ${formatDate(purchase.date)}`}
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="bg-card" onClick={handleDownload}>
                <Download />
                Download Purchase Order
              </Button>
              <Button variant="outline" className="bg-card" onClick={handlePrint}>
                <Printer />
                Print Purchase Order
              </Button>
              {canReceivePurchase(purchase) ? (
                <Button onClick={() => setReceiveOpen(true)}>
                  <PackageCheck />
                  Receive Items
                </Button>
              ) : null}
              {canEditPurchase(purchase) ? (
                <Button variant="outline" className="bg-card" onClick={() => setEditOpen(true)}>
                  <Pencil />
                  Edit
                </Button>
              ) : null}
              {canCancelPurchase(purchase) ? (
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                  <Ban />
                  Cancel Purchase
                </Button>
              ) : null}
            </div>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <StatusBadge
          label={purchaseStatusLabel[purchase.status]}
          tone={purchaseStatusTone[purchase.status]}
        />
        <StatusBadge
          label={paymentStatusLabel[purchase.paymentStatus]}
          tone={paymentStatusTone[purchase.paymentStatus]}
        />
      </div>

      {/* Totals for the operator; receive/edit/cancel live in the header actions */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        {[
          { title: "Total Amount", value: formatCurrency(purchase.totalAmount) },
          { title: "Amount Paid", value: formatCurrency(purchase.amountPaid) },
          { title: "Balance", value: formatCurrency(purchase.remainingBalance) },
          { title: "Payment Method", value: paymentMethodLabel[purchase.paymentMethod] },
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

      <PurchaseDocument purchase={purchase} suppliers={suppliers} products={products} />

      <CreatePurchaseSheet purchase={purchase} open={editOpen} onOpenChange={setEditOpen} />
      <ReceiveItemsDialog
        purchase={purchase}
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
      />
      <CancelPurchaseDialog
        purchase={purchase}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onCompleted={() => router.push("/purchase")}
      />
    </div>
  );
}
