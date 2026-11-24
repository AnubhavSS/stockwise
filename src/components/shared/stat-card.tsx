/**
 * KPI card with optional trend vs the previous period.
 */

import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-border bg-card shadow-sm", className)}>
      {/* Label, big number, optional icon and hint */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-1 text-2xl font-semibold">{value}</CardTitle>
        </div>
        {Icon ? (
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
