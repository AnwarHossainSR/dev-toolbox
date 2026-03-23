"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function PasswordStrength({ password }: { password: string }) {
  const strength = {
    score: 0,
    label: "Weak",
    color: "text-red-400",
  };

  if (password.length >= 8) strength.score++;
  if (password.length >= 12) strength.score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength.score++;
  if (/\d/.test(password)) strength.score++;
  if (/[^A-Za-z0-9]/.test(password)) strength.score++;

  if (strength.score <= 2) {
    strength.label = "Weak";
    strength.color = "text-red-400";
  } else if (strength.score === 3) {
    strength.label = "Fair";
    strength.color = "text-yellow-400";
  } else if (strength.score === 4) {
    strength.label = "Good";
    strength.color = "text-blue-400";
  } else {
    strength.label = "Strong";
    strength.color = "text-green-400";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              strength.score === 1
                ? "w-1/4 bg-red-500"
                : strength.score === 2
                  ? "w-1/2 bg-yellow-500"
                  : strength.score === 3
                    ? "w-3/4 bg-blue-500"
                    : "w-full bg-green-500"
            }`}
          />
        </div>
        <span className={`text-xs font-semibold ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      <ul className="space-y-1 text-xs text-zinc-400">
        <li className="flex items-center gap-2">
          {password.length >= 8 ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <X className="h-3 w-3 text-zinc-600" />
          )}
          At least 8 characters
        </li>
        <li className="flex items-center gap-2">
          {/[A-Z]/.test(password) && /[a-z]/.test(password) ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <X className="h-3 w-3 text-zinc-600" />
          )}
          Mix of uppercase and lowercase
        </li>
        <li className="flex items-center gap-2">
          {/\d/.test(password) ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <X className="h-3 w-3 text-zinc-600" />
          )}
          Includes a number
        </li>
        <li className="flex items-center gap-2">
          {/[^A-Za-z0-9]/.test(password) ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <X className="h-3 w-3 text-zinc-600" />
          )}
          Includes a special character
        </li>
      </ul>
    </div>
  );
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = password === repeatPassword && password.length > 0;
  const isPasswordStrong =
    password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-zinc-400">
          Join Dev Toolbox and start using powerful tools
        </p>
      </div>

      <div className="bg-zinc-950 rounded-lg border border-zinc-800 p-6">
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="border-zinc-700 bg-zinc-900 placeholder:text-zinc-500 focus:border-amber-500"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-zinc-700 bg-zinc-900 placeholder:text-zinc-500 focus:border-amber-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password && <PasswordStrength password={password} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="repeat-password" className="text-white">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="repeat-password"
                type={showRepeatPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                disabled={isLoading}
                className="border-zinc-700 bg-zinc-900 placeholder:text-zinc-500 focus:border-amber-500 pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword((v) => !v)}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  tabIndex={-1}
                >
                  {showRepeatPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                {repeatPassword &&
                  (passwordsMatch ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-4 w-4 text-red-400" />
                  ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !passwordsMatch || !isPasswordStrong}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600 font-semibold disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-zinc-950 px-2 text-zinc-400">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-zinc-700 hover:bg-zinc-900"
          >
            GitHub
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

