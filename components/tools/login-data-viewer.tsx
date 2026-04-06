"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type LoginEntry = {
  url: string;
  username: string;
  password: string;
  last_updated: string;
  source: string;
};

type ViewResult = {
  entries: LoginEntry[];
  stats: {
    total: number;
    chrome: number;
    edge: number;
  };
  sources: {
    chrome: boolean;
    edge: boolean;
  };
};

type MergeResult = {
  entries: LoginEntry[];
  stats: {
    total: number;
    chrome: number;
    edge: number;
    conflicts: number;
    latest_chrome: number;
    latest_edge: number;
  };
  conflicts: Array<{
    url: string;
    username: string;
    chrome_password: string;
    chrome_updated: string;
    edge_password: string;
    edge_updated: string;
    winner: "chrome" | "edge";
  }>;
  filtered?: boolean;
};

function formatDate(isoString: string): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return "—";
  }
}

function toCsv(entries: LoginEntry[]) {
  const header = "url,username,password,last_updated,source";
  const rows = entries.map((e) =>
    [e.url, e.username, e.password, e.last_updated, e.source]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
}

function dl(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function LoginDataViewer() {
  const [mode, setMode] = useState<"view" | "merge">("view");
  const [viewResult, setViewResult] = useState<ViewResult | null>(null);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [filterUrl, setFilterUrl] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [showConflicts, setShowConflicts] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: mode,
        url: filterUrl,
        username: filterUsername,
      });

      const res = await fetch(`/api/tools/login-data-viewer?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load data");
      }

      if (mode === "merge") {
        setMergeResult(data);
        setViewResult(null);
        toast.success(`✓ Merged ${data.stats.total} passwords`);
      } else {
        setViewResult(data);
        setMergeResult(null);
        toast.success(`✓ Loaded ${data.stats.total} passwords`);
      }
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(error.message || "Failed to load data");
      
      // Show setup instructions if no files found
      if (error.message.includes("No Login Data files")) {
        toast.info("Copy Login Data files to data/ directory", { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [mode]);

  const entries = mergeResult?.entries || viewResult?.entries || [];
  const stats = mergeResult?.stats || viewResult?.stats;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/5 px-4 py-3">
        <svg width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div className="text-xs text-blue-700 dark:text-blue-400">
          <p className="font-semibold mb-1">📁 Setup Instructions</p>
          <ol className="space-y-0.5 text-[11px] list-decimal list-inside">
            <li>Close Chrome and Edge browsers</li>
            <li>Copy Login Data files to <code className="px-1 py-0.5 rounded bg-muted">data/chrome-login-data/</code> and <code className="px-1 py-0.5 rounded bg-muted">data/edge-login-data/</code></li>
            <li>Click "Load Data" to view or merge passwords</li>
          </ol>
          <details className="mt-2">
            <summary className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 font-medium">
              Show file paths →
            </summary>
            <div className="mt-2 space-y-2 pl-2">
              <div>
                <p className="font-semibold">Chrome (Windows):</p>
                <code className="block bg-muted px-2 py-1 rounded text-[9px] break-all mt-0.5">
                  %LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data
                </code>
              </div>
              <div>
                <p className="font-semibold">Edge (Windows):</p>
                <code className="block bg-muted px-2 py-1 rounded text-[9px] break-all mt-0.5">
                  %LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data
                </code>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3">
        <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div className="text-xs text-amber-600 dark:text-amber-400">
          <p className="font-semibold mb-1">🔒 Privacy & Security</p>
          <ul className="space-y-0.5 text-[11px]">
            <li>• Reads from <strong>copied files only</strong> — original browser files untouched</li>
            <li>• Passwords decrypted in memory using DPAPI (Windows)</li>
            <li>• No plaintext passwords stored on disk</li>
            <li>• Copied files are gitignored automatically</li>
          </ul>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center gap-2">
        <Button
          variant={mode === "view" ? "default" : "outline"}
          onClick={() => setMode("view")}
          className={mode === "view" ? "bg-blue-500 hover:bg-blue-600" : ""}
        >
          👁️ View All
        </Button>
        <Button
          variant={mode === "merge" ? "default" : "outline"}
          onClick={() => setMode("merge")}
          className={mode === "merge" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          🔀 Merge & Resolve
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by URL</label>
          <input
            type="text"
            value={filterUrl}
            onChange={(e) => setFilterUrl(e.target.value)}
            placeholder="e.g., google.com"
            className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Filter by Username</label>
          <input
            type="text"
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
            placeholder="e.g., user@example.com"
            className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Load Button */}
      <Button
        onClick={loadData}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Loading...
          </span>
        ) : mode === "merge" ? "🔀 Load & Merge" : "📂 Load Data"}
      </Button>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total Passwords</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.chrome}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Chrome</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-purple-500">{stats.edge}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Edge</p>
          </div>
          {mergeResult && (
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{mergeResult.stats.conflicts}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Conflicts</p>
            </div>
          )}
        </div>
      )}

      {/* Conflicts Summary */}
      {mergeResult && mergeResult.conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">⚠️ Conflicts Resolved</h3>
            <button
              onClick={() => setShowConflicts(!showConflicts)}
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
            >
              {showConflicts ? "Hide" : "Show"} details
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {mergeResult.stats.conflicts} passwords had different values. Kept the latest based on timestamps:
          </p>
          <div className="flex gap-4 text-xs">
            <span className="text-blue-600 dark:text-blue-400">
              Chrome won: {mergeResult.stats.latest_chrome}
            </span>
            <span className="text-purple-600 dark:text-purple-400">
              Edge won: {mergeResult.stats.latest_edge}
            </span>
          </div>

          {showConflicts && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {mergeResult.conflicts.map((c, i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-2 text-xs">
                  <p className="font-semibold text-foreground truncate">{c.url}</p>
                  <p className="text-muted-foreground truncate">{c.username}</p>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[10px]">
                    <div className={c.winner === "chrome" ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground line-through"}>
                      Chrome: {formatDate(c.chrome_updated)}
                    </div>
                    <div className={c.winner === "edge" ? "text-green-600 dark:text-green-400 font-semibold" : "text-muted-foreground line-through"}>
                      Edge: {formatDate(c.edge_updated)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {entries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPasswords((v) => !v)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPasswords ? "🙈 Hide" : "👁️ Show"} Passwords
          </button>
          <Button
            variant="outline"
            className="h-9 text-xs"
            onClick={() => dl(toCsv(entries), "passwords.csv", "text/csv")}
          >
            ↓ Download CSV
          </Button>
          <Button
            variant="outline"
            className="h-9 text-xs"
            onClick={() => dl(JSON.stringify(entries, null, 2), "passwords.json", "application/json")}
          >
            ↓ Download JSON
          </Button>
        </div>
      )}

      {/* Table */}
      {entries.length > 0 && (
        <div className="overflow-auto rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {["URL", "Username", "Password", "Last Updated", "Source"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 max-w-[200px] truncate text-foreground">{e.url}</td>
                  <td className="px-3 py-2 max-w-[150px] truncate text-foreground">{e.username}</td>
                  <td className="px-3 py-2 font-mono text-muted-foreground max-w-[150px] truncate">
                    {showPasswords ? e.password : "•".repeat(Math.min(e.password.length || 8, 12))}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(e.last_updated)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      e.source === "Chrome"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    }`}>
                      {e.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length === 0 && !loading && (
        <div className="rounded-xl border border-border bg-muted/30 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No passwords found. Make sure Login Data files are copied to the data/ directory.
          </p>
        </div>
      )}
    </div>
  );
}
