"use client";

/**
 * Top bar: breadcrumbs, global search, notifications, and the demo operator menu.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Bell, LogOut, Menu, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";

import { SearchInput } from "@/components/shared/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNavItemByPath } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useInventoryStore } from "@/store/inventory-store";
import { usePurchaseStore } from "@/store/purchase-store";
import { useSalesStore } from "@/store/sales-store";
import { useUiStore } from "@/store/ui-store";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const current = getNavItemByPath(pathname);
  const isDashboard = pathname === "/dashboard";
  const globalSearch = useUiStore((state) => state.globalSearch);
  const setGlobalSearch = useUiStore((state) => state.setGlobalSearch);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const products = useInventoryStore((state) => state.products);
  const sales = useSalesStore((state) => state.sales);
  const purchases = usePurchaseStore((state) => state.purchases);
  const [searchOpen, setSearchOpen] = useState(false);
  const shortcut = "Ctrl K";

  const results = useMemo(() => {
    const query = globalSearch.trim().toLowerCase();
    if (query.length < 2) {
      return [];
    }

    const productHits = products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query),
      )
      .slice(0, 4)
      .map((product) => ({
        id: product.id,
        title: product.name,
        hint: product.sku,
        href: `/stock/${product.id}`,
      }));

    const saleHits = sales
      .filter((sale) => sale.invoiceNumber.toLowerCase().includes(query))
      .slice(0, 3)
      .map((sale) => ({
        id: sale.id,
        title: sale.invoiceNumber,
        hint: "Sales invoice",
        href: `/sales/${sale.id}`,
      }));

    const purchaseHits = purchases
      .filter((purchase) =>
        purchase.purchaseOrderNumber.toLowerCase().includes(query),
      )
      .slice(0, 3)
      .map((purchase) => ({
        id: purchase.id,
        title: purchase.purchaseOrderNumber,
        hint: "Purchase order",
        href: `/purchase/${purchase.id}`,
      }));

    return [...productHits, ...saleHits, ...purchaseHits];
  }, [globalSearch, products, purchases, sales]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("global-search")?.focus();
        setSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6">
      {/* Hamburger only on small screens — opens the sidebar sheet */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>
      {/* Where the operator currently is */}
      <Breadcrumb className="hidden min-w-0 md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              {isDashboard ? "Overview" : siteConfig.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{current?.title ?? "Workspace"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        {/* Products, invoices, and POs matching the typed query */}
        <div className="relative w-full max-w-xs">
          <SearchInput
            id="global-search"
            value={globalSearch}
            onValueChange={(value) => {
              setGlobalSearch(value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSearchOpen(false);
              }
            }}
            placeholder="Search anything..."
            className="w-full"
            shortcut={
              <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
                {shortcut}
              </kbd>
            }
          />
          {searchOpen && results.length > 0 ? (
            <div className="absolute top-full z-30 mt-2 w-full rounded-xl border border-border bg-card p-1 shadow-md">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-muted"
                  onClick={() => {
                    setSearchOpen(false);
                    setGlobalSearch("");
                    router.push(result.href);
                    toast.success(`Opened ${result.title}`);
                  }}
                >
                  <span className="text-sm font-medium">{result.title}</span>
                  <span className="text-xs text-muted-foreground">{result.hint}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {/* Demo notification shortcuts into stock / sales / purchase */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" />
            }
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/stock")}>
              Products need stock attention
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/sales")}>
              Review open sales invoices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/purchase")}>
              Incoming purchase orders pending receipt
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Demo operator — profile/sign-out are not wired in this build */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="Account" className="rounded-full" />}
          >
            <Avatar size="default" className="bg-secondary">
              <AvatarFallback className="bg-sidebar text-xs text-sidebar-foreground">
                {siteConfig.demoUser.initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block">{siteConfig.demoUser.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {siteConfig.demoUser.role}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Profile settings will be available with authentication.")}>
              <UserRound />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Workspace preferences are not configured yet.")}>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => toast.info("Sign out is disabled in this assessment build.")}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
