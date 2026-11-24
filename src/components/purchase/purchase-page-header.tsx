"use client";

/**
 * Purchase title and create-order action.
 */
import { Download, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

type PurchasePageHeaderProps = {
  onExport: () => void;
  onCreate: () => void;
};

export function PurchasePageHeader({ onExport, onCreate }: PurchasePageHeaderProps) {
  return (
    <PageHeader
      title="Purchases"
      description="Manage purchase orders, suppliers and incoming inventory."
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="bg-card" onClick={onExport}>
            <Download />
            Export
          </Button>
          <Button onClick={onCreate}>
            <Plus />
            Create Purchase
          </Button>
        </div>
      }
    />
  );
}
