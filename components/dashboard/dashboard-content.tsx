"use client";

import { type Plan } from "@/lib/subscription";
import { type Tool } from "@/lib/tools";
import { Crown, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const CATEGORIES = [
  "All",
  "Developer",
  "Text",
  "Utility",
  "Image",
  "Favorites",
] as const;
type Category = (typeof CATEGORIES)[number];

const statCards = [
  {
    label: "Tools used today",
    value: "12",
    sub: "↑ 4 vs yesterday",
    subColor: "text-green-500",
  },
  {
    label: "Total this month",
    value: "284",
    sub: "↑ 18% from last month",
    subColor: "text-green-500",
  },
  {
    label: "Most used tool",
    value: "JSON Formatter",
    sub: "Used 47 times",
    subColor: "text-muted-foreground",
    valueClass: "text-xl font-bold",
  },
  {
    label: "Plan",
    value: "Pro",
    sub: "23 tools unlocked",
    subColor: "text-muted-foreground",
    valueClass: "text-xl font-bold text-amber-500",
  },
];

export function DashboardContent({
  plan,
  userName,
  tools,
}: {
  plan: Plan;
  userName: string;
  tools: Tool[];
}) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [favorites] = useState<string[]>([]);

  const filteredTools = tools.filter((tool) => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Favorites") return favorites.includes(tool.name);
    return tool.category === activeCategory.toLowerCase();
  });

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground mb-2">{card.label}</p>
            <p
              className={
                card.valueClass ?? "text-2xl font-bold text-foreground"
              }
            >
              {card.value}
            </p>
            <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* All Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">All Tools</h2>
          <Link
            href="/dashboard/tools"
            className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
          >
            View all {tools.length} →
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-amber-400 text-black"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {cat === "Favorites" && <Star className="h-3.5 w-3.5" />}
              {cat}
            </button>
          ))}
        </div>

        {/* Tool cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.slice(0, 6).map((tool) => {
            const locked = tool.isPremium && plan !== "pro";
            return (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative block rounded-xl border border-border bg-card p-4 hover:border-amber-500/30 hover:bg-accent transition-colors"
              >
                {tool.isPremium && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Crown className="h-2.5 w-2.5" />
                    PRO
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3 pr-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-lg shrink-0">
                    {tool.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {tool.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  {locked ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Upgrade to unlock →
                    </span>
                  ) : (
                    <span>Used 0 times · Never</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Recent Activity
          </h2>
          <Link
            href="/dashboard/recent"
            className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
          >
            See full history →
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {tools.slice(0, 3).map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="flex items-center gap-4 px-4 py-3 hover:bg-accent transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-base shrink-0">
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {tool.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tool.description.slice(0, 40)}... ·{" "}
                  {tool.category.charAt(0).toUpperCase() +
                    tool.category.slice(1)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                Recently
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
