"use client";

import { PremiumGate, SqlFormatter, ToolLayout } from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";

export default function SqlFormatterPage() {
  useTrackToolUsage("SQL Formatter");

  return (
    <ToolLayout
      title="SQL Formatter"
      description="Format and beautify SQL queries for better readability"
    >
      <PremiumGate>
        <SqlFormatter />
      </PremiumGate>
    </ToolLayout>
  );
}
