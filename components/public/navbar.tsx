"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/docs", label: "Docs" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
              <Zap className="h-4 w-4 text-black" />
            </div>
            <span className="text-base font-bold text-foreground">
              Dev Toolbox
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  isActive(link.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                className="h-8 bg-amber-400 text-black font-medium hover:bg-amber-300 text-sm gap-1.5"
                asChild
              >
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="h-8 border-border text-foreground hover:bg-accent text-sm px-4"
                  asChild
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  className="h-8 bg-amber-400 text-black font-medium hover:bg-amber-300 text-sm gap-1.5"
                  asChild
                >
                  <Link href="/dashboard">
                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
