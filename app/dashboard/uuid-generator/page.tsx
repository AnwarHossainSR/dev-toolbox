'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Copy } from 'lucide-react'
import { useTrackToolUsage } from '@/hooks/use-track-tool-usage'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function UuidGeneratorPage() {
  useTrackToolUsage('UUID Generator')
  const [count, setCount] = useState('1')
  const [uuids, setUuids] = useState<string[]>([])

  const handleGenerate = () => {
    const num = Math.min(parseInt(count) || 1, 100)
    const newUuids = Array.from({ length: num }, () => generateUUID())
    setUuids(newUuids)
    toast.success(`Generated ${num} UUID(s)`)
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'))
    toast.success('Copied all UUIDs!')
  }

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate random UUIDs (v4)"
    >
      <div className="space-y-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Number of UUIDs</label>
            <Input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="1"
            />
          </div>
          <Button onClick={handleGenerate} size="lg">
            Generate
          </Button>
        </div>
      </div>

      {uuids.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Generated UUIDs</h3>
            <Button variant="outline" size="sm" onClick={handleCopyAll}>
              <Copy size={16} className="mr-2" />
              Copy All
            </Button>
          </div>
          <Card className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {uuids.map((uuid, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                  <code className="text-sm font-mono">{uuid}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(uuid)
                      toast.success('Copied!')
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </ToolLayout>
  )
}
