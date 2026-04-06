import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
import { writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

// ── Types ────────────────────────────────────────────────────────────────────

export type PasswordEntry = {
  url: string;
  username: string;
  password: string;
  name: string;
  source: string;
  last_updated?: string; // ISO string
  timestamp_source?: "login_data" | "vault" | "file" | "none";
};

export type ConflictEntry = {
  url: string;
  username: string;
  existing: string;
  existing_updated?: string;
  existing_source?: string;
  incoming: string;
  incoming_updated?: string;
  incoming_source?: string;
  winner: "existing" | "incoming" | "tie";
  resolution_reason: string;
};

export type MergeResult = {
  merged: PasswordEntry[];
  conflicts: ConflictEntry[];
  duplicates: { url: string; username: string; name: string }[];
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
    hasTimestamps: boolean;
  };
};

// ── Chrome epoch → ISO ───────────────────────────────────────────────────────
// Chrome stores timestamps as microseconds since Jan 1, 1601
function chromeTimeToISO(chromeTime: number): string {
  if (!chromeTime || chromeTime === 0) return "";
  const epochDiff = 11644473600000000; // microseconds between 1601 and 1970
  const ms = (chromeTime - epochDiff) / 1000;
  return new Date(ms).toISOString();
}

// ── Parse Login Data SQLite ──────────────────────────────────────────────────
type LoginDataRow = {
  origin_url: string;
  username_value: string;
  password_value: Buffer;
  display_name: string;
  date_password_modified: number;
  date_created: number;
};

async function parseLoginData(
  buffer: Buffer,
  source: string,
): Promise<Map<string, { timestamp: string; source: string }>> {
  const map = new Map<string, { timestamp: string; source: string }>();
  const tmpPath = join(tmpdir(), `login-data-${randomUUID()}.db`);

  try {
    await writeFile(tmpPath, buffer);
    // Dynamic import so it only loads server-side
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(tmpPath, { readonly: true, fileMustExist: true });

    try {
      const rows = db
        .prepare(
          `SELECT origin_url, username_value, date_password_modified, date_created
           FROM logins
           WHERE blacklisted_by_user = 0`,
        )
        .all() as Omit<LoginDataRow, "password_value" | "display_name">[];

      for (const row of rows) {
        const key = `${row.origin_url}||${row.username_value}`.toLowerCase();
        const ts =
          row.date_password_modified
            ? chromeTimeToISO(row.date_password_modified)
            : row.date_created
            ? chromeTimeToISO(row.date_created)
            : "";
        if (ts) map.set(key, { timestamp: ts, source });
      }
    } finally {
      db.close();
    }
  } catch (err) {
    console.warn("Login Data parse warning:", err);
  } finally {
    // Always delete temp file
    await unlink(tmpPath).catch(() => {});
  }

  return map;
}

// ── CSV parser ───────────────────────────────────────────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let cur = "";
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { values.push(cur); cur = ""; continue; }
      cur += ch;
    }
    values.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function normalizeRow(row: Record<string, string>, source: string): PasswordEntry {
  return {
    url: (row.url ?? row.origin_url ?? row.URL ?? "").trim(),
    username: (row.username ?? row.Username ?? row.login ?? "").trim(),
    password: (row.password ?? row.Password ?? "").trim(),
    name: (row.name ?? row.Name ?? row.title ?? "").trim(),
    source,
    last_updated: row.last_updated ?? row.date_modified ?? undefined,
    timestamp_source: "none",
  };
}

function parseFile(text: string, filename: string, source: string): PasswordEntry[] {
  const ext = filename.split(".").pop()?.toLowerCase();
  let rows: Record<string, string>[] = [];
  if (ext === "json") {
    try {
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : parsed.passwords ?? parsed.items ?? [];
    } catch { return []; }
  } else {
    rows = parseCsv(text);
  }
  return rows.map((r) => normalizeRow(r, source)).filter((e) => e.url || e.username);
}

// ── Enrich entries with Login Data timestamps ────────────────────────────────
function enrichWithTimestamps(
  entries: PasswordEntry[],
  tsMap: Map<string, { timestamp: string; source: string }>,
): PasswordEntry[] {
  return entries.map((e) => {
    const key = `${e.url}||${e.username}`.toLowerCase();
    const ts = tsMap.get(key);
    if (ts) {
      return { ...e, last_updated: ts.timestamp, timestamp_source: "login_data" as const };
    }
    return e;
  });
}

// ── Conflict resolution ──────────────────────────────────────────────────────
function resolveConflict(
  a: PasswordEntry,
  b: PasswordEntry,
  preferNewer: "a" | "b" | "timestamp",
): { winner: PasswordEntry; loser: PasswordEntry; resolution: "existing" | "incoming" | "tie"; reason: string } {
  if (preferNewer === "timestamp") {
    const hasA = !!a.last_updated;
    const hasB = !!b.last_updated;

    if (hasA && hasB) {
      const tA = new Date(a.last_updated!).getTime();
      const tB = new Date(b.last_updated!).getTime();
      if (tA > tB) return { winner: a, loser: b, resolution: "existing", reason: `${a.source} is newer (${a.last_updated})` };
      if (tB > tA) return { winner: b, loser: a, resolution: "incoming", reason: `${b.source} is newer (${b.last_updated})` };
      return { winner: b, loser: a, resolution: "tie", reason: "Same timestamp — kept incoming" };
    }
    if (hasA && !hasB) return { winner: a, loser: b, resolution: "existing", reason: `Only ${a.source} has timestamp` };
    if (!hasA && hasB) return { winner: b, loser: a, resolution: "incoming", reason: `Only ${b.source} has timestamp` };
    return { winner: b, loser: a, resolution: "tie", reason: "No timestamps available — kept incoming" };
  }
  if (preferNewer === "a") return { winner: a, loser: b, resolution: "existing", reason: `User chose ${a.source} as newer` };
  return { winner: b, loser: a, resolution: "incoming", reason: `User chose ${b.source} as newer` };
}

// ── Core merge ───────────────────────────────────────────────────────────────
function mergeEntries(
  fileA: PasswordEntry[],
  fileB: PasswordEntry[],
  sourceA: string,
  sourceB: string,
  preferNewer: "a" | "b" | "timestamp",
): MergeResult {
  const mapA = new Map<string, PasswordEntry>();
  const mapB = new Map<string, PasswordEntry>();
  for (const e of fileA) mapA.set(`${e.url}||${e.username}`.toLowerCase(), e);
  for (const e of fileB) mapB.set(`${e.url}||${e.username}`.toLowerCase(), e);

  const merged = new Map<string, PasswordEntry>();
  const conflicts: ConflictEntry[] = [];
  const duplicates: { url: string; username: string; name: string }[] = [];
  const onlyInA: PasswordEntry[] = [];
  const onlyInB: PasswordEntry[] = [];
  const inBoth: PasswordEntry[] = [];
  let hasTimestamps = false;

  for (const key of new Set([...mapA.keys(), ...mapB.keys()])) {
    const a = mapA.get(key);
    const b = mapB.get(key);

    if (a && !b) {
      onlyInA.push(a);
      merged.set(key, a);
    } else if (!a && b) {
      onlyInB.push(b);
      merged.set(key, b);
    } else if (a && b) {
      if (a.password === b.password) {
        const ts = a.last_updated && b.last_updated
          ? new Date(a.last_updated) > new Date(b.last_updated) ? a.last_updated : b.last_updated
          : a.last_updated ?? b.last_updated;
        const entry: PasswordEntry = { ...a, source: `${sourceA} + ${sourceB}`, last_updated: ts };
        duplicates.push({ url: a.url, username: a.username, name: a.name });
        inBoth.push(entry);
        merged.set(key, entry);
      } else {
        const { winner, loser, resolution, reason } = resolveConflict(a, b, preferNewer);
        if (winner.last_updated || loser.last_updated) hasTimestamps = true;
        conflicts.push({
          url: a.url,
          username: a.username,
          existing: a.password,
          existing_updated: a.last_updated,
          existing_source: a.source,
          incoming: b.password,
          incoming_updated: b.last_updated,
          incoming_source: b.source,
          winner: resolution,
          resolution_reason: reason,
        });
        inBoth.push({ ...winner, source: `${sourceA} + ${sourceB}` });
        merged.set(key, { ...winner, last_updated: winner.last_updated ?? new Date().toISOString() });
      }
    }
  }

  const mergedArr = Array.from(merged.values());
  return {
    merged: mergedArr,
    conflicts,
    duplicates,
    onlyInA,
    onlyInB,
    inBoth,
    stats: {
      total: mergedArr.length,
      duplicateCount: duplicates.length,
      conflicts: conflicts.length,
      onlyInA: onlyInA.length,
      onlyInB: onlyInB.length,
      inBoth: inBoth.length,
      sourceA,
      sourceB,
      hasTimestamps,
    },
  };
}

// ── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const fileA = form.get("fileA") as File | null;
    const fileB = form.get("fileB") as File | null;
    const loginDataA = form.get("loginDataA") as File | null; // Chrome Login Data
    const loginDataB = form.get("loginDataB") as File | null; // Edge Login Data
    const sourceA = (form.get("sourceA") as string) || "Chrome";
    const sourceB = (form.get("sourceB") as string) || "Edge";
    const preferNewer = ((form.get("preferNewer") as string) || "b") as "a" | "b" | "timestamp";

    // Optional vault entries (decrypted client-side, passed as JSON)
    const vaultJson = form.get("vaultEntries") as string | null;
    let vaultEntries: PasswordEntry[] = [];
    if (vaultJson) {
      try { vaultEntries = JSON.parse(vaultJson); } catch { /* ignore */ }
    }

    if (!fileA && !fileB && vaultEntries.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Parse Login Data SQLite files for timestamps
    const tsMapA = loginDataA
      ? await parseLoginData(Buffer.from(await loginDataA.arrayBuffer()), sourceA)
      : new Map<string, { timestamp: string; source: string }>();
    const tsMapB = loginDataB
      ? await parseLoginData(Buffer.from(await loginDataB.arrayBuffer()), sourceB)
      : new Map<string, { timestamp: string; source: string }>();

    // Parse CSV/JSON exports
    let entriesA = fileA ? parseFile(await fileA.text(), fileA.name, sourceA) : [];
    let entriesB = fileB ? parseFile(await fileB.text(), fileB.name, sourceB) : [];

    // Enrich with Login Data timestamps
    if (tsMapA.size > 0) entriesA = enrichWithTimestamps(entriesA, tsMapA);
    if (tsMapB.size > 0) entriesB = enrichWithTimestamps(entriesB, tsMapB);

    // If vault entries exist, merge them as base first
    if (vaultEntries.length > 0) {
      const vaultMerge = mergeEntries(vaultEntries, entriesA, "Vault", sourceA, "timestamp");
      entriesA = vaultMerge.merged;
    }

    const result = mergeEntries(entriesA, entriesB, sourceA, sourceB, preferNewer);

    // Fetch user for vault save (optional — client handles save separately)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return NextResponse.json({ ...result, userId: user?.id ?? null });
  } catch (err) {
    console.error("Password merge error:", err);
    return NextResponse.json({ error: "Failed to process files" }, { status: 500 });
  }
}
