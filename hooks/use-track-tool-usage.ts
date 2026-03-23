'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTrackToolUsage(toolName: string) {
  useEffect(() => {
    const trackUsage = async () => {
      try {
        const supabase = createClient()
        
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          await supabase.from('tool_usage_history').insert([
            {
              tool_name: toolName,
              used_at: new Date().toISOString(),
            },
          ])
        }
      } catch (error) {
        // Silently fail if tracking doesn't work
        console.error('Failed to track tool usage:', error)
      }
    }

    trackUsage()
  }, [toolName])
}
