"use client";

import { PremiumGate } from "@/components/tools/premium-gate";
import { RemoveDuplicateLines } from "@/components/tools/remove-duplicate-lines";
import { ToolLayout } from "@/components/tools/tool-layout";
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
