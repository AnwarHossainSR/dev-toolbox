"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";

export function FullscreenToolWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-background overflow-y-auto"
          : "relative"
      }
    >
      <button
        onClick={() => setFullscreen((v) => !v)}
        title={fullscreen ? "Exit fullscreen" : "Fullscreen view"}
        className="absolute right-0 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
      >
        {fullscreen ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        )}
      </button>
      <div className={fullscreen ? "p-6" : ""}>{children}</div>
    </div>
  );
}
