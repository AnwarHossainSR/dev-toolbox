'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const TOOLS = [
  { name: 'JSON to YAML', slug: 'json-to-yaml', icon: '🔄' },
  { name: 'Base64 Encode/Decode', slug: 'base64-encoder', icon: '🔐' },
  { name: 'URL Encode/Decode', slug: 'url-encoder', icon: '🔗' },
  { name: 'Case Converter', slug: 'case-converter', icon: '📝' },
  { name: 'Text Diff', slug: 'text-diff', icon: '🔍' },
  { name: 'Regex Tester', slug: 'regex-tester', icon: '⚡' },
  { name: 'JWT Decoder', slug: 'jwt-decoder', icon: '🔑' },
  { name: 'Color Converter', slug: 'color-converter', icon: '🎨' },
  { name: 'UUID Generator', slug: 'uuid-generator', icon: '✨' },
  { name: 'Markdown Preview', slug: 'markdown-preview', icon: '📄' },
  { name: 'Hash Generator', slug: 'hash-generator', icon: '🔐' },
  { name: 'QR Code Generator', slug: 'qr-code-generator', icon: '📲' },
]

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open = false, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(open)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const filtered = TOOLS.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (slug: string) => {
    router.push(`/dashboard/${slug}`)
    setIsOpen(false)
    setSearch('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="w-full max-w-xl bg-zinc-950 rounded-lg border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <Search size={18} className="text-zinc-500" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-0 bg-transparent text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((tool) => (
              <button
                key={tool.slug}
                onClick={() => handleSelect(tool.slug)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 border-b border-zinc-800 last:border-0 transition-colors text-left"
              >
                <span className="text-lg">{tool.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{tool.name}</div>
                </div>
                <kbd className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
                  enter
                </kbd>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">
              No tools found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
