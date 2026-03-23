'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useToolFavorite(toolName: string) {
  const supabase = createClient()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkFavorite()
  }, [toolName])

  const checkFavorite = async () => {
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('tool_name', toolName)
        .single()

      setIsFavorite(!!data)
    } catch (error) {
      setIsFavorite(false)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('tool_name', toolName)

      setIsFavorite(false)
    } else {
      await supabase
        .from('favorites')
        .insert([{ tool_name: toolName }])

      setIsFavorite(true)
    }
  }

  return { isFavorite, toggleFavorite, loading }
}
