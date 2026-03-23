import { Zap } from "lucide-react";
import Link from "next/link";

export default function AuthLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-amber-50 dark:from-amber-950 via-background to-background border-r border-border">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500">
              <Zap className="h-7 w-7 text-black" />
            </div>
            <span className="text-2xl font-bold">Dev Toolbox</span>
          </Link>
          <div className="mt-20 space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Your Developer Toolkit
              </h2>
              <p className="text-muted-foreground">
                All the tools you need to streamline your development workflow
                in one beautiful, fast interface.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="text-amber-400">✓</div>
                <div>
                  <p className="font-semibold">14+ Developer Tools</p>
                  <p className="text-sm text-muted-foreground">
                    JSON, XML, Regex, Hash, and more
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-amber-400">✓</div>
                <div>
                  <p className="font-semibold">Lightning Fast</p>
                  <p className="text-sm text-muted-foreground">
                    Instant results, no dependencies
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-amber-400">✓</div>
                <div>
                  <p className="font-semibold">100% Free</p>
                  <p className="text-sm text-muted-foreground">
                    Open source, forever free
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>© 2024 Dev Toolbox. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
