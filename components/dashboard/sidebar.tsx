"use client";

import { useSidebar } from "@/components/dashboard/sidebar-context";
import { signOut } from "@/lib/auth-actions";
import { type Plan } from "@/lib/subscription";
import { TOOL_CATEGORIES, TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  Settings,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  developer: "Developer",
  text: "Text",
  utility: "Utility",
  image: "Image",
};

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/favorites", label: "Favorites", icon: Star },
  { href: "/dashboard/recent", label: "Recent", icon: Clock },
];

const accountItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

function SidebarContent({ plan, collapsed }: { plan: Plan; collapsed: boolean }) {
  const pathname = usePathname();
  const { closeMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const categoryCounts = TOOL_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = TOOLS.filter((t) => t.category === category).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const isMenuActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className={cn("shrink-0 pt-5 pb-4", collapsed ? "px-3" : "px-5")}>
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400">
            <Zap className="h-4 w-4 text-black" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-foreground leading-tight">
                Dev Toolbox
              </div>
              <div className="text-[11px] text-muted-foreground">
                Personal workspace
              </div>
            </div>
          )}
        </Link>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto pb-3 space-y-5",
          collapsed ? "px-2" : "px-3",
        )}
      >
        {/* MENU */}
        <div>
          {!collapsed && (
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Menu
            </p>
          )}
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isMenuActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-lg py-2 text-sm transition-colors",
                    collapsed ? "justify-center px-2" : "gap-2.5 px-3",
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CATEGORIES */}
        <div>
          {!collapsed && (
            <div className="flex items-center justify-between mb-1.5 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Categories
              </p>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {TOOLS.length}
              </span>
            </div>
          )}
          <nav className="space-y-0.5">
            {TOOL_CATEGORIES.map((category) => {
              const count = categoryCounts[category];
              const active = pathname.includes(`category=${category}`);
              return (
                <Link
                  key={category}
                  href={`/dashboard/tools?category=${category}`}
                  onClick={closeMobile}
                  title={collapsed ? CATEGORY_LABELS[category] : undefined}
                  className={cn(
                    "flex items-center rounded-lg py-2 text-sm transition-colors",
                    collapsed
                      ? "justify-center px-2"
                      : "justify-between px-3",
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {collapsed ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                        {CATEGORY_LABELS[category]}
                      </div>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ACCOUNT */}
        <div>
          {!collapsed && (
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </p>
          )}
          <nav className="space-y-0.5">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-lg py-2 text-sm transition-colors",
                    collapsed ? "justify-center px-2" : "gap-2.5 px-3",
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="shrink-0 border-t border-sidebar-border p-3 space-y-2">
        {!collapsed && (
          plan === "pro" ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
                Pro Plan Active
              </div>
              <div className="text-[11px] text-muted-foreground">
                {TOOLS.filter((t) => t.isPremium).length} pro tools unlocked
              </div>
            </div>
          ) : (
            <Link
              href="/pricing"
              onClick={closeMobile}
              className="block rounded-xl border border-border bg-muted/50 px-3 py-2.5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors"
            >
              <div className="text-xs font-semibold text-foreground mb-0.5">
                Upgrade to Pro
              </div>
              <div className="text-[11px] text-muted-foreground">
                Unlock {TOOLS.filter((t) => t.isPremium).length} more tools
              </div>
            </Link>
          )
        )}
        <button
          onClick={handleSignOut}
          disabled={isPending}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "flex w-full items-center rounded-lg py-2 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400",
            collapsed ? "justify-center px-2" : "gap-2.5 px-3",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{isPending ? "Signing out…" : "Sign out"}</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ plan = "free" }: { plan?: Plan }) {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent plan={plan} collapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative hidden lg:flex flex-col h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent plan={plan} collapsed={collapsed} />

        {/* Collapse toggle button */}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </>
  );
}
