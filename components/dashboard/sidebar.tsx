"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Users,
  UserCog,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const routes = [
    {
      label: t("navigation.dashboard") || "Dashboard",
      icon: LayoutDashboard,
      href: `/dashboard`,
      active: pathname === `/dashboard`,
    },
    {
      label: t("navigation.admins") || "Admins",
      icon: UserCog,
      href: `/dashboard/admins`,
      active: pathname === `/dashboard/admins`,
    },
    {
      label: t("navigation.users") || "Users",
      icon: Users,
      href: `/dashboard/users`,
      active: pathname === `/dashboard/users`,
    },
    {
      label: t("navigation.products") || "Products",
      icon: Package,
      href: `/dashboard/products`,
      active: pathname.startsWith(`/dashboard/products`),
    },
    {
      label: t("navigation.orders") || "Orders",
      icon: ShoppingCart,
      href: `/dashboard/orders`,
      active: pathname === `/dashboard/orders`,
    },
    {
      label: t("navigation.subscriptions") || "Subscriptions",
      icon: CreditCard,
      href: `/dashboard/subscriptions`,
      active: pathname === `/dashboard/subscriptions`,
    },
    {
      label: t("navigation.storeConfiguration") || "Store Configuration",
      icon: Settings,
      href: `/dashboard/store-configuration`,
      active: pathname === `/dashboard/store-configuration`,
    },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <MobileSidebar routes={routes} setOpen={setOpen} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background md:block md:w-64">
        <div className="flex h-full flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-bold">Tuyo Panel</h2>
          </div>
          <ScrollArea className="flex-1 px-3 py-2">
            <nav className="flex flex-col gap-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    route.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

interface MobileSidebarProps {
  routes: {
    label: string;
    icon: React.ElementType;
    href: string;
    active: boolean;
  }[];
  setOpen: (open: boolean) => void;
}

function MobileSidebar({ routes, setOpen }: MobileSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b px-6 py-4">
        <h2 className="text-xl font-bold">Tuyo Panel</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-3">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                route.active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setOpen(false)}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
