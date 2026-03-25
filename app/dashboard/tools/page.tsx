import { getUserPlan } from "@/lib/subscription";
import { TOOL_CATEGORIES, TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  developer: "Developer",
  text: "Text",
  utility: "Utility",
  image: "Image",
};

const CATEGORY_ICONS: Record<string, string> = {
  developer: "⚙️",
  text: "📝",
  utility: "🔧",
  image: "🖼️",
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const plan = await getUserPlan();

  const activeCategory = TOOL_CATEGORIES.includes(
    params.category as (typeof TOOL_CATEGORIES)[number],
  )
    ? (params.category as (typeof TOOL_CATEGORIES)[number])
    : null;

  const filteredTools = activeCategory
    ? TOOLS.filter((t) => t.category === activeCategory)
    : TOOLS;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {activeCategory ? CATEGORY_LABELS[activeCategory] : "All"} Tools
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}{" "}
          available
          {activeCategory ? ` in ${CATEGORY_LABELS[activeCategory]}` : ""}
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/dashboard/tools"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            !activeCategory
              ? "bg-amber-400 text-black"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          All
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              !activeCategory ? "bg-black/20" : "bg-background",
            )}
          >
            {TOOLS.length}
          </span>
        </Link>
        {TOOL_CATEGORIES.map((cat) => {
          const count = TOOLS.filter((t) => t.category === cat).length;
          return (
            <Link
              key={cat}
              href={`/dashboard/tools?category=${cat}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-amber-400 text-black"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  activeCategory === cat ? "bg-black/20" : "bg-background",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTools.map((tool) => {
          const locked = tool.isPremium && plan !== "pro";
          return (
            <Link
              key={tool.name}
              href={locked ? "/pricing" : tool.href}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all",
                locked
                  ? "opacity-70 hover:opacity-90"
                  : "hover:border-amber-400/50 hover:shadow-sm hover:shadow-amber-400/10",
              )}
            >
              {/* Pro badge */}
              {tool.isPremium && (
                <span className="absolute top-3 right-3 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 dark:text-amber-400">
                  PRO
                </span>
              )}

              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                {tool.icon}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-amber-500 transition-colors truncate pr-8">
                  {tool.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {tool.description}
                </p>
              </div>

              {/* Locked overlay */}
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-[1px]">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
