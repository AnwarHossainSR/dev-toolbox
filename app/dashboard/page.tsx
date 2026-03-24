import { FavoritesSection } from "@/components/dashboard/favorites-section";
import { RecentlyUsed } from "@/components/dashboard/recently-used";
import { getUserPlan } from "@/lib/subscription";
import { TOOLS } from "@/lib/tools";
import { Crown } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const plan = await getUserPlan();
  const lockedCount = TOOLS.filter((t) => t.isPremium).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to Dev Toolbox
        </h1>
        <p className="text-muted-foreground">
          Your collection of powerful developer utilities in one place
        </p>
      </div>

      {plan === "free" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <Crown className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">
              {lockedCount} tools are locked on the Free plan.
            </span>{" "}
            <Link
              href="/pricing"
              className="text-amber-700 underline underline-offset-2 hover:no-underline dark:text-amber-400"
            >
              Upgrade to Pro
            </Link>{" "}
            to unlock everything.
          </p>
        </div>
      )}

      <RecentlyUsed />
      <FavoritesSection />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">All Tools</h2>
        <span className="text-sm text-muted-foreground">
          {TOOLS.filter((t) => !t.isPremium).length} free,{" "}
          {TOOLS.filter((t) => t.isPremium).length} pro
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const locked = tool.isPremium && plan !== "pro";
          return (
            <Link
              key={tool.name}
              href={tool.href}
              className={`group relative block rounded-xl border p-4 transition-colors ${
                locked
                  ? "border-border hover:border-amber-500/40 hover:bg-amber-500/5"
                  : "border-border hover:bg-accent"
              }`}
            >
              {tool.isPremium && (
                <span
                  className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    plan === "pro"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  <Crown className="h-2.5 w-2.5" />
                  PRO
                </span>
              )}
              <div className="flex items-center gap-3 mb-2 pr-10">
                <span className={`text-2xl ${locked ? "opacity-60" : ""}`}>
                  {tool.icon}
                </span>
                <h3
                  className={`font-semibold ${locked ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {tool.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
              {locked && (
                <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                  Upgrade to unlock →
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

