"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  slug: string;
};

type ImageState = {
  src: string;
  width: number;
  height: number;
  fileName: string;
};

function b64UrlEncode(input: string) {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function signHs256(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    const next = csv[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

function toCsvValue(v: unknown) {
  const str = String(v ?? "");
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

async function loadImageFromFile(file: File): Promise<ImageState> {
  const src = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });
  return { src, width: img.width, height: img.height, fileName: file.name };
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function slugTitle(slug: string) {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function JsonCsvConverter() {
  const [jsonInput, setJsonInput] = useState(
    '[{"name":"Alice","age":30},{"name":"Bob","age":27}]',
  );
  const [csvInput, setCsvInput] = useState("name,age\nAlice,30\nBob,27");
  const [output, setOutput] = useState("");

  const jsonToCsv = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const keys = Array.from(
        new Set(arr.flatMap((o) => Object.keys(o ?? {}))),
      );
      const lines = [keys.join(",")];
      arr.forEach((obj) => {
        lines.push(keys.map((k) => toCsvValue(obj?.[k])).join(","));
      });
      setOutput(lines.join("\n"));
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const csvToJson = () => {
    try {
      const rows = parseCsv(csvInput);
      if (rows.length < 2) throw new Error("Need header + rows");
      const [header, ...body] = rows;
      const json = body.map((r) =>
        Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])),
      );
      setOutput(JSON.stringify(json, null, 2));
    } catch {
      toast.error("Invalid CSV");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">JSON ↔ CSV</h3>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="h-44 font-mono text-sm"
        />
        <Textarea
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          className="h-32 font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={jsonToCsv}>JSON → CSV</Button>
          <Button variant="outline" onClick={csvToJson}>
            CSV → JSON
          </Button>
        </div>
      </Card>
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Output</h3>
        <Textarea
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          className="h-88 font-mono text-sm"
        />
      </Card>
    </div>
  );
}

function CronExpressionBuilder() {
  const [min, setMin] = useState("*");
  const [hour, setHour] = useState("*");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");

  const expression = `${min} ${hour} ${dom} ${month} ${dow}`;

  const human = useMemo(() => {
    return `At minute ${min}, hour ${hour}, day-of-month ${dom}, month ${month}, day-of-week ${dow}`;
  }, [min, hour, dom, month, dow]);

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Cron Builder</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Input
          value={min}
          onChange={(e) => setMin(e.target.value)}
          placeholder="minute"
        />
        <Input
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          placeholder="hour"
        />
        <Input
          value={dom}
          onChange={(e) => setDom(e.target.value)}
          placeholder="day"
        />
        <Input
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="month"
        />
        <Input
          value={dow}
          onChange={(e) => setDow(e.target.value)}
          placeholder="weekday"
        />
      </div>
      <div className="rounded-md border bg-muted p-3 font-mono text-sm">
        {expression}
      </div>
      <p className="text-sm text-muted-foreground">{human}</p>
    </Card>
  );
}

function UrlParserInspector() {
  const [value, setValue] = useState(
    "https://example.com:8080/path?name=alice&lang=en#top",
  );
  const parsed = useMemo(() => {
    try {
      const url = new URL(value);
      const params = Object.fromEntries(url.searchParams.entries());
      return {
        ok: true,
        origin: url.origin,
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        query: url.search,
        hash: url.hash,
        params,
      };
    } catch {
      return { ok: false } as const;
    }
  }, [value]);

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">URL Parser</h3>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      {parsed.ok ? (
        <pre className="rounded-md border bg-muted p-3 text-xs overflow-auto">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-red-500">Invalid URL</p>
      )}
    </Card>
  );
}

function JwtGenerator() {
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [payload, setPayload] = useState(
    '{"sub":"123","name":"Alice","iat":1710000000}',
  );
  const [secret, setSecret] = useState("my-secret");
  const [token, setToken] = useState("");

  const generate = async () => {
    try {
      const h = JSON.parse(header);
      const p = JSON.parse(payload);
      const h64 = b64UrlEncode(JSON.stringify(h));
      const p64 = b64UrlEncode(JSON.stringify(p));
      const msg = `${h64}.${p64}`;
      const sig = await signHs256(msg, secret);
      setToken(`${msg}.${sig}`);
    } catch {
      toast.error("Invalid header/payload JSON");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">JWT Generator (HS256)</h3>
        <Textarea
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          className="h-24 font-mono text-sm"
        />
        <Textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          className="h-28 font-mono text-sm"
        />
        <Input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Secret"
        />
        <Button onClick={generate}>Generate Token</Button>
      </Card>
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Token</h3>
        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="h-68 font-mono text-xs"
        />
      </Card>
    </div>
  );
}

function Base64FileEncoderDecoder() {
  const [encoded, setEncoded] = useState("");
  const [fileName, setFileName] = useState("decoded.bin");

  const onPick = async (file?: File) => {
    if (!file) return;
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    setEncoded(btoa(binary));
    setFileName(file.name + ".b64.txt");
  };

  const decode = () => {
    try {
      const bin = atob(encoded.replace(/\s+/g, ""));
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Invalid Base64");
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Base64 File Encoder/Decoder</h3>
      <Input type="file" onChange={(e) => onPick(e.target.files?.[0])} />
      <Input
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        placeholder="Download file name"
      />
      <Textarea
        value={encoded}
        onChange={(e) => setEncoded(e.target.value)}
        className="h-64 font-mono text-xs"
      />
      <div className="flex gap-2">
        <Button onClick={decode}>Decode & Download</Button>
      </div>
    </Card>
  );
}

function DiffPatchGenerator() {
  const [a, setA] = useState("line1\nline2\nline3");
  const [b, setB] = useState("line1\nlineX\nline3\nline4");
  const [patch, setPatch] = useState("");

  const generate = () => {
    const left = a.split("\n");
    const right = b.split("\n");
    const max = Math.max(left.length, right.length);
    const lines = ["--- original", "+++ updated", "@@ -1 +1 @@"];
    for (let i = 0; i < max; i++) {
      const l = left[i] ?? "";
      const r = right[i] ?? "";
      if (l === r) {
        lines.push(` ${l}`);
      } else {
        if (l) lines.push(`-${l}`);
        if (r) lines.push(`+${r}`);
      }
    }
    setPatch(lines.join("\n"));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Textarea
        value={a}
        onChange={(e) => setA(e.target.value)}
        className="h-64 font-mono text-sm"
      />
      <Textarea
        value={b}
        onChange={(e) => setB(e.target.value)}
        className="h-64 font-mono text-sm"
      />
      <Textarea
        value={patch}
        onChange={(e) => setPatch(e.target.value)}
        className="h-64 font-mono text-xs"
      />
      <Button onClick={generate} className="w-fit">
        Generate Patch
      </Button>
    </div>
  );
}

function HtmlMarkdownConverter() {
  const [input, setInput] = useState(
    "<h1>Hello</h1><p><strong>World</strong></p>",
  );
  const [output, setOutput] = useState("");

  const htmlToMd = () => {
    const out = input
      .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n")
      .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n")
      .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em>(.*?)<\/em>/gi, "*$1*")
      .replace(/<p>(.*?)<\/p>/gi, "$1\n")
      .replace(/<[^>]+>/g, "");
    setOutput(out.trim());
  };

  const mdToHtml = () => {
    const out = input
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^(?!<h\d>)(.+)$/gm, "<p>$1</p>");
    setOutput(out.trim());
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-4 space-y-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-64 font-mono text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={htmlToMd}>HTML → Markdown</Button>
          <Button variant="outline" onClick={mdToHtml}>
            Markdown → HTML
          </Button>
        </div>
      </Card>
      <Card className="p-4">
        <Textarea
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          className="h-80 font-mono text-sm"
        />
      </Card>
    </div>
  );
}

function LoremIpsumFakeData() {
  const [count, setCount] = useState(3);
  const [result, setResult] = useState("");

  const generate = () => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
    const people = Array.from({ length: count }, (_, i) => {
      const n = i + 1;
      return {
        id: n,
        name: `User ${n}`,
        email: `user${n}@example.com`,
        phone: `+1-555-01${String(n).padStart(2, "0")}`,
      };
    });
    setResult(
      `${Array.from({ length: count }, () => lorem).join(" ")}\n\n${JSON.stringify(people, null, 2)}`,
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <h3 className="font-semibold">Lorem Ipsum + Fake Data</h3>
      <Input
        type="number"
        min={1}
        max={50}
        value={count}
        onChange={(e) => setCount(Number(e.target.value || 1))}
      />
      <Button onClick={generate}>Generate</Button>
      <Textarea
        value={result}
        onChange={(e) => setResult(e.target.value)}
        className="h-72 font-mono text-sm"
      />
    </Card>
  );
}

function UuidBulkGenerator() {
  const [count, setCount] = useState(20);
  const [items, setItems] = useState<string[]>([]);

  const generate = () =>
    setItems(Array.from({ length: count }, () => crypto.randomUUID()));
  const copyAll = async () => {
    await navigator.clipboard.writeText(items.join("\n"));
    toast.success("Copied UUID list");
  };
  const download = () => {
    const blob = new Blob([items.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uuids.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex gap-2">
        <Input
          type="number"
          min={1}
          max={1000}
          value={count}
          onChange={(e) => setCount(Number(e.target.value || 1))}
        />
        <Button onClick={generate}>Generate</Button>
        <Button variant="outline" onClick={copyAll} disabled={!items.length}>
          Copy
        </Button>
        <Button variant="outline" onClick={download} disabled={!items.length}>
          Download
        </Button>
      </div>
      <Textarea
        value={items.join("\n")}
        readOnly
        className="h-80 font-mono text-xs"
      />
    </Card>
  );
}

function TimezoneMeetingPlanner() {
  const [tzA, setTzA] = useState("America/New_York");
  const [tzB, setTzB] = useState("Asia/Dhaka");
  const [time, setTime] = useState("09:00");

  const today = new Date();
  const [hh, mm] = time.split(":").map(Number);
  const localDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hh || 0,
    mm || 0,
  );

  const fmt = (tz: string) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "2-digit",
    }).format(localDate);

  return (
    <Card className="p-4 space-y-3">
      <div className="grid gap-2 md:grid-cols-3">
        <Input
          value={tzA}
          onChange={(e) => setTzA(e.target.value)}
          placeholder="Timezone A"
        />
        <Input
          value={tzB}
          onChange={(e) => setTzB(e.target.value)}
          placeholder="Timezone B"
        />
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">{tzA}</p>
          <p className="font-semibold">{fmt(tzA)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">{tzB}</p>
          <p className="font-semibold">{fmt(tzB)}</p>
        </Card>
      </div>
    </Card>
  );
}

const STATUS_CODES: Record<string, string> = {
  "100": "Continue",
  "200": "OK",
  "201": "Created",
  "204": "No Content",
  "301": "Moved Permanently",
  "302": "Found",
  "400": "Bad Request",
  "401": "Unauthorized",
  "403": "Forbidden",
  "404": "Not Found",
  "409": "Conflict",
  "422": "Unprocessable Entity",
  "429": "Too Many Requests",
  "500": "Internal Server Error",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
};

function HttpStatusLookup() {
  const [query, setQuery] = useState("");
  const filtered = Object.entries(STATUS_CODES).filter(
    ([code, text]) =>
      code.includes(query) || text.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Card className="p-4 space-y-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search code or message"
      />
      <div className="grid gap-2 md:grid-cols-2">
        {filtered.map(([code, text]) => (
          <div key={code} className="rounded border p-2 text-sm">
            <span className="font-semibold">{code}</span> - {text}
          </div>
        ))}
      </div>
    </Card>
  );
}

function SqlPrettifyMinify() {
  const [sql, setSql] = useState(
    "select id,name from users where status='active' order by created_at desc;",
  );
  const [out, setOut] = useState("");

  const prettify = () => {
    const keywords = [
      "select",
      "from",
      "where",
      "order by",
      "group by",
      "having",
      "limit",
      "join",
      "left join",
      "right join",
      "inner join",
      "and",
      "or",
    ];
    let s = sql;
    keywords.forEach((kw) => {
      const re = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
      s = s.replace(re, `\n${kw.toUpperCase()}`);
    });
    setOut(s.trim());
  };

  const minify = () => setOut(sql.replace(/\s+/g, " ").trim());

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        className="h-72 font-mono text-sm"
      />
      <Textarea
        value={out}
        onChange={(e) => setOut(e.target.value)}
        className="h-72 font-mono text-sm"
      />
      <div className="flex gap-2">
        <Button onClick={prettify}>Prettify</Button>
        <Button variant="outline" onClick={minify}>
          Minify
        </Button>
      </div>
    </div>
  );
}

const REGEX_TEMPLATES = [
  { name: "Email", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
  { name: "URL", pattern: "https?:\\/\\/.+" },
  {
    name: "IPv4",
    pattern:
      "^(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(\\.(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}$",
  },
  { name: "Hex Color", pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
];

function RegexCheatsheetTemplates() {
  const [pattern, setPattern] = useState(REGEX_TEMPLATES[0].pattern);
  const [text, setText] = useState("test@example.com");
  const [result, setResult] = useState("");

  const test = () => {
    try {
      const re = new RegExp(pattern, "g");
      const m = text.match(re) ?? [];
      setResult(m.length ? m.join("\n") : "No matches");
    } catch {
      setResult("Invalid regex pattern");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-4 space-y-2">
        {REGEX_TEMPLATES.map((t) => (
          <button
            key={t.name}
            className="block w-full rounded border p-2 text-left text-sm hover:bg-muted"
            onClick={() => setPattern(t.pattern)}
          >
            {t.name}
          </button>
        ))}
      </Card>
      <Card className="p-4 space-y-3">
        <Input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="font-mono text-sm"
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-36 font-mono text-sm"
        />
        <Button onClick={test}>Test</Button>
        <Textarea value={result} readOnly className="h-28 font-mono text-sm" />
      </Card>
    </div>
  );
}

function PasswordStrengthAuditor() {
  const [pwd, setPwd] = useState("");

  const analysis = useMemo(() => {
    if (!pwd) return null;
    let charset = 0;
    if (/[a-z]/.test(pwd)) charset += 26;
    if (/[A-Z]/.test(pwd)) charset += 26;
    if (/\d/.test(pwd)) charset += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) charset += 32;
    const entropy = pwd.length * Math.log2(Math.max(charset, 1));
    const guesses = Math.pow(2, entropy);
    const seconds = guesses / 1e10;
    return { entropy, seconds };
  }, [pwd]);

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="Enter password"
      />
      {analysis && (
        <div className="space-y-1 text-sm">
          <p>
            Entropy:{" "}
            <span className="font-semibold">
              {analysis.entropy.toFixed(2)} bits
            </span>
          </p>
          <p>
            Estimated crack-time:{" "}
            <span className="font-semibold">
              {(analysis.seconds / 3600).toFixed(2)} hours
            </span>{" "}
            (10B guesses/sec)
          </p>
        </div>
      )}
    </Card>
  );
}

function ImageResizer() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [w, setW] = useState(800);
  const [h, setH] = useState(600);

  const onFile = async (f?: File) => {
    if (!f) return;
    const loaded = await loadImageFromFile(f);
    setImg(loaded);
    setW(loaded.width);
    setH(loaded.height);
  };

  const run = async () => {
    if (!img) return;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = img.src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, w, h);
    downloadDataUrl(
      canvas.toDataURL("image/png"),
      `resized-${img.fileName}.png`,
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={w}
          onChange={(e) => setW(Number(e.target.value || 1))}
        />
        <Input
          type="number"
          value={h}
          onChange={(e) => setH(Number(e.target.value || 1))}
        />
      </div>
      <Button onClick={run} disabled={!img}>
        Resize & Download
      </Button>
    </Card>
  );
}

function ImageCompressor() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [quality, setQuality] = useState(0.8);

  const run = async () => {
    if (!img) return;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = img.src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    downloadDataUrl(
      canvas.toDataURL("image/jpeg", quality),
      `compressed-${img.fileName}.jpg`,
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) =>
          setImg(
            e.target.files?.[0]
              ? await loadImageFromFile(e.target.files[0])
              : null,
          )
        }
      />
      <label className="text-sm">Quality: {quality.toFixed(2)}</label>
      <Input
        type="range"
        min={0.1}
        max={1}
        step={0.05}
        value={quality}
        onChange={(e) => setQuality(Number(e.target.value))}
      />
      <Button onClick={run} disabled={!img}>
        Compress & Download JPG
      </Button>
    </Card>
  );
}

function ImageCropper() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [cw, setCw] = useState(400);
  const [ch, setCh] = useState(400);

  const run = async () => {
    if (!img) return;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = img.src;
    });
    const sx = Math.max(0, (image.width - cw) / 2);
    const sy = Math.max(0, (image.height - ch) / 2);
    const sw = Math.min(cw, image.width);
    const sh = Math.min(ch, image.height);
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    downloadDataUrl(canvas.toDataURL("image/png"), `crop-${img.fileName}.png`);
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) =>
          setImg(
            e.target.files?.[0]
              ? await loadImageFromFile(e.target.files[0])
              : null,
          )
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={cw}
          onChange={(e) => setCw(Number(e.target.value || 1))}
        />
        <Input
          type="number"
          value={ch}
          onChange={(e) => setCh(Number(e.target.value || 1))}
        />
      </div>
      <Button onClick={run} disabled={!img}>
        Center Crop & Download
      </Button>
    </Card>
  );
}

function ImageFormatConverter() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [format, setFormat] = useState("image/png");

  const run = async () => {
    if (!img) return;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = img.src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    const ext = format.split("/")[1];
    downloadDataUrl(
      canvas.toDataURL(format),
      `converted-${img.fileName}.${ext}`,
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) =>
          setImg(
            e.target.files?.[0]
              ? await loadImageFromFile(e.target.files[0])
              : null,
          )
        }
      />
      <select
        className="h-10 rounded-md border bg-background px-3"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option value="image/png">PNG</option>
        <option value="image/jpeg">JPG</option>
        <option value="image/webp">WEBP</option>
      </select>
      <Button onClick={run} disabled={!img}>
        Convert & Download
      </Button>
    </Card>
  );
}

function BackgroundRemover() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [threshold, setThreshold] = useState(35);

  const run = async () => {
    if (!img) return;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = img.src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = id.data;
    const corners = [
      0,
      (canvas.width - 1) * 4,
      (canvas.height - 1) * canvas.width * 4,
      (canvas.height * canvas.width - 1) * 4,
    ];
    const base = corners
      .reduce(
        (acc, idx) => {
          acc[0] += d[idx];
          acc[1] += d[idx + 1];
          acc[2] += d[idx + 2];
          return acc;
        },
        [0, 0, 0],
      )
      .map((v) => v / 4);

    for (let i = 0; i < d.length; i += 4) {
      const dist = Math.hypot(
        d[i] - base[0],
        d[i + 1] - base[1],
        d[i + 2] - base[2],
      );
      if (dist < threshold) d[i + 3] = 0;
    }
    ctx.putImageData(id, 0, 0);
    downloadDataUrl(
      canvas.toDataURL("image/png"),
      `bg-removed-${img.fileName}.png`,
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) =>
          setImg(
            e.target.files?.[0]
              ? await loadImageFromFile(e.target.files[0])
              : null,
          )
        }
      />
      <label className="text-sm">Threshold: {threshold}</label>
      <Input
        type="range"
        min={5}
        max={120}
        value={threshold}
        onChange={(e) => setThreshold(Number(e.target.value))}
      />
      <Button onClick={run} disabled={!img}>
        Remove Background (solid-bg)
      </Button>
    </Card>
  );
}

function ImageWatermark() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [text, setText] = useState("Dev Toolbox");

  const run = async () => {
    if (!img) return;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = img.src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    ctx.font = `${Math.max(16, Math.floor(canvas.width / 20))}px sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    const x = canvas.width - ctx.measureText(text).width - 20;
    const y = canvas.height - 20;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    downloadDataUrl(
      canvas.toDataURL("image/png"),
      `watermarked-${img.fileName}.png`,
    );
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) =>
          setImg(
            e.target.files?.[0]
              ? await loadImageFromFile(e.target.files[0])
              : null,
          )
        }
      />
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Watermark text"
      />
      <Button onClick={run} disabled={!img}>
        Apply Watermark
      </Button>
    </Card>
  );
}

function ImageToBase64() {
  const [out, setOut] = useState("");
  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const buf = await f.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = "";
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          setOut(`data:${f.type};base64,${btoa(binary)}`);
        }}
      />
      <Textarea
        value={out}
        onChange={(e) => setOut(e.target.value)}
        className="h-72 font-mono text-xs"
      />
    </Card>
  );
}

function Base64ToImage() {
  const [input, setInput] = useState("");
  const src = useMemo(() => {
    if (!input) return "";
    return input.startsWith("data:")
      ? input
      : `data:image/png;base64,${input.replace(/\s+/g, "")}`;
  }, [input]);

  return (
    <Card className="p-4 space-y-3">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="h-48 font-mono text-xs"
      />
      {src && (
        <img
          src={src}
          alt="decoded"
          className="max-h-80 rounded border object-contain"
        />
      )}
      <Button
        onClick={() => downloadDataUrl(src, "decoded-image.png")}
        disabled={!src}
      >
        Download
      </Button>
    </Card>
  );
}

function ColorPaletteExtractor() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [colors, setColors] = useState<string[]>([]);

  const run = async () => {
    if (!img) return;
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = img.src;
    });
    const canvas = document.createElement("canvas");
    const w = 120;
    const h = Math.max(1, Math.round((image.height / image.width) * w));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const buckets = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const top = Array.from(buckets.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([c]) => c);
    setColors(top);
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) =>
          setImg(
            e.target.files?.[0]
              ? await loadImageFromFile(e.target.files[0])
              : null,
          )
        }
      />
      <Button onClick={run} disabled={!img}>
        Extract Palette
      </Button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {colors.map((c) => (
          <button
            key={c}
            className="rounded border p-2 text-xs"
            onClick={() => navigator.clipboard.writeText(c)}
          >
            <div className="mb-1 h-8 rounded" style={{ background: c }} />
            {c}
          </button>
        ))}
      </div>
    </Card>
  );
}

function ExifMetadataViewer() {
  const [meta, setMeta] = useState<Record<string, string>>({});

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const img = await loadImageFromFile(f);
          setMeta({
            fileName: f.name,
            fileType: f.type || "unknown",
            fileSize: `${(f.size / 1024).toFixed(2)} KB`,
            width: String(img.width),
            height: String(img.height),
            lastModified: new Date(f.lastModified).toLocaleString(),
          });
        }}
      />
      <pre className="rounded border bg-muted p-3 text-xs">
        {JSON.stringify(meta, null, 2)}
      </pre>
      <p className="text-xs text-muted-foreground">
        Browser-safe metadata view. Full EXIF varies by image/format and browser
        capabilities.
      </p>
    </Card>
  );
}

function ScreenshotAnnotator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ff0000");
  const [size, setSize] = useState(3);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawing) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    downloadDataUrl(canvas.toDataURL("image/png"), "annotated-screenshot.png");
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-16 p-1"
        />
        <Input
          type="range"
          min={1}
          max={12}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
        <Button variant="outline" onClick={download}>
          Download
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={900}
        height={450}
        className="w-full rounded border bg-white"
        onMouseDown={(e) => {
          setDrawing(true);
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const rect = canvas.getBoundingClientRect();
          ctx.beginPath();
          ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        }}
        onMouseMove={draw}
        onMouseUp={() => {
          setDrawing(false);
          const ctx = canvasRef.current?.getContext("2d");
          ctx?.beginPath();
        }}
        onMouseLeave={() => {
          setDrawing(false);
          const ctx = canvasRef.current?.getContext("2d");
          ctx?.beginPath();
        }}
      />
      <p className="text-xs text-muted-foreground">
        Tip: paste your screenshot by dragging it into this tool in the next
        iteration. Current version includes canvas annotation + export.
      </p>
    </Card>
  );
}

function BatchImageRenamer() {
  const [files, setFiles] = useState<File[]>([]);
  const [pattern, setPattern] = useState("image-{n}");

  const mapped = files.map((f, i) => {
    const ext = f.name.includes(".") ? `.${f.name.split(".").pop()}` : "";
    return {
      from: f.name,
      to: `${pattern.replace("{n}", String(i + 1))}${ext}`,
    };
  });

  const downloadCsv = () => {
    const csv = [
      "from,to",
      ...mapped.map((m) => `${toCsvValue(m.from)},${toCsvValue(m.to)}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rename-plan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4 space-y-3">
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      <Input
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        placeholder="Pattern, e.g. image-{n}"
      />
      <Button onClick={downloadCsv} disabled={!mapped.length}>
        Download Rename Plan (CSV)
      </Button>
      <div className="max-h-64 overflow-auto rounded border">
        {mapped.map((m) => (
          <div
            key={m.from}
            className="grid grid-cols-2 gap-2 border-b p-2 text-xs"
          >
            <span className="truncate">{m.from}</span>
            <span className="truncate text-muted-foreground">{m.to}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const TOOL_RENDERERS: Record<string, React.ComponentType> = {
  "json-csv-converter": JsonCsvConverter,
  "cron-expression-builder": CronExpressionBuilder,
  "url-parser-inspector": UrlParserInspector,
  "jwt-generator": JwtGenerator,
  "base64-file-encoder-decoder": Base64FileEncoderDecoder,
  "diff-patch-generator": DiffPatchGenerator,
  "html-markdown-converter": HtmlMarkdownConverter,
  "lorem-ipsum-fake-data": LoremIpsumFakeData,
  "uuid-bulk-generator": UuidBulkGenerator,
  "timezone-meeting-planner": TimezoneMeetingPlanner,
  "http-status-lookup": HttpStatusLookup,
  "sql-prettify-minify": SqlPrettifyMinify,
  "regex-cheatsheet-templates": RegexCheatsheetTemplates,
  "password-strength-auditor": PasswordStrengthAuditor,
  "image-resizer": ImageResizer,
  "image-compressor": ImageCompressor,
  "image-cropper": ImageCropper,
  "image-format-converter": ImageFormatConverter,
  "background-remover": BackgroundRemover,
  "image-watermark": ImageWatermark,
  "image-to-base64": ImageToBase64,
  "base64-to-image": Base64ToImage,
  "color-palette-extractor": ColorPaletteExtractor,
  "exif-metadata-viewer": ExifMetadataViewer,
  "screenshot-annotator": ScreenshotAnnotator,
  "batch-image-renamer": BatchImageRenamer,
};

export function GeneratedTools({ slug }: Props) {
  const Comp = TOOL_RENDERERS[slug];

  if (!Comp) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold">{slugTitle(slug)}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This tool scaffold is ready but the interactive module is not attached
          yet.
        </p>
      </Card>
    );
  }

  return <Comp />;
}
