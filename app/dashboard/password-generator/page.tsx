"use client";

import { PasswordGenerator, PremiumGate, ToolLayout } from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";

export default function PasswordGeneratorPage() {
  useTrackToolUsage("Password Generator");

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure random passwords with custom options"
    >
      <PremiumGate>
        <PasswordGenerator />
      </PremiumGate>
    </ToolLayout>
  );
}
