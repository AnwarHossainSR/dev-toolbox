"use client";

import { PremiumGate } from "@/components/tools/premium-gate";
import { ToolLayout } from "@/components/tools/tool-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";
import { useState } from "react";
import { toast } from "sonner";

function computeDiff(text1: string, text2: string) {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  const diff: Array<{
    type: "added" | "removed" | "unchanged";
    content: string;
  }> = [];

  const maxLines = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] ?? "";
    const line2 = lines2[i] ?? "";

    if (line1 === line2) {
      diff.push({ type: "unchanged", content: line1 });
    } else {
      if (line1) diff.push({ type: "removed", content: line1 });
      if (line2) diff.push({ type: "added", content: line2 });
    }
  }

  return diff;
}

function TextDiffContent() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diff, setDiff] = useState<Array<{ type: string; content: string }>>(
    [],
  );

  const handleCompare = () => {
    const result = computeDiff(text1, text2);
    setDiff(result);
    toast.success("Comparison complete!");
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Text 1</label>
          <Textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter first text"
            className="font-mono text-sm h-64"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Text 2</label>
          <Textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter second text"
            className="font-mono text-sm h-64"
          />
        </div>
      </div>

      <Button onClick={handleCompare} size="lg" className="mb-6">
        Compare
      </Button>

      {diff.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Differences</h3>
          <Card className="p-4 max-h-80 overflow-y-auto font-mono text-sm">
            {diff.map((line, i) => (
              <div
                key={i}
                className={`py-1 px-2 ${
                  line.type === "added"
                    ? "bg-green-500/10 text-green-600"
                    : line.type === "removed"
                      ? "bg-red-500/10 text-red-600"
                      : ""
                }`}
              >
                <span className="text-xs text-muted-foreground mr-2">
                  {line.type === "added"
                    ? "+"
                    : line.type === "removed"
                      ? "-"
                      : " "}
                </span>
                {line.content || "(empty line)"}
              </div>
            ))}
          </Card>
        </div>
      )}
    </>
  );
}

export default function TextDiffPage() {
  useTrackToolUsage("Text Diff");

  return (
    <ToolLayout
      title="Text Diff"
      description="Compare two texts and see the differences"
    >
      <PremiumGate>
        <TextDiffContent />
      </PremiumGate>
    </ToolLayout>
  );
}

