import Footer from "@/components/public/footer";
import PublicNavbar from "@/components/public/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "Always Free",
    description: "Perfect for getting started",
    features: [
      "All 14+ developer tools",
      "Unlimited usage",
      "No registration required",
      "No ads",
      "Fast performance",
      "Community support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "Coming Soon",
    description: "For power users",
    features: [
      "Everything in Free",
      "Advanced tool options",
      "Priority support",
      "Custom tool creation",
      "API access",
      "Cloud storage integration",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations",
    features: [
      "Everything in Pro",
      "On-premise deployment",
      "Dedicated support",
      "Custom integrations",
      "SSO & security features",
      "SLA guarantee",
    ],
    popular: false,
  },
];

const faqs = [
  {
    q: "Is Dev Toolbox really free?",
    a: "Yes! Dev Toolbox is completely free and will always be. Our mission is to provide developers with essential tools without any cost barriers.",
  },
  {
    q: "Do you store my data?",
    a: "No. All processing happens locally in your browser. We don't store or send any of your data to our servers.",
  },
  {
    q: "Is Dev Toolbox open source?",
    a: "Yes! Dev Toolbox is open-source and available on GitHub. Feel free to contribute, report issues, or fork the project.",
  },
  {
    q: "Can I use Dev Toolbox offline?",
    a: "You'll need an internet connection to access Dev Toolbox, but once loaded, most tools work without sending data anywhere.",
  },
  {
    q: "What browsers are supported?",
    a: "Dev Toolbox works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera.",
  },
  {
    q: "How often are new tools added?",
    a: "We regularly add new tools based on community requests and developer needs. Check back often for updates!",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-zinc-400">
            Start free, upgrade when you need to
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative border-2 p-8 transition-all ${
                  plan.popular
                    ? "border-amber-500 bg-gradient-to-br from-amber-500/5 to-yellow-500/5"
                    : "border-zinc-800 bg-zinc-950"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-1 rounded-full text-sm font-semibold text-black">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-zinc-400 mb-6">{plan.description}</p>
                <div className="mb-8">
                  <p className="text-4xl font-bold mb-2">{plan.price}</p>
                  {plan.price === "Coming Soon" && (
                    <p className="text-sm text-amber-400">
                      Limited early access available
                    </p>
                  )}
                </div>
                <Button
                  className={`w-full mb-8 h-11 font-semibold ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
                      : "border-zinc-700 text-white hover:bg-zinc-900"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild={plan.name === "Free"}
                >
                  {plan.name === "Free" ? (
                    <Link href="/auth/sign-up">Get Started Free</Link>
                  ) : (
                    <button disabled={plan.price === "Coming Soon"}>
                      {plan.price === "Coming Soon"
                        ? "Coming Soon"
                        : "Contact Sales"}
                    </button>
                  )}
                </Button>
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex gap-3">
                      <Check className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.q} className="border-zinc-800 bg-zinc-950 p-8">
                <h3 className="text-lg font-semibold mb-4">{faq.q}</h3>
                <p className="text-zinc-400">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-zinc-800 py-20 md:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-zinc-400 mb-8">
            Create a free account and start using Dev Toolbox today
          </p>
          <Button
            className="h-12 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-lg hover:from-amber-600 hover:to-yellow-600"
            asChild
          >
            <Link href="/auth/sign-up">Get Started Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
