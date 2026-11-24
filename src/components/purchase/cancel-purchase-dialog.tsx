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
import { usePurchaseStore } from "@/store/purchase-store";
import type { Purchase } from "@/types/purchase";

type CancelPurchaseDialogProps = {
  purchase: Purchase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

export function CancelPurchaseDialog({
  purchase,
  open,
  onOpenChange,
  onCompleted,
}: CancelPurchaseDialogProps) {
  const cancelPurchase = usePurchaseStore((state) => state.cancelPurchase);

  function handleConfirm() {
    if (!purchase) {
      return;
    }
    const result = cancelPurchase(purchase.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${purchase.purchaseOrderNumber} was cancelled.`);
    onOpenChange(false);
    onCompleted?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Purchase</DialogTitle>
          <DialogDescription>
            This will cancel {purchase?.purchaseOrderNumber ?? "this order"}. Stock is
            not changed because no goods have been received.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep Order
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Cancel Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
