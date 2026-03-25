"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
                <Zap className="h-4 w-4 text-black" />
              </div>
              <span className="text-base font-bold text-foreground">
                Dev Toolbox
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Essential developer utilities. All in one place.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-foreground transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Dev Toolbox. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">
              Browser-side · Private
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
