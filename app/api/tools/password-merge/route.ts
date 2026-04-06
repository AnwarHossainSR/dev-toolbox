import { NextRequest, NextResponse } from "next/server";

export type PasswordEntry = {
  url: string;
  username: string;
  password: string;
  name: string;
  source: string;
};

export type ConflictEntry = {
  url: string;
  username: string;
  existing: string;
  incoming: string;
  source: string;
};

export type DuplicateEntry = {
  url: string;
  username: string;
  password: string;
  name: string;
};

export type MergeResult = {
  merged: PasswordEntry[];
  conflicts: ConflictEntry[];
  duplicates: DuplicateEntry[];   // same url+user+password in both files
  onlyInA: PasswordEntry[];       // only in Chrome
  onlyInB: PasswordEntry[];       // only in Edge
  inBoth: PasswordEntry[];        // in both (same password, kept once)
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

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
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

function mergeEntries(fileA: PasswordEntry[], fileB: PasswordEntry[], sourceA: string, sourceB: string, preferNewer: "a" | "b" | "manual"): MergeResult {
  const mapA = new Map<string, PasswordEntry>();
  const mapB = new Map<string, PasswordEntry>();

  for (const e of fileA) mapA.set(`${e.url}||${e.username}`.toLowerCase(), e);
  for (const e of fileB) mapB.set(`${e.url}||${e.username}`.toLowerCase(), e);

  const merged = new Map<string, PasswordEntry>();
  const conflicts: ConflictEntry[] = [];
  const duplicates: DuplicateEntry[] = [];
  const onlyInA: PasswordEntry[] = [];
  const onlyInB: PasswordEntry[] = [];
  const inBoth: PasswordEntry[] = [];

  // Process all keys from both
  const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);

  for (const key of allKeys) {
    const a = mapA.get(key);
    const b = mapB.get(key);

    if (a && !b) {
      // Only in Chrome
      onlyInA.push(a);
      merged.set(key, a);
    } else if (!a && b) {
      // Only in Edge
      onlyInB.push(b);
      merged.set(key, b);
    } else if (a && b) {
      if (a.password === b.password) {
        // Exact duplicate — same url, username, password
        duplicates.push({ url: a.url, username: a.username, password: a.password, name: a.name });
        inBoth.push({ ...a, source: `${sourceA} + ${sourceB}` });
        merged.set(key, { ...a, source: `${sourceA} + ${sourceB}` });
      } else {
        // Conflict — same url+username, different password
        // Winner depends on preferNewer: 'a' = keep Chrome, 'b' = keep Edge, 'manual' = keep both for user to decide (default keep b)
        const winner = preferNewer === "a" ? a : b;
        const loser  = preferNewer === "a" ? b : a;
        conflicts.push({
          url: a.url,
          username: a.username,
          existing: loser.password,
          incoming: winner.password,
          source: winner.source,
        });
        inBoth.push({ ...winner, source: `${sourceA} + ${sourceB} (conflict)` });
        merged.set(key, { ...winner, source: winner.source });
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
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const fileA = form.get("fileA") as File | null;
    const fileB = form.get("fileB") as File | null;
    const sourceA = (form.get("sourceA") as string) || "Chrome";
    const sourceB = (form.get("sourceB") as string) || "Edge";
    const preferNewer = ((form.get("preferNewer") as string) || "b") as "a" | "b" | "manual";

    if (!fileA && !fileB) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const entriesA = fileA ? parseFile(await fileA.text(), fileA.name, sourceA) : [];
    const entriesB = fileB ? parseFile(await fileB.text(), fileB.name, sourceB) : [];
    const result = mergeEntries(entriesA, entriesB, sourceA, sourceB, preferNewer);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Password merge error:", err);
    return NextResponse.json({ error: "Failed to process files" }, { status: 500 });
  }
}
