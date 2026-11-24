"use client";

/**
 * New Sale, New Purchase, and Add Item. Links use Button with nativeButton=false.
 */
import { useState } from "react";
import Link from "next/link";
import { PackagePlus, ShoppingBag, ShoppingCart } from "lucide-react";

import { AddItemDialog } from "@/components/dashboard/add-item-dialog";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const [addItemOpen, setAddItemOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Sale and purchase open the create sheets via query params */}
        <Button
          variant="outline"
          className="bg-card"
          render={<Link href="/sales?create=1" />}
        >
          <ShoppingCart />
          New Sale
        </Button>
        <Button
          variant="outline"
          className="bg-card"
          render={<Link href="/purchase?create=1" />}
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
