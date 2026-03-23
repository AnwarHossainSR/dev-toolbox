"use client";

import { PremiumGate } from "@/components";
import { ToolLayout } from "@/components";
import { Button } from "@/components";
import { Card } from "@/components";
import { Textarea } from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

async function generateHash(text: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

function HashGeneratorContent() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const algorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
      const newHashes: Record<string, string> = {};
      for (const algo of algorithms) {
        newHashes[algo] = await generateHash(input, algo);
      }
      setHashes(newHashes);
      toast.success("Hashes generated!");
    } catch {
      toast.error("Failed to generate hashes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium">Input Text</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash"
          className="font-mono text-sm h-32"
        />
        <Button onClick={handleGenerate} size="lg" disabled={loading}>
          {loading ? "Generating..." : "Generate Hashes"}
        </Button>
      </div>

      {Object.keys(hashes).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(hashes).map(([algo, hash]) => (
            <Card key={algo} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{algo}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(hash);
                    toast.success("Copied!");
                  }}
                >
                  <Copy size={14} />
                </Button>
              </div>
              <code className="text-xs font-mono break-all text-muted-foreground">
                {hash}
              </code>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function HashGeneratorPage() {
  useTrackToolUsage("Hash Generator");

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate SHA hashes for your text"
    >
      <PremiumGate>
        <HashGeneratorContent />
      </PremiumGate>
    </ToolLayout>
  );
}

