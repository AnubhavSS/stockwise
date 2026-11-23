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
import { useInventoryStore } from "@/store/inventory-store";
import type { Product } from "@/types/inventory";

type DeleteItemDialogProps = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

export function DeleteItemDialog({
  product,
  open,
  onOpenChange,
  onCompleted,
}: DeleteItemDialogProps) {
  const stockMovements = useInventoryStore((state) => state.stockMovements);
  const archiveProduct = useInventoryStore((state) => state.archiveProduct);
  const deleteProduct = useInventoryStore((state) => state.deleteProduct);

  const hasHistory = Boolean(
    product &&
      stockMovements.some((movement) => movement.productId === product.id),
  );

  function handleConfirm() {
    if (!product) {
      return;
    }

    if (hasHistory) {
      const result = archiveProduct(product.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`${product.name} was archived so historical movements stay intact.`);
    } else {
      const result = deleteProduct(product.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(`${product.name} was deleted.`);
    }

    onOpenChange(false);
    onCompleted?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasHistory ? "Archive Item" : "Delete Item"}</DialogTitle>
          <DialogDescription>
            {hasHistory
              ? `${product?.name ?? "This product"} has stock movement history. It will be archived instead of permanently deleted so sales and purchase references remain valid.`
              : `This will permanently remove ${product?.name ?? "this product"} from the catalogue. This cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            {hasHistory ? "Archive Item" : "Delete Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
