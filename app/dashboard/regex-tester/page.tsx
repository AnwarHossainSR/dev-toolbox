"use client";

import {
  Button,
  Card,
  FieldGroup,
  FieldLabel,
  Input,
  PremiumGate,
  Textarea,
  ToolLayout,
} from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";
import { useState } from "react";
import { toast } from "sonner";

function RegexTesterContent() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [flags, setFlags] = useState("g");
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleTest = () => {
    try {
      setError("");
      const regex = new RegExp(pattern, flags);
      const foundMatches = text.match(regex) || [];
      setMatches(foundMatches);
      toast.success(`Found ${foundMatches.length} match(es)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid regex";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="space-y-4 mb-6">
        <FieldGroup>
          <FieldLabel>Regex Pattern</FieldLabel>
          <Input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="^[a-zA-Z0-9]+$"
            className="font-mono"
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Flags</FieldLabel>
          <Input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m, s"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            g=global, i=ignore case, m=multiline, s=dotall
          </p>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel>Test Text</FieldLabel>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to test"
            className="font-mono text-sm h-40"
          />
        </FieldGroup>

        <Button onClick={handleTest} size="lg">
          Test Regex
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-500/10 border-red-500/30 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {matches.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Matches ({matches.length})</h3>
          <Card className="p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {matches.map((match, i) => (
                <div key={i} className="p-2 bg-muted rounded font-mono text-sm">
                  {match}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default function RegexTesterPage() {
  useTrackToolUsage("Regex Tester");

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test and debug regular expressions"
    >
      <PremiumGate>
        <RegexTesterContent />
      </PremiumGate>
    </ToolLayout>
  );
}

