import {
  Cable,
  HardDrive,
  Keyboard,
  Monitor,
  Package,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types/inventory";

const CATEGORY_STYLES: Record<
  ProductCategory,
  { className: string; icon: typeof Package }
> = {
  Accessories: { className: "bg-[#111C32]/8 text-[#111C32]", icon: Package },
  Cables: { className: "bg-primary/10 text-primary", icon: Cable },
  Peripherals: { className: "bg-[#3B82F6]/10 text-[#2563EB]", icon: Keyboard },
  Displays: { className: "bg-[#7C3AED]/10 text-[#6D28D9]", icon: Monitor },
  Storage: { className: "bg-success/10 text-success", icon: HardDrive },
};

export function ProductAvatar({
  name,
  category,
  className,
}: {
  name: string;
  category: ProductCategory;
  className?: string;
}) {
  const style = CATEGORY_STYLES[category];
  const Icon = style.icon;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        style.className,
        className,
      )}
      aria-hidden
      title={initials}
    >
      <Icon className="size-4" />
    </span>
  );
}
