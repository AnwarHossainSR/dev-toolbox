"use client";

import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const NOTIFICATIONS = [
  { id: "updates", label: "Product updates", sub: "New tools and features" },
  {
    id: "reports",
    label: "Usage reports",
    sub: "Weekly summary of your activity",
  },
];

export function NotificationToggles() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    updates: false,
    reports: false,
  });

  return (
    <div className="space-y-3">
      {NOTIFICATIONS.map(({ id, label, sub }) => (
        <div
          key={id}
          className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
          <Switch
            checked={enabled[id]}
            onCheckedChange={(v) =>
              setEnabled((prev) => ({ ...prev, [id]: v }))
            }
            aria-label={label}
          />
        </div>
      ))}
      <p className="text-xs text-muted-foreground pt-1">
        Notification preferences coming soon.
      </p>
    </div>
  );
}
