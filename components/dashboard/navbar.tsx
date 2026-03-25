"use client";

import { useTheme } from "@/components/theme-provider";
import { Bell, Moon, Sun } from "lucide-react";
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
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 shrink-0 border-b border-border bg-background flex items-center justify-between px-6">
      {/* Left: Greeting */}
      <div>
        <h2 className="text-base font-semibold text-foreground leading-tight">
          {greeting}, {userName} 👋
        </h2>
        <p className="text-xs text-muted-foreground">
          Here&apos;s what&apos;s going on with your workspace today
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
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

