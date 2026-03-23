'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RotateCcw } from 'lucide-react';

export function UnixTimestamp() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000).toString());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0]);

  useEffect(() => {
    const ts = parseInt(timestamp);
    if (!isNaN(ts)) {
      const d = new Date(ts * 1000);
      setDate(d.toISOString().split('T')[0]);
      setTime(d.toTimeString().split(' ')[0]);
    }
  }, [timestamp]);

  const updateFromDate = (newDate: string, newTime: string) => {
    setDate(newDate);
    setTime(newTime);
    const d = new Date(`${newDate}T${newTime}`);
    setTimestamp(Math.floor(d.getTime() / 1000).toString());
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const reset = () => {
    const now = new Date();
    setTimestamp(Math.floor(now.getTime() / 1000).toString());
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0]);
  };

  const currentTimestamp = () => {
    reset();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Unix Timestamp */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Unix Timestamp
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              onClick={() => copyToClipboard(timestamp)}
              variant="outline"
              size="sm"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Timestamp */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            &nbsp;
          </label>
          <Button onClick={currentTimestamp} variant="outline" size="sm" className="w-full">
            Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => updateFromDate(e.target.value, time)}
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Time (UTC)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => updateFromDate(date, e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="p-4 bg-muted border border-border rounded-md">
        <p className="text-xs text-muted-foreground mb-1">Full Date & Time (ISO 8601)</p>
        <div className="flex gap-2">
          <p className="flex-1 text-sm font-mono text-foreground break-all">
            {new Date(parseInt(timestamp) * 1000).toISOString()}
          </p>
          <Button
            onClick={() =>
              copyToClipboard(new Date(parseInt(timestamp) * 1000).toISOString())
            }
            variant="ghost"
            size="sm"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button onClick={reset} variant="ghost" size="sm">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>
    </div>
  );
}
