'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'

const TOOLS = [
  { name: 'JSON to YAML', icon: '🔄', slug: 'json-to-yaml', category: 'Converters' },
  { name: 'Base64 Encode/Decode', icon: '🔐', slug: 'base64-encoder', category: 'Converters' },
  { name: 'URL Encode/Decode', icon: '🔗', slug: 'url-encoder', category: 'Converters' },
  { name: 'Case Converter', icon: '📝', slug: 'case-converter', category: 'Text Tools' },
  { name: 'Text Diff', icon: '🔍', slug: 'text-diff', category: 'Text Tools' },
  { name: 'Regex Tester', icon: '⚡', slug: 'regex-tester', category: 'Text Tools' },
  { name: 'JWT Decoder', icon: '🔑', slug: 'jwt-decoder', category: 'Developer' },
  { name: 'Color Converter', icon: '🎨', slug: 'color-converter', category: 'Developer' },
  { name: 'UUID Generator', icon: '✨', slug: 'uuid-generator', category: 'Developer' },
  { name: 'Markdown Preview', icon: '📄', slug: 'markdown-preview', category: 'Developer' },
  { name: 'Hash Generator', icon: '🔐', slug: 'hash-generator', category: 'Utilities' },
  { name: 'QR Code Generator', icon: '📲', slug: 'qr-code-generator', category: 'Utilities' },
]

export function ToolGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {TOOLS.map((tool) => (
        <Link key={tool.slug} href={`/dashboard/${tool.slug}`}>
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{tool.icon}</div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                {tool.category}
              </span>
            </div>
            <h3 className="font-semibold text-foreground">{tool.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">Quick access tool</p>
          </Card>
        </Link>
      ))}
    </div>
  )
}
