"use client";

import Link from "next/link";
import { History, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

type StockPageHeaderProps = {
  onAddItem: () => void;
};

export function StockPageHeader({ onAddItem }: StockPageHeaderProps) {
  return (
    <PageHeader
      title="Stock Management"
      description="Manage your products, monitor stock levels and track inventory movements."
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="bg-card" render={<Link href="/stock/history" />}>
            <History />
            Stock History
          </Button>
          <Button
            variant="outline"
            className="bg-card"
            onClick={() =>
              toast.info("CSV import will be available in a later release.")
            }
          >
            <Upload />
            Import
          </Button>
          <Button onClick={onAddItem}>
            <Plus />
            Add Item
          </Button>
        </div>
      }
    />
  );
}
