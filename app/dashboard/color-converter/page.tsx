'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTrackToolUsage } from '@/hooks/use-track-tool-usage'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
      .toUpperCase()
  )
}

export default function ColorConverterPage() {
  useTrackToolUsage('Color Converter')
  const [hex, setHex] = useState('#FF0000')
  const [r, setR] = useState('255')
  const [g, setG] = useState('0')
  const [b, setB] = useState('0')

  const handleHexChange = (value: string) => {
    setHex(value)
    const rgb = hexToRgb(value)
    if (rgb) {
      setR(rgb.r.toString())
      setG(rgb.g.toString())
      setB(rgb.b.toString())
    }
  }

  const handleRgbChange = () => {
    const newHex = rgbToHex(parseInt(r) || 0, parseInt(g) || 0, parseInt(b) || 0)
    setHex(newHex)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between HEX and RGB color formats"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">HEX Color</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#FF0000"
              />
              <div
                className="w-16 rounded-md border border-border"
                style={{ backgroundColor: hex }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => copyToClipboard(hex)}
            >
              Copy HEX
            </Button>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">RGB Values</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Red</label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={r}
                  onChange={(e) => setR(e.target.value)}
                  onBlur={handleRgbChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Green</label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={g}
                  onChange={(e) => setG(e.target.value)}
                  onBlur={handleRgbChange}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Blue</label>
                <Input
                  type="number"
                  min="0"
                  max="255"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  onBlur={handleRgbChange}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => copyToClipboard(`rgb(${r}, ${g}, ${b})`)}
            >
              Copy RGB
            </Button>
          </Card>
        </div>

        <div className="flex items-center justify-center">
          <div
            className="w-full aspect-square rounded-lg shadow-lg border-8 border-border"
            style={{ backgroundColor: hex }}
          />
        </div>
      </div>
    </ToolLayout>
  )
}
