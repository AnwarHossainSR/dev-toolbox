'use client'

import { ReactNode } from 'react'
import { Heart, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToolFavorite } from '@/hooks/use-tool-favorite'
import { toast } from 'sonner'

interface ToolLayoutProps {
  title: string
  description: string
  children: ReactNode
  outputText?: string
}

export function ToolLayout({
  title,
  description,
  children,
  outputText,
}: ToolLayoutProps) {
  const { isFavorite, toggleFavorite } = useToolFavorite(title)

  const handleCopyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
      toast.success('Copied to clipboard!')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFavorite}
          className={isFavorite ? 'text-red-500' : ''}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </Button>
      </div>

      {children}

      {outputText && (
        <div className="flex gap-2">
          <Button
            onClick={handleCopyOutput}
            className="gap-2"
          >
            <Copy size={18} />
            Copy Output
          </Button>
        </div>
      )}
    </div>
  )
}
