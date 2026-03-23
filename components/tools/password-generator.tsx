"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function calculateStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;

  if (password.length >= 8) score += 1;
  if (password.length >= 16) score += 1;

  if (score <= 2) return { score: 20, label: "Very Weak", color: "bg-red-500" };
  if (score <= 4) return { score: 40, label: "Weak", color: "bg-orange-500" };
  if (score <= 6) return { score: 60, label: "Fair", color: "bg-yellow-500" };
  if (score <= 8) return { score: 80, label: "Good", color: "bg-blue-500" };
  return { score: 100, label: "Very Strong", color: "bg-green-500" };
}

function generatePassword(
  length: number,
  options: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    special: boolean;
    excludeAmbiguous: boolean;
  },
): string {
  let chars = "";
  let allChars = "";

  if (options.uppercase) {
    const upper = options.excludeAmbiguous
      ? "ABCDEFGHJKMNPQRSTUVWXYZ"
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    chars += upper;
    allChars += upper;
  }

  if (options.lowercase) {
    const lower = options.excludeAmbiguous
      ? "abcdefghjkmnpqrstuvwxyz"
      : "abcdefghijklmnopqrstuvwxyz";
    chars += lower;
    allChars += lower;
  }

  if (options.numbers) {
    const nums = options.excludeAmbiguous ? "23456789" : "0123456789";
    chars += nums;
    allChars += nums;
  }

  if (options.special) {
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    chars += special;
    allChars += special;
  }

  if (!chars) return "";

  let password = "";

  // Ensure at least one character from each selected category
  const categories = [];
  if (options.uppercase)
    categories.push(
      options.excludeAmbiguous
        ? "ABCDEFGHJKMNPQRSTUVWXYZ"
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    );
  if (options.lowercase)
    categories.push(
      options.excludeAmbiguous
        ? "abcdefghjkmnpqrstuvwxyz"
        : "abcdefghijklmnopqrstuvwxyz",
    );
  if (options.numbers)
    categories.push(options.excludeAmbiguous ? "23456789" : "0123456789");
  if (options.special) categories.push("!@#$%^&*()_+-=[]{}|;:,.<>?");

  for (const category of categories) {
    password += category[Math.floor(Math.random() * category.length)];
  }

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
    excludeAmbiguous: false,
  });

  const handleGenerate = () => {
    const generated = generatePassword(length, options);
    if (!generated) {
      toast.error("Select at least one character type");
      return;
    }
    setPassword(generated);
    toast.success("Password generated!");
  };

  const handleOptionChange = (key: string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof options],
    }));
  };

  const copyToClipboard = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      toast.success("Copied to clipboard!");
    }
  };

  const strength = calculateStrength(password);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">
            Password Length: {length}
          </label>
        </div>
        <Slider
          value={[length]}
          onValueChange={(value) => setLength(value[0])}
          min={8}
          max={128}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>8</span>
          <span>128</span>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">Character Types</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={options.uppercase}
              onCheckedChange={() => handleOptionChange("uppercase")}
            />
            <Label htmlFor="uppercase" className="font-normal cursor-pointer">
              Uppercase (A-Z)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={options.lowercase}
              onCheckedChange={() => handleOptionChange("lowercase")}
            />
            <Label htmlFor="lowercase" className="font-normal cursor-pointer">
              Lowercase (a-z)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={options.numbers}
              onCheckedChange={() => handleOptionChange("numbers")}
            />
            <Label htmlFor="numbers" className="font-normal cursor-pointer">
              Numbers (0-9)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="special"
              checked={options.special}
              onCheckedChange={() => handleOptionChange("special")}
            />
            <Label htmlFor="special" className="font-normal cursor-pointer">
              Special (!@#$%^&*)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ambiguous"
              checked={options.excludeAmbiguous}
              onCheckedChange={() => handleOptionChange("excludeAmbiguous")}
            />
            <Label htmlFor="ambiguous" className="font-normal cursor-pointer">
              Exclude ambiguous characters (0/O, 1/l, etc.)
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerate} variant="default" className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Generate
        </Button>
      </div>

      {password && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Your Password</label>
              <Button onClick={copyToClipboard} size="sm" variant="ghost">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-md break-all font-mono text-sm">
              {password}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Strength</span>
                <span
                  className={`text-sm font-medium ${
                    strength.color === "bg-red-500"
                      ? "text-red-500"
                      : strength.color === "bg-orange-500"
                        ? "text-orange-500"
                        : strength.color === "bg-yellow-500"
                          ? "text-yellow-500"
                          : strength.color === "bg-blue-500"
                            ? "text-blue-500"
                            : "text-green-500"
                  }`}
                >
                  {strength.label}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
