'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw, ArrowRightLeft } from 'lucide-react';

export function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const encode = () => {
    setOutput(encodeURIComponent(input));
  };

  const decode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch {
      setOutput('Decoding failed');
    }
  };

  const swap = () => {
    setInput(output);
    setOutput(input);
  };

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  };

  const reset = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste URL or text to encode/decode..."
            className="w-full h-64 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Output
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Encoded/decoded result will appear here..."
            className="w-full h-64 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={encode} variant="default" size="sm">
          Encode
        </Button>
        <Button onClick={decode} variant="outline" size="sm">
          Decode
        </Button>
        <Button onClick={swap} variant="outline" size="sm">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Swap
        </Button>
        <Button onClick={copyToClipboard} variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button onClick={reset} variant="ghost" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
