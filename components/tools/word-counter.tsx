'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    lines: 0,
    paragraphs: 0,
    sentences: 0,
  });

  useEffect(() => {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const paragraphs = text.trim() === '' ? 0 : text.trim().split(/\n\n+/).length;
    const sentences = text.match(/[.!?]+/g)?.length || 0;

    setStats({
      words,
      characters,
      charactersNoSpaces,
      lines,
      paragraphs,
      sentences,
    });
  }, [text]);

  const reset = () => {
    setText('');
  };

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div className="p-4 bg-muted border border-border rounded-md">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value.toLocaleString()}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="w-full h-64 p-3 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Words" value={stats.words} />
        <StatCard label="Characters" value={stats.characters} />
        <StatCard label="Characters (No Spaces)" value={stats.charactersNoSpaces} />
        <StatCard label="Lines" value={stats.lines} />
        <StatCard label="Paragraphs" value={stats.paragraphs} />
        <StatCard label="Sentences" value={stats.sentences} />
      </div>

      <Button onClick={reset} variant="ghost" size="sm">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
