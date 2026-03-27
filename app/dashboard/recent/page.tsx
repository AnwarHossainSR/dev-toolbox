import { getUserPlan } from "@/lib/subscription";
import { getRecentlyUsedTools } from "@/lib/tool-actions";
import { TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { Clock, Lock } from "lucide-react";
import Link from "next/link";

export default async function RecentPage() {
  const [recentNames, plan] = await Promise.all([
    getRecentlyUsedTools(20),
    getUserPlan(),
  ]);

  // Preserve the order returned by the API (most recent first)
  const recentTools = recentNames
    .map((name) => TOOLS.find((t) => t.name === name))
    .filter(Boolean) as typeof TOOLS;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6 text-amber-400" />
          Recently Used
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {recentTools.length > 0
            ? `${recentTools.length} recently used tool${recentTools.length !== 1 ? "s" : ""}`
            : "No tools used yet"}
        </p>
      </div>

      {recentTools.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            No activity yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Tools you use will appear here so you can quickly jump back into
            them.
          </p>
          <Link
            href="/dashboard/tools"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 transition-colors"
          >
            Browse all tools
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentTools.map((tool, i) => {
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
                {/* Recency badge */}
                {i === 0 && (
                  <span className="absolute top-3 left-3 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 dark:text-amber-400">
                    Latest
                  </span>
                )}
                {tool.isPremium && (
                  <span className="absolute top-3 right-3 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500 dark:text-amber-400">
                    PRO
                  </span>
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg">
                  {tool.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-amber-500 transition-colors truncate pr-8">
                    {tool.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-[1px]">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
