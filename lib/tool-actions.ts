"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackToolUsage(
  toolName: string,
  input?: string,
  output?: string,
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("tool_usage_history").insert({
      user_id: user.id,
      tool_name: toolName,
      input,
      output,
      used_at: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Failed to track tool usage:", error);
  }
}

export async function addFavorite(toolName: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      tool_name: toolName,
    });

    if (error && error.code !== "23505") throw error; // 23505 = unique violation, ignore
  } catch (error) {
    console.error("Failed to add favorite:", error);
  }
}

export async function removeFavorite(toolName: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("tool_name", toolName);

    if (error) throw error;
  } catch (error) {
    console.error("Failed to remove favorite:", error);
  }
}

export async function getFavorites(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("favorites")
      .select("tool_name")
      .eq("user_id", user.id);

    if (error) throw error;

    return (data || []).map(({ tool_name }) => tool_name);
  } catch (error) {
    console.error("Failed to get favorites:", error);
    return [];
  }
}

export async function getRecentlyUsedTools(
  limit: number = 5,
): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("tool_usage_history")
      .select("tool_name")
      .eq("user_id", user.id)
      .order("used_at", { ascending: false })
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
  } catch (error) {
    console.error("Failed to get recently used tools:", error);
    return [];
  }
}

