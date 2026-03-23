"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRecentlyUsedTools } from "@/lib/tool-actions";
import { TOOLS } from "@/lib/tools";
import Link from "next/link";
import { useEffect, useState } from "react";

export function RecentlyUsed() {
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentlyUsedTools(6)
      .then(setTools)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Recently Used</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!tools.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Recently Used</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tools.map((toolName) => {
          const tool = TOOLS.find((t) => t.name === toolName);
          if (!tool) return null;
          return (
            <Link key={toolName} href={tool.href}>
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow text-center h-full">
                <div className="text-2xl mb-2">{tool.icon}</div>
                <p className="text-xs font-medium text-foreground line-clamp-2">
                  {toolName}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

