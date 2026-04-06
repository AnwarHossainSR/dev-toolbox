import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { existsSync } from "fs";
import Database from "better-sqlite3";

// ── Types ────────────────────────────────────────────────────────────────────

type LoginEntry = {
  url: string;
  username: string;
  password: string;
  last_updated: string;
  source: string;
};

type MergedResult = {
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
};

// ── Chrome epoch → ISO ───────────────────────────────────────────────────────
// Chrome stores timestamps as microseconds since Jan 1, 1601
function chromeTimeToISO(chromeTime: number): string {
  if (!chromeTime || chromeTime === 0) return "";
  const epochDiff = 11644473600000000; // microseconds between 1601 and 1970
  const ms = (chromeTime - epochDiff) / 1000;
  return new Date(ms).toISOString();
}

// ── Decrypt password (Windows DPAPI) ─────────────────────────────────────────
function decryptPassword(encryptedPassword: Buffer): string {
  try {
    // On Windows, use DPAPI via node-dpapi
    // For now, return placeholder - actual decryption requires node-dpapi package
    // which needs to be installed: npm install node-dpapi
    
    // Check if running on Windows
    if (process.platform !== "win32") {
      return "[Decryption only supported on Windows]";
    }

    // Try to load node-dpapi dynamically
    try {
      const dpapi = require("node-dpapi");
      const decrypted = dpapi.unprotectData(
        encryptedPassword,
        null,
        "CurrentUser"
      );
      return decrypted.toString("utf-8");
    } catch (err) {
      // node-dpapi not installed
      return "[Install node-dpapi for decryption]";
    }
  } catch (err) {
    return "[Decryption failed]";
  }
}

// ── Read Login Data from file ────────────────────────────────────────────────
function readLoginData(filePath: string, source: string): LoginEntry[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const entries: LoginEntry[] = [];

  try {
    const db = new Database(filePath, { readonly: true, fileMustExist: true });

    try {
      const rows = db
        .prepare(
          `SELECT origin_url, username_value, password_value, date_password_modified, date_created
           FROM logins
           WHERE blacklisted_by_user = 0`
        )
        .all() as Array<{
          origin_url: string;
          username_value: string;
          password_value: Buffer;
          date_password_modified: number;
          date_created: number;
        }>;

      for (const row of rows) {
        const timestamp =
          row.date_password_modified || row.date_created || 0;
        const lastUpdated = chromeTimeToISO(timestamp);

        // Decrypt password
        const decryptedPassword = decryptPassword(row.password_value);

        entries.push({
          url: row.origin_url,
          username: row.username_value,
          password: decryptedPassword,
          last_updated: lastUpdated,
          source,
        });
      }
    } finally {
      db.close();
    }
  } catch (err) {
    console.error(`Error reading ${source} Login Data:`, err);
  }

  return entries;
}

// ── Merge entries with conflict resolution ───────────────────────────────────
function mergeEntries(
  chromeEntries: LoginEntry[],
  edgeEntries: LoginEntry[]
): MergedResult {
  const merged = new Map<string, LoginEntry>();
  const conflicts: MergedResult["conflicts"] = [];
  let latestChrome = 0;
  let latestEdge = 0;

  // Add Chrome entries
  for (const entry of chromeEntries) {
    const key = `${entry.url}||${entry.username}`.toLowerCase();
    merged.set(key, entry);
  }

  // Merge Edge entries with conflict detection
  for (const edgeEntry of edgeEntries) {
    const key = `${edgeEntry.url}||${edgeEntry.username}`.toLowerCase();
    const chromeEntry = merged.get(key);

    if (!chromeEntry) {
      // Only in Edge
      merged.set(key, edgeEntry);
    } else if (chromeEntry.password !== edgeEntry.password) {
      // Conflict: different passwords
      const chromeTime = new Date(chromeEntry.last_updated).getTime();
      const edgeTime = new Date(edgeEntry.last_updated).getTime();

      let winner: "chrome" | "edge";
      if (chromeTime > edgeTime) {
        winner = "chrome";
        latestChrome++;
      } else if (edgeTime > chromeTime) {
        winner = "edge";
        latestEdge++;
        merged.set(key, edgeEntry);
      } else {
        // Same timestamp, prefer Edge
        winner = "edge";
        merged.set(key, edgeEntry);
      }

      conflicts.push({
        url: chromeEntry.url,
        username: chromeEntry.username,
        chrome_password: chromeEntry.password,
        chrome_updated: chromeEntry.last_updated,
        edge_password: edgeEntry.password,
        edge_updated: edgeEntry.last_updated,
        winner,
      });
    }
    // If passwords match, keep Chrome entry (already in map)
  }

  const entries = Array.from(merged.values());

  return {
    entries,
    stats: {
      total: entries.length,
      chrome: chromeEntries.length,
      edge: edgeEntries.length,
      conflicts: conflicts.length,
      latest_chrome: latestChrome,
      latest_edge: latestEdge,
    },
    conflicts,
  };
}

// ── GET handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "view";
    const filterUrl = searchParams.get("url") || "";
    const filterUsername = searchParams.get("username") || "";

    // Paths to copied Login Data files
    const projectRoot = process.cwd();
    const chromePath = join(projectRoot, "data", "chrome-login-data", "Login Data");
    const edgePath = join(projectRoot, "data", "edge-login-data", "Login Data");

    // Check if files exist
    const chromeExists = existsSync(chromePath);
    const edgeExists = existsSync(edgePath);

    if (!chromeExists && !edgeExists) {
      return NextResponse.json(
        {
          error: "No Login Data files found",
          message: "Please copy Chrome and/or Edge Login Data files to the data directory",
          instructions: {
            chrome: "Copy to: data/chrome-login-data/Login Data",
            edge: "Copy to: data/edge-login-data/Login Data",
          },
        },
        { status: 404 }
      );
    }

    // Read entries from both browsers
    const chromeEntries = chromeExists ? readLoginData(chromePath, "Chrome") : [];
    const edgeEntries = edgeExists ? readLoginData(edgePath, "Edge") : [];

    if (action === "merge") {
      // Merge with conflict resolution
      const result = mergeEntries(chromeEntries, edgeEntries);

      // Apply filters
      let filtered = result.entries;
      if (filterUrl) {
        filtered = filtered.filter((e) =>
          e.url.toLowerCase().includes(filterUrl.toLowerCase())
        );
      }
      if (filterUsername) {
        filtered = filtered.filter((e) =>
          e.username.toLowerCase().includes(filterUsername.toLowerCase())
        );
      }

      return NextResponse.json({
        ...result,
        entries: filtered,
        filtered: filtered.length !== result.entries.length,
      });
    } else {
      // View mode: return all entries separately
      let allEntries = [...chromeEntries, ...edgeEntries];

      // Apply filters
      if (filterUrl) {
        allEntries = allEntries.filter((e) =>
          e.url.toLowerCase().includes(filterUrl.toLowerCase())
        );
      }
      if (filterUsername) {
        allEntries = allEntries.filter((e) =>
          e.username.toLowerCase().includes(filterUsername.toLowerCase())
        );
      }

      return NextResponse.json({
        entries: allEntries,
        stats: {
          total: allEntries.length,
          chrome: chromeEntries.length,
          edge: edgeEntries.length,
        },
        sources: {
          chrome: chromeExists,
          edge: edgeExists,
        },
      });
    }
  } catch (err) {
    console.error("Login Data Viewer error:", err);
    return NextResponse.json(
      { error: "Failed to read Login Data files" },
      { status: 500 }
    );
  }
}
