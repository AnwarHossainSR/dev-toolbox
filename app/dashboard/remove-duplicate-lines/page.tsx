"use client";

import { PremiumGate, RemoveDuplicateLines, ToolLayout } from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";

export default function RemoveDuplicateLinesPage() {
  useTrackToolUsage("Remove Duplicate Lines");

  return (
    <ToolLayout
      title="Remove Duplicate Lines"
      description="Remove duplicate lines from your text with advanced options"
    >
      <PremiumGate>
        <RemoveDuplicateLines />
      </PremiumGate>
    </ToolLayout>
  );
}
