"use client";

import { Button } from "@/components/ui/button";
import { useId, useState } from "react";
import { toast } from "sonner";

type PasswordEntry = {
  url: string;
  username: string;
  password: string;
  name: string;
  source: string;
};

type ConflictEntry = {
  url: string;
  username: string;
  existing: string;
  incoming: string;
  source: string;
};

type MergeResult = {
  merged: PasswordEntry[];
  conflicts: ConflictEntry[];
  duplicates: { url: string; username: string; password: string; name: string }[];
  onlyInA: PasswordEntry[];
  onlyInB: PasswordEntry[];
  inBoth: PasswordEntry[];
  stats: {
    total: number;
    duplicateCount: number;
    conflicts: number;
    onlyInA: number;
    onlyInB: number;
    inBoth: number;
    sourceA: string;
    sourceB: string;
    hasTimestamps?: boolean;
  };
};

type FileSlot = { file: File; source: string } | null;

// File drop component with flexible file type support
function FileDrop({ 
  label, 
  source, 
  value, 
  onSelect,
  accept = ".csv,.json",
  fileDesc = "CSV or JSON"
}: {
  label: string;
  source: string;
  value: FileSlot;
  onSelect: (s: FileSlot) => void;
  accept?: string;
  fileDesc?: string;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);

  const handle = (file: File | undefined) => {
    if (!file) return;
    const exts = accept.split(",").map(e => e.trim().replace(".", ""));
    const pattern = new RegExp("\.(" + exts.join("|") + ")$", "i");
    if (!file.name.match(pattern)) {
      toast.error(`Only ${fileDesc} files supported`);
      return;
    }
    onSelect({ file, source });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">{source}</span>
      </div>
      <label
        htmlFor={id}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-all ${
          dragging ? "border-amber-400 bg-amber-400/10 scale-[1.01]"
          : value ? "border-amber-400/60 bg-amber-400/5"
          : "border-border bg-muted/30 hover:border-amber-400/50 hover:bg-amber-400/5"
        }`}
      >
        {value ? (
          <>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/15">
              <svg width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-500 truncate max-w-[180px]">{value.file.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{(value.file.size / 1024).toFixed(1)} KB · Click to replace</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="text-muted-foreground">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Drop {source} file</p>
              <p className="text-[10px] text-muted-foreground">{fileDesc}</p>
            </div>
          </>
        )}
      </label>
      <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => handle(e.target.files?.[0])} />
      {value && (
        <button onClick={() => onSelect(null)} className="text-[11px] text-muted-foreground hover:text-red-500 transition-colors">
          × Remove file
        </button>
      )}
    </div>
  );
}

function toCsv(entries: PasswordEntry[]) {
  const header = "name,url,username,password,source";
  const rows = entries.map((e) =>
    [e.name, e.url, e.username, e.password, e.source]
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

export function PasswordMerge() {
  const [fileA, setFileA] = useState<FileSlot>(null);
  const [fileB, setFileB] = useState<FileSlot>(null);
  const [loginDataA, setLoginDataA] = useState<FileSlot>(null);
  const [loginDataB, setLoginDataB] = useState<FileSlot>(null);
  const [preferNewer, setPreferNewer] = useState<"a" | "b" | "timestamp">("timestamp");
  const [result, setResult] = useState<MergeResult | null>(null);
  const [merged, setMerged] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const doMerge = async () => {
    if (!fileA && !fileB) {
      toast.error("Upload at least one CSV/JSON file");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      if (fileA) {
        form.append("fileA", fileA.file);
        form.append("sourceA", fileA.source);
      }
      if (fileB) {
        form.append("fileB", fileB.file);
        form.append("sourceB", fileB.source);
      }
      if (loginDataA) form.append("loginDataA", loginDataA.file);
      if (loginDataB) form.append("loginDataB", loginDataB.file);
      form.append("preferNewer", preferNewer);

      const res = await fetch("/api/tools/password-merge", { method: "POST", body: form });
      const data: MergeResult = await res.json();
      if (!res.ok) throw new Error((data as any).error || "Merge failed");

      setResult(data);
      setMerged(data.merged);
      toast.success(`✓ Merged ${data.stats.total} passwords`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setLoading(false);
    }
  };

  const hasLoginData = loginDataA || loginDataB;

  return (
    <div className="space-y-6">
      {/* Enhanced Security Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3">
        <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <div className="text-xs text-amber-600 dark:text-amber-400">
          <p className="font-semibold mb-1">🔒 Privacy & Security</p>
          <ul className="space-y-0.5 text-[11px]">
            <li>• All files processed <strong>in memory only</strong> — never saved to disk</li>
            <li>• Login Data files decrypted using OS APIs (DPAPI on Windows)</li>
            <li>• Passwords never logged or retained after response</li>
            <li>• Temporary SQLite files deleted immediately</li>
          </ul>
        </div>
      </div>

      {/* Step 1: CSV/JSON Exports */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Step 1: Upload Password Exports</h3>
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">Required</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FileDrop label="Chrome CSV/JSON" source="Chrome" value={fileA} onSelect={setFileA} />
          <FileDrop label="Edge CSV/JSON" source="Edge" value={fileB} onSelect={setFileB} />
        </div>
      </div>

      {/* Step 2: Login Data (Optional) */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Step 2: Upload Login Data (Optional)</h3>
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">Recommended</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              For accurate conflict resolution, upload the <code className="px-1 py-0.5 rounded bg-muted text-[10px]">Login Data</code> SQLite file from each browser.
              This contains <strong>date_password_modified</strong> timestamps to ensure the latest password is always kept.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FileDrop
              label="Chrome Login Data"
              source="Chrome"
              value={loginDataA}
              onSelect={setLoginDataA}
              accept=".db,.sqlite,.sqlite3"
              fileDesc="SQLite DB"
            />
            <details className="text-[10px] text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">📁 Where to find Chrome Login Data?</summary>
              <div className="mt-1 pl-3 space-y-0.5">
                <p><strong>Windows:</strong></p>
                <code className="block bg-muted px-2 py-1 rounded text-[9px] break-all">
                  %LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data
                </code>
                <p className="mt-1"><strong>macOS:</strong></p>
                <code className="block bg-muted px-2 py-1 rounded text-[9px] break-all">
                  ~/Library/Application Support/Google/Chrome/Default/Login Data
                </code>
                <p className="mt-1 text-amber-600 dark:text-amber-400">⚠️ Close Chrome before copying this file</p>
              </div>
            </details>
          </div>
          <div className="space-y-2">
            <FileDrop
              label="Edge Login Data"
              source="Edge"
              value={loginDataB}
              onSelect={setLoginDataB}
              accept=".db,.sqlite,.sqlite3"
              fileDesc="SQLite DB"
            />
            <details className="text-[10px] text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">📁 Where to find Edge Login Data?</summary>
              <div className="mt-1 pl-3 space-y-0.5">
                <p><strong>Windows:</strong></p>
                <code className="block bg-muted px-2 py-1 rounded text-[9px] break-all">
                  %LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data
                </code>
                <p className="mt-1"><strong>macOS:</strong></p>
                <code className="block bg-muted px-2 py-1 rounded text-[9px] break-all">
                  ~/Library/Application Support/Microsoft Edge/Default/Login Data
                </code>
                <p className="mt-1 text-amber-600 dark:text-amber-400">⚠️ Close Edge before copying this file</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Step 3: Conflict Resolution */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Step 3: Conflict Resolution Strategy</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            When the same site has different passwords, which one should be kept?
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              key: "timestamp" as const,
              label: "Auto (Use Timestamps)",
              desc: hasLoginData ? "Keep password with latest date_password_modified" : "Requires Login Data files",
              icon: "⏱️",
              recommended: true,
            },
            {
              key: "a" as const,
              label: `Always Keep ${fileA?.source ?? "Chrome"}`,
              desc: "Chrome password wins all conflicts",
              icon: "🔵",
            },
            {
              key: "b" as const,
              label: `Always Keep ${fileB?.source ?? "Edge"}`,
              desc: "Edge password wins all conflicts",
              icon: "🟣",
            },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPreferNewer(opt.key)}
              disabled={opt.key === "timestamp" && !hasLoginData}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all relative ${
                preferNewer === opt.key
                  ? "border-amber-400 bg-amber-400/10"
                  : opt.key === "timestamp" && !hasLoginData
                  ? "border-border bg-muted/20 opacity-50 cursor-not-allowed"
                  : "border-border hover:border-amber-400/50 hover:bg-muted/50"
              }`}
            >
              {opt.recommended && hasLoginData && (
                <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-2 py-0.5 text-[9px] font-bold text-white shadow-lg">
                  BEST
                </span>
              )}
              <span className="text-lg shrink-0">{opt.icon}</span>
              <div className="flex-1">
                <p className={`text-xs font-semibold ${
                  preferNewer === opt.key ? "text-amber-500" : "text-foreground"
                }`}>{opt.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
              {preferNewer === opt.key && (
                <span className="ml-auto shrink-0 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
                  <svg width="8" height="8" fill="white" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Merge Button */}
      <Button
        onClick={doMerge}
        disabled={loading || (!fileA && !fileB)}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Processing...
          </span>
        ) : "🔀 Merge Passwords"}
      </Button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.stats.hasTimestamps && (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-2">
              <svg width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                ✓ Timestamp-based resolution active — conflicts resolved using date_password_modified
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Merged", value: merged.length, icon: "✓", color: "text-foreground" },
              { label: "Conflicts Resolved", value: result.stats.conflicts, icon: "⚠️", color: "text-amber-500" },
              { label: "Duplicates Removed", value: result.stats.duplicateCount, icon: "=", color: "text-muted-foreground" },
              { label: "New Entries", value: result.stats.onlyInA + result.stats.onlyInB, icon: "+", color: "text-green-500" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-lg">{s.icon}</span>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowPasswords((v) => !v)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPasswords ? "Hide" : "Show"} passwords
            </button>
            <Button variant="outline" className="h-9 text-xs" onClick={() => dl(toCsv(merged), "merged-passwords.csv", "text/csv")}>
              ↓ Download CSV
            </Button>
            <Button variant="outline" className="h-9 text-xs" onClick={() => dl(JSON.stringify(merged, null, 2), "merged-passwords.json", "application/json")}>
              ↓ Download JSON
            </Button>
          </div>

          <div className="overflow-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Name", "URL", "Username", "Password", "Source"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {merged.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">No entries</td></tr>
                ) : (
                  merged.map((e, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2 max-w-[110px] truncate text-foreground">{e.name || "—"}</td>
                      <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground">{e.url || "—"}</td>
                      <td className="px-3 py-2 max-w-[130px] truncate text-foreground">{e.username || "—"}</td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {showPasswords ? e.password : "•".repeat(Math.min(e.password.length || 8, 10))}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{e.source}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Showing {merged.length} merged passwords
          </p>
        </div>
      )}
    </div>
  );
}
