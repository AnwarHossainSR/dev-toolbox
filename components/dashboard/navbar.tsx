"use client";

import { useTheme } from "@/components/theme-provider";
import { Bell, Moon, Search, Sun } from "lucide-react";
import * as React from "react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Navbar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const greeting = getGreeting();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const openSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 shrink-0 border-b border-border bg-background flex items-center justify-between px-6 gap-4">
      {/* Left: Greeting */}
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground leading-tight truncate">
          {greeting}, {userName} 👋
        </h2>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Here&apos;s what&apos;s going on with your workspace today
        </p>
      </div>

      {/* Center: Search */}
      <button
        onClick={openSearch}
        className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-64 shrink-0"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">Search tools...</span>
        <kbd className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search */}
        <button
          onClick={openSearch}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Search tools"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-black text-xs font-bold cursor-default select-none"
          title={userEmail}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

