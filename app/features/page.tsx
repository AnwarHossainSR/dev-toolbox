import Footer from "@/components/public/footer";
import PublicNavbar from "@/components/public/navbar";
import { Card } from "@/components/ui/card";
import {
  Code2,
  Database,
  Gauge,
  Globe,
  Lightbulb,
  Lock,
  Palette,
  Shield,
  Smartphone,
  Workflow,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "JSON Formatter",
    description: "Format, minify, and validate JSON with syntax highlighting",
  },
  {
    icon: Code2,
    title: "XML Formatter",
    description: "Format and beautify XML documents with full validation",
  },
  {
    icon: Palette,
    title: "Color Converter",
    description:
      "Convert between HEX, RGB, HSL, and other color formats instantly",
  },
  {
    icon: Lock,
    title: "Hash Generator",
    description: "Generate MD5, SHA1, SHA256 hashes for any text input",
  },
  {
    icon: Code2,
    title: "JWT Decoder",
    description: "Decode and verify JWT tokens with detailed inspection",
  },
  {
    icon: Zap,
    title: "Base64 Encoder/Decoder",
    description: "Quickly encode and decode base64 strings and files",
  },
  {
    icon: Code2,
    title: "Regex Tester",
    description: "Test and debug regular expressions with live matching",
  },
  {
    icon: Palette,
    title: "QR Code Generator",
    description: "Generate QR codes from text and URLs with customization",
  },
  {
    icon: Database,
    title: "SQL Formatter",
    description: "Format and beautify SQL queries with proper indentation",
  },
  {
    icon: Code2,
    title: "Text Diff",
    description: "Compare two texts and see differences highlighted clearly",
  },
  {
    icon: Lock,
    title: "Password Generator",
    description:
      "Create secure passwords with customizable options and strength indicator",
  },
  {
    icon: Workflow,
    title: "Case Converter",
    description:
      "Convert text between different cases: camelCase, snake_case, etc.",
  },
  {
    icon: Code2,
    title: "URL Encoder/Decoder",
    description: "Encode and decode URLs and URI components safely",
  },
  {
    icon: Gauge,
    title: "UUID Generator",
    description: "Generate v1, v4, and v5 UUIDs with one click",
  },
];

const categories = [
  {
    name: "Developer Tools",
    icon: Code2,
    description: "Tools for code formatting, validation, and transformation",
  },
  {
    name: "Design Tools",
    icon: Palette,
    description: "Tools for color conversion, QR codes, and design utilities",
  },
  {
    name: "Security Tools",
    icon: Lock,
    description: "Password generation, hashing, encoding, and encryption tools",
  },
  {
    name: "Utilities",
    icon: Zap,
    description: "General purpose tools for everyday development tasks",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Powerful Tools for
            <span className="block bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Every Developer
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zinc-400">
            Our comprehensive suite includes 14+ tools designed to streamline
            your development workflow
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-16 text-center">
            Tool Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.name}
                  className="border-zinc-800 bg-zinc-950 p-8 hover:border-amber-500/30 transition-colors text-center"
                >
                  <Icon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {category.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Features */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-16 text-center">All Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border-zinc-800 bg-zinc-950 p-6 hover:border-amber-500/30 transition-colors"
                >
                  <Icon className="h-8 w-8 text-amber-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-16 text-center">
            Why Dev Toolbox?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Instant results with no waiting",
              },
              {
                icon: Globe,
                title: "Always Available",
                desc: "Access from anywhere, anytime",
              },
              {
                icon: Shield,
                title: "Secure",
                desc: "All processing happens locally",
              },
              {
                icon: Smartphone,
                title: "Responsive",
                desc: "Works on all devices and browsers",
              },
              {
                icon: Database,
                title: "Modern Tech Stack",
                desc: "Built with latest technologies",
              },
              {
                icon: Lightbulb,
                title: "Simple & Intuitive",
                desc: "Easy to use for everyone",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 p-6 rounded-lg border border-zinc-800 bg-zinc-950"
                >
                  <Icon className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
