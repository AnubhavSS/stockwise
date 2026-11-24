/** Shared chrome (navy sidebar + header) for every authenticated-looking screen. */
import type { ReactNode } from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DashboardGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
