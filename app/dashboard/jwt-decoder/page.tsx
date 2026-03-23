"use client";

import { Button, Card, PremiumGate, Textarea, ToolLayout } from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";
import { useState } from "react";
import { toast } from "sonner";

function decodeJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const decoded: Record<string, any> = {};

    // Decode header
    const header = JSON.parse(
      atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")),
    );
    decoded.header = header;

    // Decode payload
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    decoded.payload = payload;

    return decoded;
  } catch {
    throw new Error("Invalid JWT token");
  }
}

function JwtDecoderContent() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<Record<string, any> | null>(null);

  const handleDecode = () => {
    try {
      const result = decodeJWT(input);
      setDecoded(result);
      toast.success("Decoded successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Decoding failed");
    }
  };

  return (
    <>
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium">JWT Token</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JWT token here"
          className="font-mono text-sm h-32"
        />
        <Button onClick={handleDecode} size="lg">
          Decode JWT
        </Button>
      </div>

      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Header</h3>
            <Card className="p-4">
              <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </Card>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Payload</h3>
            <Card className="p-4">
              <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

export default function JwtDecoderPage() {
  useTrackToolUsage("JWT Decoder");

  return (
    <ToolLayout title="JWT Decoder" description="Decode and inspect JWT tokens">
      <PremiumGate>
        <JwtDecoderContent />
      </PremiumGate>
    </ToolLayout>
  );
}

