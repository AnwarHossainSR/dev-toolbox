'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTrackToolUsage } from '@/hooks/use-track-tool-usage'

export default function UrlEncoderPage() {
  useTrackToolUsage('URL Encode/Decode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        const encoded = encodeURIComponent(input)
        setOutput(encoded)
        toast.success('Encoded successfully!')
      } else {
        const decoded = decodeURIComponent(input)
        setOutput(decoded)
        toast.success('Decoded successfully!')
      }
    } catch (error) {
      toast.error('Conversion failed')
    }
  }

  return (
    <ToolLayout
      title="URL Encode/Decode"
      description="Encode text for URLs or decode URL-encoded text"
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
            {mode === 'encode' ? 'Text Input' : 'URL-Encoded Input'}
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode' : 'Enter URL-encoded text to decode'}
            className="font-mono text-sm h-80"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">
            {mode === 'encode' ? 'URL-Encoded Output' : 'Text Output'}
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
        {mode === 'encode' ? 'Encode for URL' : 'Decode from URL'}
      </Button>
    </ToolLayout>
  )
}
