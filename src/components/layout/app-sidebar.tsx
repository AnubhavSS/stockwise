"use client";

/**
 * Primary module links plus Customers/Suppliers. Collapses to icons on desktop.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { primaryNav, secondaryNav, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);
  const Icon = item.icon;

  const className = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
    collapsed && "justify-center px-2",
    active
      ? "bg-sidebar-primary text-sidebar-primary-foreground"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  );

  const content = (
    <>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className={cn(collapsed && "sr-only")}>{item.title}</span>
    </>
  );

  if (!collapsed) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={className}
          />
        }
      >
        {content}
      </TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({
  className,
  onNavigate,
  forceExpanded = false,
}: {
  className?: string;
  onNavigate?: () => void;
  forceExpanded?: boolean;
}) {
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const collapsed = forceExpanded ? false : sidebarCollapsed;
  const collapseLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      {/* Logo + full toggle inside the rail so nothing is clipped */}
      <div
        className={cn(
          "flex gap-2",
          collapsed
            ? "flex-col items-center px-2 py-3"
            : "h-16 min-w-0 items-center justify-between px-3",
        )}
      >
        <div className={cn(!collapsed && "min-w-0 flex-1")}>
          <Brand compact={collapsed} />
        </div>
        {!forceExpanded ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon-sm"
                  aria-label={collapseLabel}
                  onClick={toggleSidebar}
                  className="size-8 shrink-0 rounded-full border border-white/40 bg-white text-[#111C32] shadow-sm hover:bg-white hover:text-[#111C32]"
                />
              }
            >
              {collapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "bottom"}>
              {collapseLabel}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <Separator className="bg-sidebar-border" />
      <ScrollArea className="flex-1 px-3 py-4">
        {/* Operating modules: Dashboard, Sales, Purchase, Stock, Reports */}
        <nav aria-label="Primary" className="space-y-1">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
        <Separator className="my-4 bg-sidebar-border" />
        {/* Directory pages (placeholders that already back sales/purchase forms) */}
        <nav aria-label="Directory" className="space-y-1">
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
