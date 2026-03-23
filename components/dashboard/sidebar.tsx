"use client";

import { signOut } from "@/lib/auth-actions";
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

export function Sidebar() {
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
    <aside className="w-60 flex flex-col h-full bg-zinc-950 border-r border-zinc-800/60 overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-yellow-500 shrink-0">
          <Zap className="h-4 w-4 text-black" />
        </div>
        <Link
          href="/dashboard"
          className="font-bold text-white text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          Dev Toolbox
        </Link>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-3 shrink-0">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === "/dashboard"
              ? "bg-amber-500/10 text-amber-400"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/60",
          )}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </Link>
      </div>

      {/* Tools label */}
      <div className="px-4 pt-4 pb-1 shrink-0">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">
          Tools
        </p>
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
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 rounded-md hover:bg-zinc-800/40 transition-colors group mt-1"
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-3.5 w-3.5" />
                    <span>{CATEGORY_LABELS[category]}</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 rounded px-1.5 py-0.5 font-normal normal-case tracking-normal">
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
                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group",
                            isActive
                              ? "bg-amber-500/10 text-amber-400 font-medium"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-800/60",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-colors",
                              isActive
                                ? "text-amber-400"
                                : "text-zinc-500 group-hover:text-zinc-300",
                            )}
                          />
                          <span className="truncate">{tool.name}</span>
                          {isActive && (
                            <ChevronRight className="h-3 w-3 ml-auto text-amber-400/60 shrink-0" />
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
      <div className="shrink-0 border-t border-zinc-800/60 p-3">
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors group-hover:text-red-400" />
          <span>{isPending ? "Signing out…" : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}

