'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(
    `# Hello World\n\nThis is **bold** and this is *italic*.\n\n- List item 1\n- List item 2\n- List item 3`
  );

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(markdown);
  };

  const reset = () => {
    setMarkdown('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Markdown
          </label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Write Markdown here..."
            className="w-full h-96 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preview
          </label>
          <div className="w-full h-96 p-3 bg-muted border border-border rounded-md text-sm text-foreground overflow-y-auto prose prose-invert dark:prose">
            {markdown.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={i} className="text-3xl font-bold mb-4">
                    {line.slice(2)}
                  </h1>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-2xl font-bold mb-3">
                    {line.slice(3)}
                  </h2>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={i} className="ml-4 list-disc">
                    {line.slice(2)}
                  </li>
                );
              }
              if (line.trim() === '') {
                return <div key={i} className="mb-4" />;
              }
              return (
                <p key={i} className="mb-2">
                  {line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
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
