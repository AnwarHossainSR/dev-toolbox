'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';

export function CaseConverter() {
  const [input, setInput] = useState('');

  const conversions = [
    {
      label: 'UPPERCASE',
      value: input.toUpperCase(),
    },
    {
      label: 'lowercase',
      value: input.toLowerCase(),
    },
    {
      label: 'Title Case',
      value: input
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '),
    },
    {
      label: 'camelCase',
      value: input
        .split(' ')
        .map((word, index) =>
          index === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(''),
    },
    {
      label: 'snake_case',
      value: input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_'),
    },
    {
      label: 'kebab-case',
      value: input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-'),
    },
  ];

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const reset = () => {
    setInput('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full h-32 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {conversions.map((conversion, index) => (
          <div key={index} className="p-4 bg-muted border border-border rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {conversion.label}
              </span>
              <Button
                onClick={() => copyToClipboard(conversion.value)}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm font-mono text-foreground break-all">
              {conversion.value || '(empty)'}
            </p>
          </div>
        ))}
      </div>

      <Button onClick={reset} variant="ghost" size="sm">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
