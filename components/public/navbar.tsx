"use client";

import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
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
              href="/'features"
              className={`text-sm transition-colors ${
                isActive("/features")
                  ? "text-amber-400"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Features
            </Link>
            <Link
              href="/about"
              className={`text-sm transition-colors ${
                isActive("/about")
                  ? "text-amber-400"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              About
            </Link>
            <Link
              href="/pricing"
              className={`text-sm transition-colors ${
                isActive("/pricing")
                  ? "text-amber-400"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-zinc-300 hover:text-white hover:bg-zinc-800"
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
          </div>
        </div>
      </div>
    </nav>
  );
}
