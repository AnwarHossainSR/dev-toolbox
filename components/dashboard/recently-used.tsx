'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'

const TOOL_ICONS: Record<string, string> = {
  'json-to-yaml': '🔄',
  'base64-encoder': '🔐',
  'url-encoder': '🔗',
  'case-converter': '📝',
  'text-diff': '🔍',
  'regex-tester': '⚡',
  'jwt-decoder': '🔑',
  'color-converter': '🎨',
  'uuid-generator': '✨',
  'markdown-preview': '📄',
  'hash-generator': '🔐',
  'qr-code-generator': '📲',
}

const TOOL_NAMES: Record<string, string> = {
  'json-to-yaml': 'JSON to YAML',
  'base64-encoder': 'Base64 Encode/Decode',
  'url-encoder': 'URL Encode/Decode',
  'case-converter': 'Case Converter',
  'text-diff': 'Text Diff',
  'regex-tester': 'Regex Tester',
  'jwt-decoder': 'JWT Decoder',
  'color-converter': 'Color Converter',
  'uuid-generator': 'UUID Generator',
  'markdown-preview': 'Markdown Preview',
  'hash-generator': 'Hash Generator',
  'qr-code-generator': 'QR Code Generator',
}

export function RecentlyUsed({ tools }: { tools: string[] }) {
  const uniqueTools = Array.from(new Set(tools)).slice(0, 6)

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Recently Used</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {uniqueTools.map((toolSlug) => (
          <Link key={toolSlug} href={`/dashboard/${toolSlug}`}>
            <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow text-center">
              <div className="text-2xl mb-2">{TOOL_ICONS[toolSlug] || '🔧'}</div>
              <p className="text-xs font-medium text-foreground line-clamp-2">
                {TOOL_NAMES[toolSlug] || toolSlug}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
