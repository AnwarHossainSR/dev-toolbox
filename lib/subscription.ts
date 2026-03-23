"use server";

import { createClient } from "@/lib/supabase/server";

export type Plan = "free" | "pro";

export async function getUserPlan(): Promise<Plan> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "free";

    const { data } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    return data?.plan === "pro" ? "pro" : "free";
  } catch {
    return "free";
  }
}
