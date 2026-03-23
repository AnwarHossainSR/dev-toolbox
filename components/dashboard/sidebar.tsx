'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS } from '@/lib/tools';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    developer: true,
    text: true,
    utility: true,
  });

  const toggleCategory = (category: string) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const categorizedTools = TOOL_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = TOOLS.filter((tool) => tool.category === category);
      return acc;
    },
    {} as Record<string, typeof TOOLS>
  );

  return (
    <aside className="w-64 bg-muted border-r border-border h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-80"
        >
          <span className="text-xl">⚡</span>
          DevTools
        </Link>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 p-2">
          {TOOL_CATEGORIES.map((category) => {
            const isExpanded = expanded[category];

            return (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  <span className="capitalize">{category}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      'transition-transform',
                      isExpanded ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="ml-2 space-y-1 mt-1">
                    {categorizedTools[category].map((tool) => (
                      <Link
                        key={tool.name}
                        href={`/dashboard/tools/${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      >
                        <span className="mr-2">{tool.icon}</span>
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
