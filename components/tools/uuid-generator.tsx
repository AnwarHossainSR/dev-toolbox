'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([generateUUID()]);

  const generate = () => {
    setUuids([...uuids, generateUUID()]);
  };

  const generateMultiple = (count: number) => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids([...uuids, ...newUuids]);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
  };

  const copySingle = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid);
  };

  const reset = () => {
    setUuids([generateUUID()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={generate} variant="default" size="sm">
          Generate One
        </Button>
        <Button onClick={() => generateMultiple(5)} variant="outline" size="sm">
          Generate 5
        </Button>
        <Button onClick={() => generateMultiple(10)} variant="outline" size="sm">
          Generate 10
        </Button>
        <Button onClick={copyAll} variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Copy All
        </Button>
        <Button onClick={reset} variant="ghost" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        {uuids.map((uuid, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-muted border border-border rounded-md font-mono text-sm text-foreground"
          >
            <span>{uuid}</span>
            <Button
              onClick={() => copySingle(uuid)}
              variant="ghost"
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
