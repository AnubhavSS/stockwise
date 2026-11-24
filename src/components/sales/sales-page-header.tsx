"use client";

import { Download, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

type SalesPageHeaderProps = {
  onExport: () => void;
  onCreate: () => void;
};

export function SalesPageHeader({ onExport, onCreate }: SalesPageHeaderProps) {
  return (
    <PageHeader
      title="Sales"
      description="Track sales, manage transactions and monitor revenue."
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="bg-card" onClick={onExport}>
            <Download />
            Export
          </Button>
          <Button onClick={onCreate}>
            <Plus />
            Create Sale
          </Button>
        </div>
      }
    />
  );
}
