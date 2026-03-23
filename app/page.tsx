"use client";

import { Button, Card } from "@/components";
import Footer from "@/components/public/footer";
import PublicNavbar from "@/components/public/navbar";
import { ArrowRight, Code2, Gauge, Lock, Palette } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Code2,
    title: "Developer Tools",
    description:
      "Essential tools for coding including JSON formatter, regex tester, JWT decoder, and more.",
  },
  {
    icon: Palette,
    title: "Design Tools",
    description:
      "Color converter, QR code generator, markdown preview, and other design utilities.",
  },
  {
    icon: Lock,
    title: "Security Tools",
    description:
      "Hash generator, password generator, base64 encoder/decoder for secure operations.",
  },
  {
    icon: Gauge,
    title: "Performance",
    description:
      "Fast, serverless tools that run instantly without any lag or delay.",
  },
];

const tools = [
  "Base64 Encoder/Decoder",
  "Case Converter",
  "Color Converter",
  "Hash Generator",
  "JSON Formatter",
  "JWT Decoder",
  "Markdown Preview",
  "Password Generator",
  "QR Code Generator",
  "Regex Tester",
  "SQL Formatter",
  "Text Diff",
  "URL Encoder/Decoder",
  "UUID Generator",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent opacity-50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <span className="text-sm font-medium text-amber-300">
              ✨ Welcome to Dev Toolbox
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Essential Developer
            <span className="block bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Tools in One Place
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            A comprehensive suite of free, open-source tools for developers.
            Format JSON, generate hashes, convert colors, test regex, and much
            more—all in one elegant interface.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Button
              className="h-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-lg hover:from-amber-600 hover:to-yellow-600"
              asChild
            >
              <Link href="/auth/sign-up">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 border-border text-foreground hover:bg-muted"
              asChild
            >
              <Link href="/features">Explore Tools</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 pt-12 border-t border-border">
            <div>
              <div className="text-3xl font-bold text-amber-400">14+</div>
              <div className="text-sm text-muted-foreground">
                Developer Tools
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">100%</div>
              <div className="text-sm text-muted-foreground">
                Free & Open Source
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">Fast</div>
              <div className="text-sm text-muted-foreground">
                Instant Results
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold md:text-5xl mb-4">
              Why Choose Dev Toolbox?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to streamline your development
              workflow
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border-border bg-card p-6 hover:border-amber-500/30 transition-colors"
                >
                  <Icon className="h-8 w-8 text-amber-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="border-t border-border py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold md:text-5xl mb-4">Our Tools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A wide range of tools to help with every aspect of development
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {tools.map((tool) => (
              <div
                key={tool}
                className="rounded-lg border border-border bg-card/50 p-4 text-center hover:border-amber-500/30 hover:bg-muted transition-all"
              >
                <p className="text-sm font-medium">{tool}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold md:text-5xl mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of developers who are already using Dev Toolbox to
            streamline their work.
          </p>
          <Button
            className="h-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-lg hover:from-amber-600 hover:to-yellow-600"
            asChild
          >
            <Link href="/auth/sign-up">
              Sign Up for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

