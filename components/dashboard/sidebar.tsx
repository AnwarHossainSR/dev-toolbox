"use client";

import { signOut } from "@/lib/auth-actions";
import { type Plan } from "@/lib/subscription";
import { TOOL_CATEGORIES, TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  ArrowLeftRight,
  Braces,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Crown,
  Database,
  FileText,
  Fingerprint,
  GitCompare,
  Hash,
  KeyRound,
  LayoutDashboard,
  Link2,
  ListX,
  Lock,
  LogOut,
  Palette,
  QrCode,
  Regex,
  Sparkles,
  Type,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const TOOL_ICONS: Record<string, React.ElementType> = {
  "JSON Formatter": Braces,
  "Base64 Encoder/Decoder": ArrowLeftRight,
  "UUID Generator": Fingerprint,
  "URL Encoder/Decoder": Link2,
  "JWT Decoder": KeyRound,
  "Hash Generator": Hash,
  "SQL Formatter": Database,
  "Word Counter": AlignLeft,
  "Text Case Converter": Type,
  "Regex Tester": Regex,
  "Markdown Previewer": FileText,
  "Text Diff": GitCompare,
  "Remove Duplicate Lines": ListX,
  "Color Converter": Palette,
  "QR Code Generator": QrCode,
  "Unix Timestamp": Clock,
  "Password Generator": Lock,
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  developer: Code2,
  text: FileText,
  utility: Zap,
};

const CATEGORY_LABELS: Record<string, string> = {
  developer: "Developer",
  text: "Text",
  utility: "Utility",
};

export function Sidebar({ plan = "free" }: { plan?: Plan }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    developer: true,
    text: true,
    utility: true,
  });
  const [isPending, startTransition] = useTransition();

  const toggleCategory = (category: string) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const categorizedTools = TOOL_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = TOOLS.filter((tool) => tool.category === category);
      return acc;
    },
    {} as Record<string, typeof TOOLS>,
  );

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <aside className="flex h-full w-64 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="h-16 shrink-0 border-b border-sidebar-border px-4">
        <div className="flex h-full items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-yellow-500 shrink-0">
            <Zap className="h-4 w-4 text-black" />
          </div>
          <div className="min-w-0">
            <Link
              href="/dashboard"
              className="block truncate text-base font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
            >
              Dev Toolbox
            </Link>
            <p className="text-[11px] text-muted-foreground">Workspace</p>
          </div>
        </div>
      </div>

      {/* Dashboard link */}
      <div className="shrink-0 px-3 pt-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </Link>
      </div>

      {/* Tools label */}
      <div className="shrink-0 px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Tools
          </p>
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {TOOLS.length}
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-2">
        <nav className="space-y-0.5">
          {TOOL_CATEGORIES.map((category) => {
            const isExpanded = expanded[category];
            const CategoryIcon = CATEGORY_ICONS[category];
            const tools = categorizedTools[category];

            return (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="group mt-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-3.5 w-3.5" />
                    <span>{CATEGORY_LABELS[category]}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
                      {tools.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isExpanded ? "rotate-180" : "",
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-0.5 space-y-0.5">
                    {tools.map((tool) => {
                      const Icon = TOOL_ICONS[tool.name] ?? Code2;
                      const isActive =
                        pathname === tool.href ||
                        pathname.startsWith(tool.href + "/");

                      return (
                        <Link
                          key={tool.name}
                          href={tool.href}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-amber-500/15 font-medium text-amber-700 dark:text-amber-400"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                              isActive
                                ? "border-amber-500/40 bg-amber-500/15"
                                : "border-border bg-background group-hover:bg-card",
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-3.5 w-3.5 transition-colors",
                                isActive
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-muted-foreground group-hover:text-foreground",
                              )}
                            />
                          </span>
                          <span className="truncate">{tool.name}</span>
                          {tool.isPremium && plan !== "pro" && (
                            <Crown className="ml-auto h-3 w-3 shrink-0 text-amber-500" />
                          )}
                          {isActive && !tool.isPremium && (
                            <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-amber-700/70 dark:text-amber-400/70" />
                          )}
                          {isActive && tool.isPremium && plan === "pro" && (
                            <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-amber-700/70 dark:text-amber-400/70" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User section */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        {plan === "free" ? (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-400">
            <Crown className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">9 tools locked</span>
            <Link
              href="/pricing"
              className="ml-auto font-semibold underline underline-offset-2 hover:no-underline"
            >
              Upgrade
            </Link>
          </div>
        ) : (
          <div className="mb-2 flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>All tools unlocked</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors group-hover:text-red-500 dark:group-hover:text-red-400" />
          <span>{isPending ? "Signing out…" : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}

