'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
      .toUpperCase()
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function ColorConverter() {
  const [hex, setHex] = useState('#FF5733');
  const [rgb, setRgb] = useState('255, 87, 51');

  const updateFromHex = (value: string) => {
    setHex(value);
    const result = hexToRgb(value);
    if (result) {
      setRgb(`${result.r}, ${result.g}, ${result.b}`);
    }
  };

  const updateFromRgb = (value: string) => {
    setRgb(value);
    const parts = value.split(',').map((p) => parseInt(p.trim()));
    if (parts.length === 3 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
      setHex(rgbToHex(parts[0], parts[1], parts[2]));
    }
  };

  const rgbParts = rgb.split(',').map((p) => parseInt(p.trim()));
  const hsl =
    rgbParts.length === 3 && rgbParts.every((p) => !isNaN(p))
      ? rgbToHsl(rgbParts[0], rgbParts[1], rgbParts[2])
      : null;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-32 h-32 rounded-lg border-4 border-border" style={{ backgroundColor: hex }} />
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              HEX
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hex}
                onChange={(e) => updateFromHex(e.target.value)}
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                onClick={() => copyToClipboard(hex)}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              RGB
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rgb}
                onChange={(e) => updateFromRgb(e.target.value)}
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                onClick={() => copyToClipboard(`rgb(${rgb})`)}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {hsl && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                HSL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${hsl.h}, ${hsl.s}%, ${hsl.l}%`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  onClick={() =>
                    copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)
                  }
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Color Picker
        </label>
        <input
          type="color"
          value={hex}
          onChange={(e) => updateFromHex(e.target.value)}
          className="w-full h-20 cursor-pointer rounded-md border-2 border-border"
        />
      </div>
    </div>
  );
}
