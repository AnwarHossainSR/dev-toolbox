"use client";

import { PasswordGenerator } from "@/components/tools/password-generator";
import { ToolLayout } from "@/components/tools/tool-layout";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";

export default function PasswordGeneratorPage() {
  useTrackToolUsage("Password Generator");

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure random passwords with custom options"
    >
      <PasswordGenerator />
    </ToolLayout>
  );
}
