'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';

export function JwtDecoder() {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');

  const decode = () => {
    try {
      setError('');
      const parts = input.trim().split('.');

      if (parts.length !== 3) {
        setError('Invalid JWT format. Expected 3 parts separated by dots.');
        setHeader('');
        setPayload('');
        return;
      }

      const headerDecoded = JSON.parse(atob(parts[0]));
      const payloadDecoded = JSON.parse(atob(parts[1]));

      setHeader(JSON.stringify(headerDecoded, null, 2));
      setPayload(JSON.stringify(payloadDecoded, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decode JWT');
      setHeader('');
      setPayload('');
    }
  };

  const copyHeader = async () => {
    await navigator.clipboard.writeText(header);
  };

  const copyPayload = async () => {
    await navigator.clipboard.writeText(payload);
  };

  const reset = () => {
    setInput('');
    setHeader('');
    setPayload('');
    setError('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          JWT Token
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="w-full h-32 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={decode} variant="default" size="sm">
          Decode
        </Button>
        <Button onClick={reset} variant="ghost" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              Header
            </label>
            <Button onClick={copyHeader} variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <textarea
            value={header}
            readOnly
            placeholder="Header will appear here..."
            className="w-full h-64 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Payload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground">
              Payload
            </label>
            <Button onClick={copyPayload} variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <textarea
            value={payload}
            readOnly
            placeholder="Payload will appear here..."
            className="w-full h-64 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>
      </div>
    </div>
  );
}
