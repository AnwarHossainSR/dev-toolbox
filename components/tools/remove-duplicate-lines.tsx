"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function removeDuplicates(
  text: string,
  options: {
    caseSensitive: boolean;
    keepEmpty: boolean;
    sortLines: boolean;
  },
): string {
  const lines = text.split("\n");
  const seen = new Set<string>();
  const uniqueLines: string[] = [];

  for (const line of lines) {
    const key = options.caseSensitive ? line : line.toLowerCase();

    if (seen.has(key)) continue;
    if (!options.keepEmpty && line.trim() === "") continue;

    seen.add(key);
    uniqueLines.push(line);
  }

  if (options.sortLines) {
    uniqueLines.sort();
  }

  return uniqueLines.join("\n");
}

export function RemoveDuplicateLines() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [options, setOptions] = useState({
    caseSensitive: false,
    keepEmpty: false,
    sortLines: false,
  });

  const handleRemove = () => {
    if (!input.trim()) {
      toast.error("Please enter some text");
      return;
    }

    const result = removeDuplicates(input, options);
    setOutput(result);

    const inputLines = input
      .split("\n")
      .filter((l) => options.keepEmpty || l.trim());
    const outputLines = result
      .split("\n")
      .filter((l) => options.keepEmpty || l.trim());
    const duplicatesRemoved = inputLines.length - outputLines.length;

    toast.success(
      `Removed ${duplicatesRemoved} duplicate${duplicatesRemoved !== 1 ? "s" : ""}`,
    );
  };

  const handleOptionChange = (key: string) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof options],
    }));
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast.success("Copied to clipboard!");
    }
  };

  const reset = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Enter Text</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Line 1&#10;Line 2&#10;Line 1&#10;Line 3&#10;Line 2"
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-3 p-4 bg-muted rounded-lg">
        <label className="block text-sm font-medium">Options</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="caseSensitive"
              checked={options.caseSensitive}
              onCheckedChange={() => handleOptionChange("caseSensitive")}
            />
            <Label
              htmlFor="caseSensitive"
              className="font-normal cursor-pointer"
            >
              Case Sensitive
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keepEmpty"
              checked={options.keepEmpty}
              onCheckedChange={() => handleOptionChange("keepEmpty")}
            />
            <Label htmlFor="keepEmpty" className="font-normal cursor-pointer">
              Keep Empty Lines
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sortLines"
              checked={options.sortLines}
              onCheckedChange={() => handleOptionChange("sortLines")}
            />
            <Label htmlFor="sortLines" className="font-normal cursor-pointer">
              Sort Lines Alphabetically
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleRemove} variant="default">
          Remove Duplicates
        </Button>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {output && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Result</label>
            <Button onClick={copyToClipboard} size="sm" variant="ghost">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap break-words max-h-[300px] overflow-auto">
            {output}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Original: {input.split("\n").length} lines → Unique:{" "}
            {output.split("\n").filter((l) => l.trim()).length} lines
          </div>
        </Card>
      )}
    </div>
  );
}
