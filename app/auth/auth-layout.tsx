import { Image as ImageIcon, Moon, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Zap, text: "Instant results, no API round-trips" },
  { icon: Zap, text: "Data never leaves your browser" },
  { icon: ImageIcon, text: "14 image tools with AI guidance" },
  { icon: Moon, text: "Light and dark mode included" },
];

export default function AuthLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Branding (dark) */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-[#1c1c1e] text-white">
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold text-white">Dev Toolbox</span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight text-white">
              45 developer tools,
              <br />
              one clean interface
            </h2>
            <p className="text-[#a1a1aa] text-sm leading-relaxed max-w-xs">
              Everything you reach for daily — JSON, JWT, Base64, regex, SQL,
              hashes. All browser-side. No server, no tracking.
            </p>

            <ul className="space-y-3 pt-2">
              {features.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
                    <Zap className="h-3 w-3 text-amber-400" />
                  </div>
                  <span className="text-sm text-[#d4d4d8]">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-xs text-[#71717a]">
          © 2025 Dev Toolbox ·{" "}
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

