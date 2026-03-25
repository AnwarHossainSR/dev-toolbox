import { createClient } from "@/lib/supabase/server";
import { Bell, Lock, Settings, User } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "";
  const fullName = user?.user_metadata?.full_name ?? "";
  const provider = user?.app_metadata?.provider ?? "email";

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-amber-400" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Full name
              </label>
              <input
                type="text"
                defaultValue={fullName}
                placeholder="Your name"
                disabled
                className="w-full rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email address
              </label>
              <input
                type="email"
                defaultValue={email}
                disabled
                className="w-full rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Signed in via{" "}
                <span className="capitalize font-medium">{provider}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">Security</h2>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">
                {provider === "email"
                  ? "Change your account password"
                  : "Managed by your OAuth provider"}
              </p>
            </div>
            {provider === "email" && (
              <button className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors">
                Change
              </button>
            )}
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">
              Notifications
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Product updates", sub: "New tools and features" },
              {
                label: "Usage reports",
                sub: "Weekly summary of your activity",
              },
            ].map(({ label, sub }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-amber-400/30 relative cursor-not-allowed">
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-muted-foreground/40 transition-transform" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Notification preferences coming soon.
          </p>
        </section>

        {/* Danger zone */}
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <h2 className="text-sm font-semibold text-red-500 dark:text-red-400 mb-4">
            Danger Zone
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Delete account
              </p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              disabled
              className="text-xs font-medium text-red-500 border border-red-500/40 rounded-lg px-3 py-1.5 hover:bg-red-500/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
