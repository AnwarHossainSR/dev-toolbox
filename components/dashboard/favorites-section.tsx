"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFavorites } from "@/lib/tool-actions";
import { TOOLS } from "@/lib/tools";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FavoritesSection() {
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(setTools)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Favorites</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!tools.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Favorites</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((toolName) => {
          const tool = TOOLS.find((t) => t.name === toolName);
          if (!tool) return null;
          const slug = toolName.toLowerCase().replace(/\s+/g, "-");
          return (
            <Link key={toolName} href={`/dashboard/${slug}`}>
              <Card className="p-4 border border-yellow-500/30 hover:bg-yellow-500/5 backdrop-blur cursor-pointer transition-all h-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{tool.icon}</span>
                  <h3 className="font-semibold text-sm">{toolName}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {tool.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
