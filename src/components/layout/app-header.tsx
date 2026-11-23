"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";

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
import { getNavItemByPath } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useUiStore } from "@/store/ui-store";

export function AppHeader() {
  const pathname = usePathname();
  const current = getNavItemByPath(pathname);
  const globalSearch = useUiStore((state) => state.globalSearch);
  const setGlobalSearch = useUiStore((state) => state.setGlobalSearch);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </Button>
      <Breadcrumb className="hidden min-w-0 md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              {siteConfig.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{current?.title ?? "Workspace"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        <SearchInput
          value={globalSearch}
          onValueChange={setGlobalSearch}
          placeholder="Search products, invoices..."
          className="w-full max-w-xs"
        />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <Avatar size="default" className="bg-secondary">
          <AvatarFallback className="bg-sidebar text-sidebar-foreground">
            {siteConfig.demoUser.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
