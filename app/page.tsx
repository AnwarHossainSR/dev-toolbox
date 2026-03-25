"use client";

import Footer from "@/components/public/footer";
import PublicNavbar from "@/components/public/navbar";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  Code2,
  Image as ImageIcon,
  Palette,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "45", label: "Total Tools" },
  { value: "22", label: "Free Tools" },
  { value: "100%", label: "Browser-side" },
  { value: "0ms", label: "Server Round-trip" },
];

const features = [
  {
    icon: Code2,
    title: "Developer tools",
    description:
      "JSON formatting, JWT decoding, Base64 encoding, SQL beautifying — the stuff you actually use daily.",
  },
  {
    icon: Shield,
    title: "Privacy first",
    description:
      "Everything runs in your browser. Your data never touches our servers. Period.",
  },
  {
    icon: Zap,
    title: "Instant results",
    description:
      "No loading spinners, no API calls. Results appear as you type.",
  },
  {
    icon: Palette,
    title: "Design tools",
    description:
      "Color converter, QR code generator, markdown preview, and more for design-adjacent work.",
  },
  {
    icon: ImageIcon,
    title: "Image utilities",
    description:
      "Resize, compress, crop, convert formats, extract EXIF data — 14 image tools total.",
  },
  {
    icon: Bot,
    title: "AI copilot",
    description:
      "Gemini-powered guidance for image tasks. Suggests optimal settings before you export.",
  },
];

const toolsList = [
  { name: "JSON Formatter", isPro: false },
  { name: "JWT Decoder", isPro: true },
  { name: "Base64 Encoder", isPro: false },
  { name: "Hash Generator", isPro: true },
  { name: "UUID Generator", isPro: false },
  { name: "SQL Formatter", isPro: true },
  { name: "Regex Tester", isPro: true },
  { name: "URL Encoder", isPro: false },
  { name: "Markdown Preview", isPro: true },
  { name: "Text Diff", isPro: true },
  { name: "Color Converter", isPro: false },
  { name: "QR Code Generator", isPro: true },
  { name: "Image Resizer", isPro: false },
  { name: "Image Compressor", isPro: false },
  { name: "Background Remover", isPro: true },
  { name: "Password Generator", isPro: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">
              45 developer tools, all free
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl leading-tight">
            Every Dev Tool
            <br />
            You Actually <span className="text-amber-400">Need</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            Format JSON. Decode JWTs. Generate hashes. Build regex. All in one
            place, browser-side, zero data leaving your machine.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              className="h-11 px-6 bg-amber-400 text-black font-semibold hover:bg-amber-300"
              asChild
            >
              <Link href="/auth/sign-up">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-11 px-6 border-border text-foreground hover:bg-muted"
              asChild
            >
              <Link href="/features">Explore Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Dev Toolbox */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-4">
              WHY DEV TOOLBOX
            </p>
            <h2 className="text-3xl font-bold md:text-4xl mb-3">
              Built for developers, not marketers
            </h2>
            <p className="text-muted-foreground">
              No tracking. No server uploads. No bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 hover:border-amber-500/30 transition-colors"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-4">
              THE FULL SUITE
            </p>
            <h2 className="text-3xl font-bold md:text-4xl mb-3">
              45 tools across 4 categories
            </h2>
            <p className="text-muted-foreground">
              Developer &middot; Text &middot; Utility &middot; Image
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {toolsList.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-card/50 px-4 py-3 hover:border-amber-500/30 hover:bg-card transition-all"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <span className="text-sm font-medium truncate">
                  {tool.name}
                </span>
                {tool.isPro && (
                  <span className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    PRO
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-3">
            Start using it today. It&apos;s free.
          </h2>
          <p className="text-muted-foreground mb-8">
            No credit card. No sign-up friction. Just open it and go.
          </p>
          <Button
            className="h-11 px-6 bg-amber-400 text-black font-semibold hover:bg-amber-300"
            asChild
          >
            <Link href="/auth/sign-up">
              Sign Up Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

