"use client";

import { useState } from "react";
import { PackagePlus, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { AddItemDialog } from "@/components/dashboard/add-item-dialog";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const [addItemOpen, setAddItemOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="bg-card"
          onClick={() =>
            toast.info("New Sale will open from the Sales module in the next step.")
          }
        >
          <ShoppingCart />
          New Sale
        </Button>
        <Button
          variant="outline"
          className="bg-card"
          onClick={() =>
            toast.info("New Purchase will open from the Purchase module in the next step.")
          }
        >
          <ShoppingBag />
          New Purchase
        </Button>
        <Button onClick={() => setAddItemOpen(true)}>
          <PackagePlus />
          Add Item
        </Button>
      </div>
      <AddItemDialog open={addItemOpen} onOpenChange={setAddItemOpen} />
    </>
  );
}
