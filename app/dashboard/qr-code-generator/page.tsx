'use client'

import { useState } from 'react'
import { ToolLayout } from '@/components/tools/tool-layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { useTrackToolUsage } from '@/hooks/use-track-tool-usage'

export default function QrCodeGeneratorPage() {
  useTrackToolUsage('QR Code Generator')
  const [input, setInput] = useState('')
  const [qrCode, setQrCode] = useState('')

  const handleGenerate = async () => {
    if (!input) {
      toast.error('Please enter text or URL')
      return
    }

    try {
      const encodedInput = encodeURIComponent(input)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedInput}`
      setQrCode(qrUrl)
      toast.success('QR code generated!')
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCode)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qrcode.png'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('QR code downloaded!')
    } catch (error) {
      toast.error('Failed to download QR code')
    }
  }

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes from text or URLs"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium">Text or URL</label>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Enter text or URL"
          />
          <Button onClick={handleGenerate} size="lg">
            Generate QR Code
          </Button>
        </div>

        {qrCode && (
          <div className="flex flex-col items-center justify-center">
            <Card className="p-4 bg-white">
              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
            </Card>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={handleDownload}
            >
              <Download size={16} />
              Download QR Code
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
