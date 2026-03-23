"use client";

import { ToolLayout } from "@/components/tools/tool-layout";
import { WordCounter } from "@/components/tools/word-counter";
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
