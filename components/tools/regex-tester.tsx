'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [flags, setFlags] = useState('g');
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');

  const test = () => {
    try {
      setError('');
      const regex = new RegExp(pattern, flags);
      const result = text.match(regex) || [];
      setMatches(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex');
      setMatches([]);
    }
  };

  const copyMatches = async () => {
    await navigator.clipboard.writeText(matches.join('\n'));
  };

  const reset = () => {
    setPattern('');
    setText('');
    setFlags('g');
    setMatches([]);
    setError('');
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Pattern
          </label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="/pattern/flags"
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Flags
          </label>
          <div className="flex gap-2">
            {['g', 'i', 'm', 's'].map((flag) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  flags.includes(flag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted border border-border text-foreground hover:bg-accent'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to test against regex..."
          className="w-full h-40 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={test} variant="default" size="sm">
          Test
        </Button>
        <Button onClick={copyMatches} variant="outline" size="sm" disabled={matches.length === 0}>
          <Copy className="h-4 w-4 mr-2" />
          Copy ({matches.length})
        </Button>
        <Button onClick={reset} variant="ghost" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">
          Matches ({matches.length})
        </p>
        <div className="bg-muted border border-border rounded-md p-3 min-h-24 max-h-64 overflow-y-auto">
          {matches.length > 0 ? (
            <ul className="space-y-1 font-mono text-sm text-foreground">
              {matches.map((match, index) => (
                <li key={index} className="break-all">
                  {index + 1}. {match}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm italic">No matches found</p>
          )}
        </div>
      </div>
    </div>
  );
}
