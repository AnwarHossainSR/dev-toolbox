"use client";

import { ToolLayout, WordCounter } from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";

export default function WordCounterPage() {
  useTrackToolUsage("Word Counter");

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, and lines in your text"
    >
      <WordCounter />
    </ToolLayout>
  );
}
