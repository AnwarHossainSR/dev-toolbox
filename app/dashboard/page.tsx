import { FavoritesSection } from "@/components/dashboard/favorites-section";
import { RecentlyUsed } from "@/components/dashboard/recently-used";
import { TOOLS } from "@/lib/tools";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to DevTools
        </h1>
        <p className="text-muted-foreground">
          Your collection of powerful developer utilities in one place
        </p>
      </div>

      <RecentlyUsed />
      <FavoritesSection />

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">All Tools</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => {
          const slug = tool.name.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={tool.name}
              href={`/dashboard/${slug}`}
              className="block p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{tool.icon}</span>
                <h3 className="font-semibold text-foreground">{tool.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

