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
  };
};

type FileSlot = { file: File; source: string } | null;

// ── Inline edit row for merged entries ──────────────────────────────────────
function EditableRow({
  entry,
  showPasswords,
  onSave,
  onDelete,
}: {
  entry: PasswordEntry;
  showPasswords: boolean;
  onSave: (updated: PasswordEntry) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry);

  const save = () => {
    onSave(draft);
    setEditing(false);
    toast.success("Row updated");
  };

  const cancel = () => {
    setDraft(entry);
    setEditing(false);
  };

  const cell = "px-2 py-1.5 border border-transparent rounded focus:outline-none focus:border-amber-400 bg-muted/60 text-xs w-full";

  if (editing) {
    return (
      <tr className="border-b border-border bg-amber-400/5">
        <td className="px-2 py-1.5">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={cell} placeholder="Name" />
        </td>
        <td className="px-2 py-1.5">
          <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className={cell} placeholder="URL" />
        </td>
        <td className="px-2 py-1.5">
          <input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} className={cell} placeholder="Username" />
        </td>
        <td className="px-2 py-1.5">
          <input value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} className={`${cell} font-mono`} placeholder="Password" />
        </td>
        <td className="px-2 py-1.5">
          <input value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} className={cell} placeholder="Source" />
        </td>
        <td className="px-2 py-1.5 whitespace-nowrap">
          <div className="flex gap-1">
            <button onClick={save} className="rounded px-2 py-1 text-[10px] font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">Save</button>
            <button onClick={cancel} className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
      <td className="px-3 py-2 max-w-[110px] truncate text-foreground">{entry.name || "—"}</td>
      <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground">{entry.url || "—"}</td>
      <td className="px-3 py-2 max-w-[130px] truncate text-foreground">{entry.username || "—"}</td>
      <td className="px-3 py-2 font-mono text-muted-foreground">
        {showPasswords ? entry.password : "•".repeat(Math.min(entry.password.length || 8, 10))}
      </td>
      <td className="px-3 py-2">
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{entry.source}</span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="rounded px-2 py-1 text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground hover:border-amber-400 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => { onDelete(); toast.success("Row deleted"); }}
            className="rounded px-2 py-1 text-[10px] font-medium border border-border text-muted-foreground hover:text-red-500 hover:border-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Inline edit row for conflict entries ────────────────────────────────────
function ConflictRow({
  conflict,
  showPasswords,
  onDelete,
  onKeepExisting,
  onEdit,
}: {
  conflict: ConflictEntry;
  showPasswords: boolean;
  onDelete: () => void;
  onKeepExisting: () => void;
  onEdit: (updated: ConflictEntry) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conflict);

  const save = () => {
    onEdit(draft);
    setEditing(false);
    toast.success("Conflict updated");
  };

  const cell = "px-2 py-1.5 border border-transparent rounded focus:outline-none focus:border-amber-400 bg-muted/60 text-xs w-full font-mono";

  if (editing) {
    return (
      <tr className="border-b border-border bg-amber-400/5">
        <td className="px-2 py-1.5 max-w-[140px]">
          <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} className="px-2 py-1.5 border border-transparent rounded focus:outline-none focus:border-amber-400 bg-muted/60 text-xs w-full" />
        </td>
        <td className="px-2 py-1.5">
          <input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} className="px-2 py-1.5 border border-transparent rounded focus:outline-none focus:border-amber-400 bg-muted/60 text-xs w-full" />
        </td>
        <td className="px-2 py-1.5">
          <input value={draft.incoming} onChange={(e) => setDraft({ ...draft, incoming: e.target.value })} className={cell} placeholder="Kept password" />
        </td>
        <td className="px-2 py-1.5">
          <input value={draft.existing} onChange={(e) => setDraft({ ...draft, existing: e.target.value })} className={cell} placeholder="Discarded password" />
        </td>
        <td className="px-2 py-1.5 text-[10px] text-muted-foreground">{conflict.source}</td>
        <td className="px-2 py-1.5 whitespace-nowrap">
          <div className="flex gap-1">
            <button onClick={save} className="rounded px-2 py-1 text-[10px] font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">Save</button>
            <button onClick={() => { setDraft(conflict); setEditing(false); }} className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </td>
      </tr>
    );
  }

  const mask = (p: string) => "•".repeat(Math.min(p.length || 8, 10));

  return (
    <tr className="border-b border-border last:border-0 bg-amber-400/5 group">
      <td className="px-3 py-2 max-w-[140px] truncate text-foreground">{conflict.url || "—"}</td>
      <td className="px-3 py-2 max-w-[110px] truncate text-foreground">{conflict.username || "—"}</td>
      <td className="px-3 py-2 font-mono text-green-600 dark:text-green-400">{showPasswords ? conflict.incoming : mask(conflict.incoming)}</td>
      <td className="px-3 py-2 font-mono text-red-500 line-through">{showPasswords ? conflict.existing : mask(conflict.existing)}</td>
      <td className="px-3 py-2">
        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-500">{conflict.source}</span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="rounded px-2 py-1 text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground hover:border-amber-400 transition-colors"
            title="Edit this conflict"
          >
            Edit
          </button>
          <button
            onClick={() => { onKeepExisting(); toast.success("Switched to existing password"); }}
            className="rounded px-2 py-1 text-[10px] font-medium border border-border text-muted-foreground hover:text-blue-500 hover:border-blue-400 transition-colors"
            title="Keep the existing (discarded) password instead"
          >
            Keep old
          </button>
          <button
            onClick={() => { onDelete(); toast.success("Conflict deleted"); }}
            className="rounded px-2 py-1 text-[10px] font-medium border border-border text-muted-foreground hover:text-red-500 hover:border-red-400 transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── File drop zone ───────────────────────────────────────────────────────────
function FileDrop({ label, source, value, onSelect }: {
  label: string; source: string; value: FileSlot; onSelect: (s: FileSlot) => void;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);

  const handle = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.match(/\.(csv|json)$/i)) { toast.error("Only CSV or JSON files are supported"); return; }
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
              <p className="text-xs font-semibold text-foreground">Drop {source} export here</p>
              <p className="text-[10px] text-muted-foreground">CSV or JSON · passwords export file</p>
            </div>
          </>
        )}
      </label>
      <input id={id} type="file" accept=".csv,.json" className="sr-only" onChange={(e) => handle(e.target.files?.[0])} />
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
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const TH = "px-3 py-2.5 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[10px]";

export function PasswordMerge() {
  const [fileA, setFileA] = useState<FileSlot>(null);
  const [fileB, setFileB] = useState<FileSlot>(null);
  const [preferNewer, setPreferNewer] = useState<"a" | "b" | "manual">("b");
  const [result, setResult] = useState<MergeResult | null>(null);
  const [merged, setMerged] = useState<PasswordEntry[]>([]);
  const [conflicts, setConflicts] = useState<ConflictEntry[]>([]);
  const [onlyInA, setOnlyInA] = useState<PasswordEntry[]>([]);
  const [onlyInB, setOnlyInB] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"merged" | "conflicts" | "only-a" | "only-b" | "new">("merged");

  const doMerge = async () => {
    if (!fileA && !fileB) { toast.error("Upload at least one file"); return; }
    setLoading(true);
    try {
      const form = new FormData();
      if (fileA) { form.append("fileA", fileA.file); form.append("sourceA", fileA.source); }
      if (fileB) { form.append("fileB", fileB.file); form.append("sourceB", fileB.source); }
      form.append("preferNewer", preferNewer);
      const res = await fetch("/api/tools/password-merge", { method: "POST", body: form });
      const data: MergeResult = await res.json();
      if (!res.ok) throw new Error((data as any).error || "Merge failed");
      setResult(data);
      setMerged(data.merged);
      setConflicts(data.conflicts);
      setOnlyInA(data.onlyInA ?? []);
      setOnlyInB(data.onlyInB ?? []);
      setTab("merged");
      toast.success(`Merged ${data.stats.total} passwords`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setLoading(false);
    }
  };

  // Merged tab actions
  const updateMerged = (i: number, updated: PasswordEntry) =>
    setMerged((prev) => prev.map((e, idx) => (idx === i ? updated : e)));
  const deleteMerged = (i: number) =>
    setMerged((prev) => prev.filter((_, idx) => idx !== i));

  // Conflict tab actions
  const deleteConflict = (i: number) =>
    setConflicts((prev) => prev.filter((_, idx) => idx !== i));
  const keepExisting = (i: number) =>
    setConflicts((prev) =>
      prev.map((c, idx) => idx === i ? { ...c, incoming: c.existing } : c)
    );
  const updateConflict = (i: number, updated: ConflictEntry) =>
    setConflicts((prev) => prev.map((c, idx) => (idx === i ? updated : c)));

  const filtered = merged.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.url.toLowerCase().includes(q) || e.username.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
  });

  // Map filtered indices back to merged indices for edit/delete
  const filteredWithIdx = merged
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return e.url.toLowerCase().includes(q) || e.username.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      {/* Security notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3">
        <svg width="16" height="16" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Files are processed <strong>in memory only</strong> on the server and never stored to disk. Passwords are not logged or retained after the response.
        </p>
      </div>

      {/* File upload */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FileDrop label="File 1" source="Chrome" value={fileA} onSelect={setFileA} />
        <FileDrop label="File 2" source="Edge" value={fileB} onSelect={setFileB} />
      </div>

      {/* Conflict resolution strategy */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">When same site has different passwords</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            e.g. you updated Chrome recently but not Edge — which password should win?
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {([
            {
              key: "a" as const,
              label: `Keep ${fileA?.source ?? "File 1"} (newer)`,
              desc: "Chrome password wins on all conflicts",
              icon: "🔵",
            },
            {
              key: "b" as const,
              label: `Keep ${fileB?.source ?? "File 2"} (newer)`,
              desc: "Edge password wins on all conflicts",
              icon: "🟣",
            },
            {
              key: "manual" as const,
              label: "Decide per conflict",
              desc: "Review each conflict individually in the Conflicts tab",
              icon: "✋",
            },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPreferNewer(opt.key)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                preferNewer === opt.key
                  ? "border-amber-400 bg-amber-400/10"
                  : "border-border hover:border-amber-400/50 hover:bg-muted/50"
              }`}
            >
              <span className="text-lg shrink-0">{opt.icon}</span>
              <div>
                <p className={`text-xs font-semibold ${
                  preferNewer === opt.key ? "text-amber-500" : "text-foreground"
                }`}>{opt.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
              {preferNewer === opt.key && (
                <span className="ml-auto shrink-0 h-4 w-4 rounded-full bg-amber-400 flex items-center justify-center">
                  <svg width="8" height="8" fill="white" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/></svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={doMerge} disabled={loading || (!fileA && !fileB)} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
        {loading ? "Merging..." : "Merge Passwords"}
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Total merged", value: merged.length, color: "text-foreground" },
              { label: "Only in Chrome", value: result.stats.onlyInA, color: "text-blue-500" },
              { label: "Only in Edge", value: result.stats.onlyInB, color: "text-purple-500" },
              { label: "Exact duplicates", value: result.stats.duplicateCount + (result.stats.total - merged.length), color: "text-muted-foreground" },
              { label: "Conflicts", value: conflicts.length, color: conflicts.length > 0 ? "text-amber-500" : "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
            {([
              { key: "merged", label: "Merged", count: merged.length },
              { key: "conflicts", label: "Conflicts", count: conflicts.length, warn: true },
              { key: "only-a", label: `Only in ${result.stats.sourceA}`, count: onlyInA.length },
              { key: "only-b", label: `Only in ${result.stats.sourceB}`, count: onlyInB.length },
              { key: "new", label: "New Entries", count: onlyInA.length + onlyInB.length, highlight: true },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  tab === t.key ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                    (t as any).warn && t.count > 0 ? "bg-amber-500 text-white"
                    : (t as any).highlight && t.count > 0 ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                  }`}>{t.count}</span>
                )}
                {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-sm" />}
              </button>
            ))}
          </div>

          {/* ── Merged tab ── */}
          {tab === "merged" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by URL, username, name..."
                  className="flex-1 min-w-48 h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  onClick={() => setShowPasswords((v) => !v)}
                  className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords ? "Hide" : "Show"} passwords
                </button>
                <Button variant="outline" className="h-9 text-xs" onClick={() => dl(toCsv(merged), "merged-passwords.csv", "text/csv")}>
                  ↓ CSV
                </Button>
                <Button variant="outline" className="h-9 text-xs" onClick={() => dl(JSON.stringify(merged, null, 2), "merged-passwords.json", "application/json")}>
                  ↓ JSON
                </Button>
              </div>

              <div className="overflow-auto rounded-xl border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Name", "URL", "Username", "Password", "Source", "Actions"].map((h) => (
                        <th key={h} className={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithIdx.length === 0 ? (
                      <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No results found</td></tr>
                    ) : (
                      filteredWithIdx.map(({ e, i }) => (
                        <EditableRow
                          key={i}
                          entry={e}
                          showPasswords={showPasswords}
                          onSave={(updated) => updateMerged(i, updated)}
                          onDelete={() => deleteMerged(i)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Showing {filteredWithIdx.length} of {merged.length} entries · Hover a row to edit or delete
              </p>
            </div>
          )}

          {/* ── Conflicts tab ── */}
          {tab === "conflicts" && (
            <div className="space-y-3">
              {conflicts.length === 0 ? (
                <div className="rounded-xl border border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
                  No conflicts — all passwords matched perfectly.
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs text-muted-foreground">
                      Same URL + username but different passwords. <strong>Incoming</strong> is kept by default. Use <strong>Keep old</strong> to swap.
                    </p>
                    <button
                      onClick={() => setShowPasswords((v) => !v)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswords ? "Hide" : "Reveal"} passwords
                    </button>
                  </div>
                  <div className="overflow-auto rounded-xl border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          {["URL", "Username", "Kept (Incoming)", "Discarded (Existing)", "Source", "Actions"].map((h) => (
                            <th key={h} className={TH}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {conflicts.map((c, i) => (
                          <ConflictRow
                            key={i}
                            conflict={c}
                            showPasswords={showPasswords}
                            onDelete={() => deleteConflict(i)}
                            onKeepExisting={() => keepExisting(i)}
                            onEdit={(updated) => updateConflict(i, updated)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} · Hover a row to edit, swap, or delete
                  </p>
                </>
              )}
            </div>
          )}
          {/* ── New Entries tab ── */}
          {tab === "new" && (() => {
            const newEntries = [...onlyInA, ...onlyInB];
            return (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
                  <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    <strong>{newEntries.length} new entries</strong> that exist in only one browser and are missing from the other.
                    These are the rows that will be <strong>added</strong> when you import the merged CSV into both browsers to sync them.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowPasswords((v) => !v)}
                    className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords ? "Hide" : "Show"} passwords
                  </button>
                  <Button variant="outline" className="h-9 text-xs" onClick={() => dl(toCsv(newEntries), "new-entries.csv", "text/csv")}>
                    ↓ Download CSV
                  </Button>
                  <Button variant="outline" className="h-9 text-xs" onClick={() => dl(JSON.stringify(newEntries, null, 2), "new-entries.json", "application/json")}>
                    ↓ Download JSON
                  </Button>
                </div>

                <div className="overflow-auto rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {["Source", "Name", "URL", "Username", "Password"].map((h) => (
                          <th key={h} className={TH}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {newEntries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                            No new entries — both files are perfectly in sync!
                          </td>
                        </tr>
                      ) : (
                        newEntries.map((e, i) => (
                          <tr key={i} className={`border-b border-border last:border-0 hover:bg-muted/30 ${
                            e.source === result.stats.sourceA ? "border-l-2 border-l-blue-400" : "border-l-2 border-l-purple-400"
                          }`}>
                            <td className="px-3 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                e.source === result.stats.sourceA
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              }`}>
                                {e.source}
                              </span>
                            </td>
                            <td className="px-3 py-2 max-w-[110px] truncate text-foreground">{e.name || "—"}</td>
                            <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground">{e.url || "—"}</td>
                            <td className="px-3 py-2 max-w-[130px] truncate text-foreground">{e.username || "—"}</td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">
                              {showPasswords ? e.password : "•".repeat(Math.min(e.password.length || 8, 10))}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {newEntries.length > 0 && (
                  <div className="flex gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      {onlyInA.length} missing from {result.stats.sourceB}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-400" />
                      {onlyInB.length} missing from {result.stats.sourceA}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Only in A / Only in B tabs ── */}
          {(tab === "only-a" || tab === "only-b") && (() => {
            const list = tab === "only-a" ? onlyInA : onlyInB;
            const label = tab === "only-a" ? result.stats.sourceA : result.stats.sourceB;
            const other = tab === "only-a" ? result.stats.sourceB : result.stats.sourceA;
            return (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  These entries exist <strong>only in {label}</strong> and are missing from {other}. They are included in the merged output.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowPasswords((v) => !v)}
                    className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords ? "Hide" : "Show"} passwords
                  </button>
                  <Button variant="outline" className="h-9 text-xs" onClick={() => dl(toCsv(list), `only-in-${label.toLowerCase()}.csv`, "text/csv")}>↓ CSV</Button>
                  <Button variant="outline" className="h-9 text-xs" onClick={() => dl(JSON.stringify(list, null, 2), `only-in-${label.toLowerCase()}.json`, "application/json")}>↓ JSON</Button>
                </div>
                <div className="overflow-auto rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {["Name", "URL", "Username", "Password"].map((h) => (
                          <th key={h} className={TH}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No entries found</td></tr>
                      ) : list.map((e, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-2 max-w-[110px] truncate text-foreground">{e.name || "—"}</td>
                          <td className="px-3 py-2 max-w-[160px] truncate text-muted-foreground">{e.url || "—"}</td>
                          <td className="px-3 py-2 max-w-[130px] truncate text-foreground">{e.username || "—"}</td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">
                            {showPasswords ? e.password : "•".repeat(Math.min(e.password.length || 8, 10))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-muted-foreground">{list.length} entries only in {label}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
