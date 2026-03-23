"use client";

import { ToolLayout, UnixTimestamp } from "@/components";
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
