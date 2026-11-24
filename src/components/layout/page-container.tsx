/**
 * Padded main column so every module shares the same page width and spacing.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    /* Max-width canvas so tables and charts stay aligned across modules */
    <div className={cn("mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
}
