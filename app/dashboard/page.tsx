import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getUserPlan } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/server";
import { TOOLS } from "@/lib/tools";

export default async function DashboardPage() {
  const plan = await getUserPlan();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User";

  return <DashboardContent plan={plan} userName={userName} tools={TOOLS} />;
}

