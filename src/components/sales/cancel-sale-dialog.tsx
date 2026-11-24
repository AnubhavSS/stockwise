"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSalesStore } from "@/store/sales-store";
import type { Sale } from "@/types/sales";

type CancelSaleDialogProps = {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

export function CancelSaleDialog({
  sale,
  open,
  onOpenChange,
  onCompleted,
}: CancelSaleDialogProps) {
  const cancelSale = useSalesStore((state) => state.cancelSale);

  function handleConfirm() {
    if (!sale) {
      return;
    }
    const result = cancelSale(sale.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      sale.inventoryApplied
        ? `${sale.invoiceNumber} cancelled and stock restored.`
        : `${sale.invoiceNumber} cancelled.`,
    );
    onOpenChange(false);
    onCompleted?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Sale</DialogTitle>
          <DialogDescription>
            {sale?.inventoryApplied
              ? `This will cancel ${sale.invoiceNumber} and restore sold quantities to inventory.`
              : `This will cancel ${sale?.invoiceNumber ?? "this sale"}. Historical sample stock was already reflected in opening balances, so quantities will not change.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep Sale
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Cancel Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
