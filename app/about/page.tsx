import { Footer } from "@/components";
import { PublicNavbar } from "@/components";
import { Card } from "@/components";
import { Heart, Target, Users, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      {/* Hero */}
      <section className="border-b border-border py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About Dev Toolbox
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Empowering developers with essential tools to streamline their
            workflow
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b border-border py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Dev Toolbox was created with a simple mission: to provide
                developers with a comprehensive suite of tools that make their
                daily work easier and more efficient.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                We believe that great tools should be simple, fast, and
                accessible to everyone. That's why we've built Dev Toolbox as a
                free, open-source platform.
              </p>
              <p className="text-lg text-muted-foreground">
                Whether you're formatting JSON, generating hashes, converting
                colors, or testing regex patterns, Dev Toolbox has you covered.
              </p>
            </div>
            <Card className="border-zinc-800 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-12 flex items-center justify-center">
              <Target className="h-24 w-24 text-amber-400" />
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-border py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-16 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Speed",
                desc: "Lightning-fast tools that deliver instant results",
              },
              {
                icon: Users,
                title: "Community",
                desc: "Built by developers, for developers",
              },
              {
                icon: Heart,
                title: "Quality",
                desc: "Obsessed with excellence and attention to detail",
              },
              {
                icon: Zap,
                title: "Innovation",
                desc: "Constantly improving and adding new features",
              },
            ].map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="border-border bg-card p-8 text-center"
                >
                  <Icon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">
            By The Numbers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { number: "14+", label: "Developer Tools" },
              { number: "100%", label: "Free & Open Source" },
              { number: "∞", label: "Unlimited Usage" },
              { number: "24/7", label: "Always Available" },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="border-border bg-card p-8 text-center"
              >
                <div className="text-4xl font-bold text-amber-400 mb-2">
                  {stat.number}
                </div>
                <p className="text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="border-b border-border py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-8">Our Story</h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Dev Toolbox started as a personal project to solve a common
              problem: there are countless developer tools scattered across the
              internet, often requiring multiple tabs and logins.
            </p>
            <p>
              We decided to create a unified platform where developers could
              find all the tools they need in one place, with a clean interface
              and lightning-fast performance.
            </p>
            <p>
              Today, Dev Toolbox serves as a go-to resource for developers
              worldwide, providing reliable, open-source tools that help
              thousands of developers every single day.
            </p>
            <p>
              We're committed to continuously improving Dev Toolbox, adding new
              features, and listening to our community's feedback to make it
              even better.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
