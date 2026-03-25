"use client";

import { signOut } from "@/lib/auth-actions";
import { type Plan } from "@/lib/subscription";
import { TOOL_CATEGORIES, TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import {
  Clock,
  CreditCard,
  Key,
  LayoutDashboard,
  LogOut,
  Search,
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

export function Sidebar({ plan = "free" }: { plan?: Plan }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  const categoryCounts = TOOL_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = TOOLS.filter((tool) => tool.category === category).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const isMenuActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <aside className="flex h-full w-64 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 shrink-0">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground leading-tight">
              Dev Toolbox
            </div>
            <div className="text-[11px] text-muted-foreground">
              Personal workspace
            </div>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 pb-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 truncate">Search tools...</span>
          <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex">
            ⌘K
          </kbd>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-5">
        {/* MENU */}
        <div>
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </p>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isMenuActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CATEGORIES */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Categories
            </p>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {TOOLS.length}
            </span>
          </div>
          <nav className="space-y-0.5">
            {TOOL_CATEGORIES.map((category) => {
              const count = categoryCounts[category];
              return (
                <Link
                  key={category}
                  href={`/dashboard/tools?category=${category}`}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname.includes(`category=${category}`)
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                    {CATEGORY_LABELS[category]}
                  </div>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ACCOUNT */}
        <div>
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
          <nav className="space-y-0.5">
            {accountItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom - Plan + Sign out */}
      <div className="shrink-0 border-t border-sidebar-border p-3 space-y-2">
        {plan === "pro" ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
              Pro Plan Active
            </div>
            <div className="text-[11px] text-muted-foreground">
              {TOOLS.filter((t) => t.isPremium).length} pro tools unlocked ·
              Renews May 2025
            </div>
          </div>
        ) : (
          <Link
            href="/pricing"
            className="block rounded-xl border border-border bg-muted/50 px-3 py-2.5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors"
          >
            <div className="text-xs font-semibold text-foreground mb-0.5">
              Upgrade to Pro
            </div>
            <div className="text-[11px] text-muted-foreground">
              Unlock {TOOLS.filter((t) => t.isPremium).length} more tools
            </div>
          </Link>
        )}
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{isPending ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </aside>
  );
}

