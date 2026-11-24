/**
 * Sidebar links. `primaryNav` is the operating modules; `secondaryNav` is
 * the directory (Customers / Suppliers).
 */
import {
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const primaryNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview of inventory health and recent activity",
  },
  {
    title: "Sales",
    href: "/sales",
    icon: ShoppingCart,
    description: "Invoices, orders and customer sales",
  },
  {
    title: "Purchase",
    href: "/purchase",
    icon: ShoppingBag,
    description: "Purchase orders and supplier receipts",
  },
  {
    title: "Stock",
    href: "/stock",
    icon: Package,
    description: "Product catalogue, quantities and movements",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Analytics for sales, purchases and stock",
  },
];

export const secondaryNav: NavItem[] = [
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    description: "Customer directory",
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    icon: Truck,
    description: "Supplier directory",
  },
];

export const allNavItems: NavItem[] = [...primaryNav, ...secondaryNav];

export function getNavItemByPath(pathname: string): NavItem | undefined {
  return allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
