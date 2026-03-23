'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTrackToolUsage } from '@/hooks/use-track-tool-usage'

const CASES = {
  uppercase: (s: string) => s.toUpperCase(),
  lowercase: (s: string) => s.toLowerCase(),
  capitalize: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  title: (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
  'camelCase': (s: string) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, ''),
  'snake_case': (s: string) => s.toLowerCase().replace(/\s+/g, '_'),
  'kebab-case': (s: string) => s.toLowerCase().replace(/\s+/g, '-'),
}

export default function CaseConverterPage() {
  useTrackToolUsage('Case Converter')
  const [input, setInput] = useState('')
  const [outputs, setOutputs] = useState<Record<string, string>>({})

  const handleConvert = () => {
    const newOutputs: Record<string, string> = {}
    Object.entries(CASES).forEach(([caseType, converter]) => {
      newOutputs[caseType] = converter(input)
    })
    setOutputs(newOutputs)
    toast.success('Converted successfully!')
  }

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text to different case formats"
    >
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium">Input Text</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here"
          className="font-mono text-sm h-32"
        />
        <Button onClick={handleConvert} size="lg">
          Convert
        </Button>
      </div>

      {Object.keys(outputs).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(outputs).map(([caseType, text]) => (
            <div key={caseType} className="space-y-2">
              <label className="block text-sm font-medium capitalize">
                {caseType === 'camelCase' ? 'camelCase' : caseType === 'snake_case' ? 'snake_case' : caseType === 'kebab-case' ? 'kebab-case' : caseType}
              </label>
              <div className="p-3 rounded-md bg-muted font-mono text-sm break-all">
                {text}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(text)
                  toast.success('Copied!')
                }}
              >
                Copy
              </Button>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  )
}
