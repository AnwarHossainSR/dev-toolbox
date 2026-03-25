import { getUserPlan } from "@/lib/subscription";
import { TOOLS } from "@/lib/tools";
import { Check, CreditCard, Zap } from "lucide-react";
import Link from "next/link";

const PRO_FEATURES = [
  "Unlock all " + TOOLS.filter((t) => t.isPremium).length + " premium tools",
  "JWT Decoder, Hash Generator, SQL Formatter",
  "Regex Tester, Markdown Previewer, Text Diff",
  "QR Code Generator, Password Generator",
  "All Image tools (Resizer, Compressor, Cropper…)",
  "Priority support",
  "Early access to new tools",
];

const FREE_FEATURES = [
  "Access to " + TOOLS.filter((t) => !t.isPremium).length + " free tools",
  "JSON Formatter, UUID Generator, URL Encoder",
  "Word Counter, Color Converter, Unix Timestamp",
  "Command palette (⌘K) search",
  "Favorites & recent history",
];

export default async function BillingPage() {
  const plan = await getUserPlan();
  const isPro = plan === "pro";

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-amber-400" />
          Billing
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and plan
        </p>
      </div>

      {/* Current plan banner */}
      <div
        className={`rounded-xl border p-5 mb-8 ${
          isPro ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Current plan
            </p>
            <p className="text-xl font-bold text-foreground flex items-center gap-2">
              {isPro ? (
                <>
                  <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
                  Pro Plan
                </>
              ) : (
                "Free Plan"
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isPro
                ? "All tools unlocked · Renews monthly"
                : `${TOOLS.filter((t) => !t.isPremium).length} free tools · Upgrade to unlock ${TOOLS.filter((t) => t.isPremium).length} more`}
            </p>
          </div>
          {isPro && (
            <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black">
              ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Free */}
        <div
          className={`rounded-xl border p-6 ${
            !isPro
              ? "border-amber-500/30 ring-1 ring-amber-500/20"
              : "border-border"
          } bg-card`}
        >
          <div className="mb-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Free
            </p>
            <p className="text-3xl font-bold text-foreground">
              $0
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            </p>
          </div>
          <ul className="space-y-2 mb-6">
            {FREE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-2.5 text-center text-sm text-muted-foreground font-medium">
              Current plan
            </div>
          )}
        </div>

        {/* Pro */}
        <div
          className={`rounded-xl border p-6 ${
            isPro
              ? "border-amber-500/30 ring-1 ring-amber-500/20"
              : "border-border"
          } bg-card relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-400 px-3 py-1 text-[10px] font-bold text-black">
            POPULAR
          </div>
          <div className="mb-4">
            <p className="text-sm font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1">
              Pro
            </p>
            <p className="text-3xl font-bold text-foreground">
              $9
              <span className="text-base font-normal text-muted-foreground">
                /mo
              </span>
            </p>
          </div>
          <ul className="space-y-2 mb-6">
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-500 dark:text-amber-400 font-medium">
              Current plan
            </div>
          ) : (
            <Link
              href="/pricing"
              className="block rounded-lg bg-amber-400 px-4 py-2.5 text-center text-sm font-semibold text-black hover:bg-amber-300 transition-colors"
            >
              Upgrade to Pro →
            </Link>
          )}
        </div>
      </div>

      {/* Payment note */}
      {!isPro && (
        <p className="text-xs text-muted-foreground mt-6 text-center">
          Secure payment via Stripe · Cancel anytime · No hidden fees
        </p>
      )}
    </div>
  );
}
