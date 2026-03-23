import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { toolName } = await request.json()

    const { error } = await supabase.from('tool_usage_history').insert([
      {
        tool_name: toolName,
        user_id: user.id,
        used_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error('Failed to insert usage:', error)
      return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
