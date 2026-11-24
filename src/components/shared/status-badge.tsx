/**
 * Colored status chip (success / warning / danger / info).
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/common";

const toneClassName: Record<StatusTone, string> = {
  neutral: "border-transparent bg-secondary text-secondary-foreground",
  info: "border-transparent bg-[#111C32]/10 text-[#111C32]",
  success: "border-transparent bg-success/10 text-success",
  warning: "border-transparent bg-warning/15 text-[#8A5A12]",
  danger: "border-transparent bg-destructive/10 text-destructive",
};

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <Badge className={cn(toneClassName[tone], className)}>{label}</Badge>
  );
}
