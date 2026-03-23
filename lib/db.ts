import { createClient } from '@/lib/supabase/server';

export async function trackToolUsage(
  toolName: string,
  input?: string,
  output?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase.from('tool_usage_history').insert({
    user_id: user.id,
    tool_name: toolName,
    input,
    output,
    used_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getRecentlyUsedTools(limit: number = 5) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('tool_usage_history')
    .select('tool_name')
    .eq('user_id', user.id)
    .order('used_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Get unique tool names
  const seen = new Set<string>();
  return (data || [])
    .filter(({ tool_name }) => {
      if (seen.has(tool_name)) return false;
      seen.add(tool_name);
      return true;
    })
    .map(({ tool_name }) => tool_name);
}

export async function toggleFavorite(toolName: string, isFavorite: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  if (isFavorite) {
    const { error } = await supabase.from('favorites').insert({
      user_id: user.id,
      tool_name: toolName,
    });
    if (error && error.code !== '23505') throw error; // 23505 = unique violation, ignore
  } else {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_name', toolName);
    if (error) throw error;
  }
}

export async function getFavorites() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select('tool_name')
    .eq('user_id', user.id);

  if (error) throw error;

  return (data || []).map(({ tool_name }) => tool_name);
}
