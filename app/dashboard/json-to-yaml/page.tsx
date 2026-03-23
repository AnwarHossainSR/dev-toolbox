'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTrackToolUsage } from '@/hooks/use-track-tool-usage'

function jsonToYaml(json: string): string {
  try {
    const obj = JSON.parse(json)
    return convertToYaml(obj)
  } catch {
    throw new Error('Invalid JSON')
  }
}

function convertToYaml(obj: any, indent = 0): string {
  const spaces = ' '.repeat(indent)
  let yaml = ''

  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        yaml += `${spaces}- ${convertToYaml(item, indent + 2).trim()}\n`
      } else {
        yaml += `${spaces}- ${item}\n`
      }
    })
  } else if (typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n${convertToYaml(value, indent + 2)}`
      } else {
        yaml += `${spaces}${key}: ${value}\n`
      }
    })
  }

  return yaml
}

export default function JsonToYamlPage() {
  useTrackToolUsage('JSON to YAML')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleConvert = () => {
    try {
      const result = jsonToYaml(input)
      setOutput(result)
      toast.success('Converted successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Conversion failed')
    }
  }

  return (
    <ToolLayout
      title="JSON to YAML"
      description="Convert JSON to YAML format with one click"
      outputText={output}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium">JSON Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"key": "value"}'
            className="font-mono text-sm h-80"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">YAML Output</label>
          <Textarea
            value={output}
            readOnly
            placeholder="YAML output will appear here"
            className="font-mono text-sm h-80 bg-muted"
          />
        </div>
      </div>

      <Button onClick={handleConvert} size="lg">
        Convert JSON to YAML
      </Button>
    </ToolLayout>
  )
}
