"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { UnixTimestamp } from "@/components/tools/unix-timestamp";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";

export default function UnixTimestampPage() {
  useTrackToolUsage("Unix Timestamp");

  return (
    <ToolLayout
      title="Unix Timestamp"
      description="Convert Unix timestamps to human-readable dates and back"
    >
      <UnixTimestamp />
    </ToolLayout>
  );
}
