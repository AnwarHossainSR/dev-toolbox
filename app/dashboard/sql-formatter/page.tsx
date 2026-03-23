"use client";

import { PremiumGate } from "@/components/tools/premium-gate";
import { SqlFormatter } from "@/components/tools/sql-formatter";
import { ToolLayout } from "@/components/tools/tool-layout";
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
