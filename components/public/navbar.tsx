"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LayoutGrid, Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Dev Toolbox
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/features"
              className={`text-sm transition-colors ${
                isActive("/features")
                  ? "text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Features
            </Link>
            <Link
              href="/about"
              className={`text-sm transition-colors ${
                isActive("/about")
                  ? "text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              About
            </Link>
            <Link
              href="/pricing"
              className={`text-sm transition-colors ${
                isActive("/pricing")
                  ? "text-amber-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Auth Buttons + Theme Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {isLoggedIn ? (
              <Button
                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600 gap-2"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutGrid className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
                  asChild
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
                  asChild
                >
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
