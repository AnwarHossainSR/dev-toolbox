"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserPlan, type Plan } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import { Crown, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PremiumGateProps {
  children: React.ReactNode;
  /** Pass the plan from a server component to skip the client-side fetch */
  plan?: Plan;
}

export function PremiumGate({ children, plan: planProp }: PremiumGateProps) {
  const [plan, setPlan] = useState<Plan | null>(planProp ?? null);

  useEffect(() => {
    if (planProp !== undefined) return; // already provided by the server
    getUserPlan().then(setPlan);
  }, [planProp]);

  if (plan === null) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-1/3" />
      </div>
    );
  }

  if (plan !== "pro") {
    return <PremiumPaywall />;
  }

  return <>{children}</>;
}

function PremiumPaywall() {
  const premiumFeatures = [
    "All premium tools — unlocked",
    "Unlimited usage with no rate limits",
    "Priority email support",
    "Early access to new tools",
  ];

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/30">
            <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-400">
            <Crown className="h-3 w-3" />
            Pro Feature
          </div>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            Upgrade to unlock this tool
          </h2>
          <p className="mt-2 text-muted-foreground">
            This tool is available on the Pro plan. Upgrade to get instant
            access to all premium tools.
          </p>
        </div>

        {/* Feature list */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Everything in Pro
          </p>
          <ul className="space-y-2">
            {premiumFeatures.map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                  <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </span>
                <span className="text-foreground">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-2.5">
          <Button
            asChild
            size="lg"
            className={cn(
              "w-full gap-2 bg-amber-500 font-semibold text-black",
              "hover:bg-amber-400 dark:hover:bg-amber-600",
            )}
          >
            <Link href="/pricing">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="text-muted-foreground"
          >
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
