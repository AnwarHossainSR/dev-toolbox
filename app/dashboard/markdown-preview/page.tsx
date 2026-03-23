"use client";

import { Card, PremiumGate, Textarea, ToolLayout } from "@/components";
import { useTrackToolUsage } from "@/hooks/use-track-tool-usage";
import { useState } from "react";

function markdownToHtml(markdown: string): string {
  let html = markdown
    .replace(
      /^### (.*?)$/gm,
      '<h3 style="font-size: 1.25rem; font-weight: 600; margin-top: 1rem;">$1</h3>',
    )
    .replace(
      /^## (.*?)$/gm,
      '<h2 style="font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem;">$1</h2>',
    )
    .replace(
      /^# (.*?)$/gm,
      '<h1 style="font-size: 2rem; font-weight: 700; margin-top: 2rem;">$1</h1>',
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
    .replace(
      /\`(.*?)\`/g,
      '<code style="background-color: rgba(0,0,0,0.1); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace;">$1</code>',
    )
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>',
    )
    .replace(/^\- (.*?)$/gm, '<li style="margin-left: 1.5rem;">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin: 1rem 0;">');

  return `<p style="margin: 1rem 0;">${html}</p>`;
}

function MarkdownPreviewContent() {
  const [markdown, setMarkdown] = useState(
    "# Hello World\n\nThis is **bold** and this is *italic*.",
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium">Markdown Input</label>
        <Textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Enter markdown here..."
          className="font-mono text-sm h-80"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">Preview</label>
        <Card className="p-4 h-80 overflow-y-auto">
          <div
            dangerouslySetInnerHTML={{
              __html: markdownToHtml(markdown),
            }}
            className="prose prose-sm max-w-none"
          />
        </Card>
      </div>
    </div>
  );
}

export default function MarkdownPreviewPage() {
  useTrackToolUsage("Markdown Preview");

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Live preview of your markdown"
    >
      <PremiumGate>
        <MarkdownPreviewContent />
      </PremiumGate>
    </ToolLayout>
  );
}

