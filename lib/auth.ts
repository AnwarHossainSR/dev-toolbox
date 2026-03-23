import { createClient } from "./supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

