"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Simple SQL formatter
function formatSQL(sql: string): string {
  let formatted = sql;

  // Add newlines after keywords
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "GROUP BY",
    "ORDER BY",
    "HAVING",
    "LIMIT",
  ];
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    formatted = formatted.replace(regex, `\n${keyword}`);
  });

  // Indent WHERE conditions
  formatted = formatted.replace(/AND\s+/gi, "\n  AND ");
  formatted = formatted.replace(/OR\s+/gi, "\n  OR ");

  // Remove extra whitespace
  formatted = formatted
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Uppercase keywords
  formatted = formatted.replace(
    /\b(select|from|where|join|left|right|inner|group|order|having|limit|and|or|on|as)\b/gi,
    (match) => match.toUpperCase(),
  );

  return formatted;
}

export function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    try {
      if (!input.trim()) {
        toast.error("Please enter SQL");
        return;
      }
      const formatted = formatSQL(input);
      setOutput(formatted);
      toast.success("SQL formatted!");
    } catch (err) {
      toast.error("Error formatting SQL");
    }
  };

  const handleMinify = () => {
    try {
      if (!input.trim()) {
        toast.error("Please enter SQL");
        return;
      }
      const minified = input.replace(/\s+/g, " ").trim();
      setOutput(minified);
      toast.success("SQL minified!");
    } catch (err) {
      toast.error("Error minifying SQL");
    }
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
        <label className="block text-sm font-medium mb-2">Enter SQL</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="SELECT * FROM users WHERE id = 1;"
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleFormat} variant="default">
          Format
        </Button>
        <Button onClick={handleMinify} variant="outline">
          Minify
        </Button>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {output && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Formatted SQL</label>
            <Button onClick={copyToClipboard} size="sm" variant="ghost">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] font-mono text-sm">
            {output}
          </pre>
        </Card>
      )}
    </div>
  );
}
