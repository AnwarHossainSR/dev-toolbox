'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTrackToolUsage } from '@/hooks/use-track-tool-usage'

export default function Base64EncoderPage() {
  useTrackToolUsage('Base64 Encode/Decode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        const encoded = Buffer.from(input).toString('base64')
        setOutput(encoded)
        toast.success('Encoded successfully!')
      } else {
        const decoded = Buffer.from(input, 'base64').toString('utf-8')
        setOutput(decoded)
        toast.success('Decoded successfully!')
      }
    } catch (error) {
      toast.error('Conversion failed')
    }
  }

  return (
    <ToolLayout
      title="Base64 Encode/Decode"
      description="Encode text to Base64 or decode Base64 to text"
      outputText={output}
    >
      <div className="flex gap-4 mb-6">
        <Button
          variant={mode === 'encode' ? 'default' : 'outline'}
          onClick={() => {
            setMode('encode')
            setOutput('')
          }}
        >
          Encode
        </Button>
        <Button
          variant={mode === 'decode' ? 'default' : 'outline'}
          onClick={() => {
            setMode('decode')
            setOutput('')
          }}
        >
          Decode
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            {mode === 'encode' ? 'Text Input' : 'Base64 Input'}
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode' : 'Enter Base64 to decode'}
            className="font-mono text-sm h-80"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">
            {mode === 'encode' ? 'Base64 Output' : 'Text Output'}
          </label>
          <Textarea
            value={output}
            readOnly
            placeholder="Output will appear here"
            className="font-mono text-sm h-80 bg-muted"
          />
        </div>
      </div>

      <Button onClick={handleConvert} size="lg">
        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </Button>
    </ToolLayout>
  )
}
