"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useId, useMemo, useRef, useState } from "react";
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

const IMAGE_TOOL_SLUGS = new Set([
  "image-resizer",
  "image-compressor",
  "image-cropper",
  "image-format-converter",
  "background-remover",
  "image-watermark",
  "image-to-base64",
  "base64-to-image",
  "color-palette-extractor",
  "exif-metadata-viewer",
  "screenshot-annotator",
  "batch-image-renamer",
  "remini-logo-remover",
  "ai-image-assistant-gemini",
]);

const IMAGE_TOOL_CARD_CLASS =
  "relative overflow-hidden border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-sm";

function stripExtension(name: string) {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

function ImageToolDesignWrapper({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <Card className={IMAGE_TOOL_CARD_CLASS}>
        <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="relative p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-sky-700/80">
            Image Lab
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {slugTitle(slug)}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Fast browser-side processing with a cleaner workspace and better
            visual controls.
          </p>
        </div>
      </Card>
      {children}
    </div>
  );
}

function StyledFilePicker({
  label,
  onSelect,
  accept = "image/*",
  multiple = false,
}: {
  label: string;
  onSelect: (files: FileList | null) => void;
  accept?: string;
  multiple?: boolean;
}) {
  const id = useId();
  const [selected, setSelected] = useState("No file selected");

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>
      <div className="rounded-xl border border-sky-200 bg-linear-to-br from-white to-sky-50 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={id}
            className="inline-flex cursor-pointer items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Choose File
          </label>
          <span className="line-clamp-1 text-xs text-slate-600">
            {selected}
          </span>
        </div>
      </div>
      <Input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          const files = e.target.files;
          if (!files || !files.length) {
            setSelected("No file selected");
            onSelect(files);
            return;
          }
          const names = Array.from(files)
            .slice(0, 2)
            .map((f) => f.name)
            .join(", ");
          setSelected(
            files.length > 2 ? `${names} +${files.length - 2} more` : names,
          );
          onSelect(files);
        }}
      />
    </div>
  );
}

function GeminiImageAssistant({ slug }: { slug: string }) {
  const [prompt, setPrompt] = useState(
    "Suggest optimal settings and steps for this image task.",
  );
  const [imageMeta, setImageMeta] = useState<Record<string, string> | null>(
    null,
  );
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askGemini = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tools/gemini-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: slug,
          prompt,
          imageMeta,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Gemini request failed");
        return;
      }
      setResponse(data.text || "No suggestions returned.");
    } catch {
      toast.error("Could not reach Gemini assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={IMAGE_TOOL_CARD_CLASS}>
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-700/80">
              Gemini Copilot
            </p>
            <h4 className="text-base font-semibold text-slate-900">
              AI Image Guidance
            </h4>
            <p className="text-sm text-slate-600">
              Ask Gemini for workflow tips, quality settings, and cleanup
              strategy before exporting.
            </p>
          </div>
          <div className="rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-xs text-sky-700">
            Beta
          </div>
        </div>
        <StyledFilePicker
          label="Reference image"
          onSelect={async (files) => {
            const f = files?.[0];
            if (!f) {
              setImageMeta(null);
              return;
            }
            const loaded = await loadImageFromFile(f);
            setImageMeta({
              fileName: loaded.fileName,
              width: String(loaded.width),
              height: String(loaded.height),
            });
          }}
        />
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-24"
          placeholder="What should I do to improve this image result?"
        />
        <div className="flex items-center gap-2">
          <Button onClick={askGemini} disabled={loading}>
            {loading ? "Thinking..." : "Ask Gemini"}
          </Button>
          <p className="text-xs text-slate-500">
            Set GEMINI_API_KEY in env to enable.
          </p>
        </div>
        <Textarea
          readOnly
          value={response}
          className="h-44 bg-white/90 font-mono text-xs"
          placeholder="Gemini suggestions will appear here"
        />
      </div>
    </Card>
  );
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

function ImagePreviewPanel({
  title,
  src,
  emptyText,
}: {
  title: string;
  src?: string;
  emptyText: string;
}) {
  return (
    <Card className="p-4">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      {src ? (
        <img
          src={src}
          alt={title}
          className="h-72 w-full rounded-md border bg-white object-contain"
        />
      ) : (
        <div className="flex h-72 items-center justify-center rounded-md border border-dashed bg-slate-50 px-4 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      )}
    </Card>
  );
}

function ImageResizer() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [w, setW] = useState(800);
  const [h, setH] = useState(600);
  const [result, setResult] = useState("");

  const onFile = async (f?: File) => {
    if (!f) return;
    const loaded = await loadImageFromFile(f);
    setImg(loaded);
    setW(loaded.width);
    setH(loaded.height);
    setResult("");
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
    setResult(canvas.toDataURL("image/png"));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Resize</p>
        <StyledFilePicker
          label="Image file"
          onSelect={(files) => onFile(files?.[0])}
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
          Generate Preview
        </Button>
        <Button
          variant="outline"
          disabled={!result}
          onClick={() =>
            downloadDataUrl(
              result,
              `${stripExtension(img?.fileName || "image")}-resized.png`,
            )
          }
        >
          Download Resized Image
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to start resizing."
        />
        <ImagePreviewPanel
          title="Resized Preview"
          src={result}
          emptyText="Resized output preview will appear here."
        />
      </div>
    </div>
  );
}

function ImageCompressor() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [result, setResult] = useState("");

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
    setResult(canvas.toDataURL("image/jpeg", quality));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Compress</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const file = files?.[0];
            setResult("");
            setImg(file ? await loadImageFromFile(file) : null);
          }}
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
          Generate Preview
        </Button>
        <Button
          variant="outline"
          disabled={!result}
          onClick={() =>
            downloadDataUrl(
              result,
              `${stripExtension(img?.fileName || "image")}-compressed.jpg`,
            )
          }
        >
          Download Compressed JPG
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to preview compression."
        />
        <ImagePreviewPanel
          title="Compressed Preview"
          src={result}
          emptyText="Compressed output preview will appear here."
        />
      </div>
    </div>
  );
}

function ImageCropper() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [cw, setCw] = useState(400);
  const [ch, setCh] = useState(400);
  const [result, setResult] = useState("");

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
    setResult(canvas.toDataURL("image/png"));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Crop</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const file = files?.[0];
            setResult("");
            setImg(file ? await loadImageFromFile(file) : null);
          }}
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
          Generate Preview
        </Button>
        <Button
          variant="outline"
          disabled={!result}
          onClick={() =>
            downloadDataUrl(
              result,
              `${stripExtension(img?.fileName || "image")}-cropped.png`,
            )
          }
        >
          Download Cropped Image
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to preview crop."
        />
        <ImagePreviewPanel
          title="Cropped Preview"
          src={result}
          emptyText="Cropped output preview will appear here."
        />
      </div>
    </div>
  );
}

function ImageFormatConverter() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [format, setFormat] = useState("image/png");
  const [result, setResult] = useState("");

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
    setResult(canvas.toDataURL(format));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Convert</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const file = files?.[0];
            setResult("");
            setImg(file ? await loadImageFromFile(file) : null);
          }}
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
          Generate Preview
        </Button>
        <Button
          variant="outline"
          disabled={!result}
          onClick={() => {
            const ext = format.split("/")[1];
            downloadDataUrl(
              result,
              `${stripExtension(img?.fileName || "image")}-converted.${ext}`,
            );
          }}
        >
          Download Converted Image
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to preview conversion."
        />
        <ImagePreviewPanel
          title="Converted Preview"
          src={result}
          emptyText="Converted output preview will appear here."
        />
      </div>
    </div>
  );
}

function BackgroundRemover() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [threshold, setThreshold] = useState(35);
  const [result, setResult] = useState("");

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
    setResult(canvas.toDataURL("image/png"));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Remove Background</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const file = files?.[0];
            setResult("");
            setImg(file ? await loadImageFromFile(file) : null);
          }}
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
          Generate Preview
        </Button>
        <Button
          variant="outline"
          disabled={!result}
          onClick={() =>
            downloadDataUrl(
              result,
              `${stripExtension(img?.fileName || "image")}-bg-removed.png`,
            )
          }
        >
          Download PNG
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to preview background removal."
        />
        <ImagePreviewPanel
          title="Background Removed"
          src={result}
          emptyText="Processed image will appear here."
        />
      </div>
    </div>
  );
}

function ImageWatermark() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [text, setText] = useState("Dev Toolbox");
  const [result, setResult] = useState("");

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
    setResult(canvas.toDataURL("image/png"));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Watermark</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const file = files?.[0];
            setResult("");
            setImg(file ? await loadImageFromFile(file) : null);
          }}
        />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Watermark text"
        />
        <Button onClick={run} disabled={!img}>
          Generate Preview
        </Button>
        <Button
          variant="outline"
          disabled={!result}
          onClick={() =>
            downloadDataUrl(
              result,
              `${stripExtension(img?.fileName || "image")}-watermarked.png`,
            )
          }
        >
          Download Watermarked Image
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to preview watermark."
        />
        <ImagePreviewPanel
          title="Watermarked Preview"
          src={result}
          emptyText="Watermarked image preview will appear here."
        />
      </div>
    </div>
  );
}

function ImageToBase64() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [out, setOut] = useState("");
  const [result, setResult] = useState("");
  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Encode</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const f = files?.[0];
            if (!f) return;
            const loaded = await loadImageFromFile(f);
            setImg(loaded);
            const buf = await f.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = "";
            bytes.forEach((b) => (binary += String.fromCharCode(b)));
            const dataUrl = `data:${f.type};base64,${btoa(binary)}`;
            setOut(dataUrl);
            setResult(dataUrl);
          }}
        />
        <Textarea
          value={out}
          onChange={(e) => {
            setOut(e.target.value);
            setResult(e.target.value);
          }}
          className="h-48 font-mono text-xs"
        />
        <Button
          variant="outline"
          disabled={!result}
          onClick={() => downloadDataUrl(result, "image-from-base64.png")}
        >
          Download Encoded Preview
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to encode to Base64."
        />
        <ImagePreviewPanel
          title="Decoded Preview"
          src={result}
          emptyText="Decoded preview will appear here."
        />
      </div>
    </div>
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
      <p className="text-sm font-medium">Paste Base64 or Upload Image</p>
      <StyledFilePicker
        label="Image file"
        onSelect={async (files) => {
          const f = files?.[0];
          if (!f) return;
          const buf = await f.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = "";
          bytes.forEach((b) => (binary += String.fromCharCode(b)));
          setInput(`data:${f.type};base64,${btoa(binary)}`);
        }}
      />
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
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Extract Palette</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const file = files?.[0];
            setColors([]);
            setImg(file ? await loadImageFromFile(file) : null);
          }}
        />
        <Button onClick={run} disabled={!img}>
          Extract Palette
        </Button>
        <div className="grid grid-cols-2 gap-2">
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
      <ImagePreviewPanel
        title="Image Preview"
        src={img?.src}
        emptyText="Upload an image to extract dominant colors."
      />
    </div>
  );
}

function ExifMetadataViewer() {
  const [imgSrc, setImgSrc] = useState("");
  const [meta, setMeta] = useState<Record<string, string>>({});

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(meta, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image-metadata.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Inspect Metadata</p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const f = files?.[0];
            if (!f) return;
            const loaded = await loadImageFromFile(f);
            setImgSrc(loaded.src);
            setMeta({
              fileName: f.name,
              fileType: f.type || "unknown",
              fileSize: `${(f.size / 1024).toFixed(2)} KB`,
              width: String(loaded.width),
              height: String(loaded.height),
              lastModified: new Date(f.lastModified).toLocaleString(),
            });
          }}
        />
        <pre className="max-h-72 overflow-auto rounded border bg-muted p-3 text-xs">
          {JSON.stringify(meta, null, 2)}
        </pre>
        <Button variant="outline" onClick={downloadJson} disabled={!imgSrc}>
          Download Metadata JSON
        </Button>
      </Card>
      <ImagePreviewPanel
        title="Image Preview"
        src={imgSrc}
        emptyText="Upload an image to inspect metadata."
      />
    </div>
  );
}

function ScreenshotAnnotator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#ff0000");
  const [size, setSize] = useState(3);

  const loadToCanvas = async (file?: File) => {
    if (!file) return;
    const loaded = await loadImageFromFile(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = loaded.src;
    });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

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
      <p className="text-sm font-medium">Upload and Annotate</p>
      <StyledFilePicker
        label="Image file"
        onSelect={(files) => loadToCanvas(files?.[0])}
      />
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
          Download Annotated Image
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
    <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Generate Rename Plan</p>
        <StyledFilePicker
          label="Image files"
          multiple
          onSelect={(files) => setFiles(Array.from(files ?? []))}
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
      <Card className="p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">
          Uploaded Preview
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {files.slice(0, 9).map((f) => (
            <div key={f.name} className="rounded border p-2">
              <img
                src={URL.createObjectURL(f)}
                alt={f.name}
                className="h-20 w-full rounded object-cover"
              />
              <p className="mt-1 truncate text-[10px] text-slate-500">
                {f.name}
              </p>
            </div>
          ))}
          {!files.length && (
            <div className="col-span-full flex h-48 items-center justify-center rounded border border-dashed bg-slate-50 text-sm text-slate-500">
              Upload images to preview and build a rename plan.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReminiLogoRemover() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [ratio, setRatio] = useState(0.16);
  const [padding, setPadding] = useState(14);
  const [result, setResult] = useState("");

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

    const rw = Math.max(24, Math.round(canvas.width * ratio));
    const rh = Math.max(20, Math.round(canvas.height * 0.09));
    const x = Math.max(0, canvas.width - rw - padding);
    const y = Math.max(0, canvas.height - rh - padding);

    const sampleY = Math.max(0, y - rh - 4);
    const sample = ctx.getImageData(x, sampleY, rw, rh);
    ctx.putImageData(sample, x, y);

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(x, y, rw, rh);
    setResult(canvas.toDataURL("image/png"));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium">Upload and Clean Logo Area</p>
        <p className="text-xs text-muted-foreground">
          Use this only on images you own or have rights to edit.
        </p>
        <StyledFilePicker
          label="Image file"
          onSelect={async (files) => {
            const file = files?.[0];
            setResult("");
            setImg(file ? await loadImageFromFile(file) : null);
          }}
        />
        <label className="text-sm">Logo Width Ratio: {ratio.toFixed(2)}</label>
        <Input
          type="range"
          min={0.08}
          max={0.3}
          step={0.01}
          value={ratio}
          onChange={(e) => setRatio(Number(e.target.value))}
        />
        <label className="text-sm">Padding: {padding}px</label>
        <Input
          type="range"
          min={0}
          max={40}
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
        />
        <Button onClick={run} disabled={!img}>
          Generate Preview
        </Button>
        <Button
          variant="outline"
          disabled={!result}
          onClick={() =>
            downloadDataUrl(
              result,
              `${stripExtension(img?.fileName || "image")}-logo-clean.png`,
            )
          }
        >
          Download Clean Image
        </Button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ImagePreviewPanel
          title="Original"
          src={img?.src}
          emptyText="Upload an image to clean logo area."
        />
        <ImagePreviewPanel
          title="Cleaned Preview"
          src={result}
          emptyText="Result preview will appear here."
        />
      </div>
    </div>
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
  "remini-logo-remover": ReminiLogoRemover,
  "ai-image-assistant-gemini": () => (
    <GeminiImageAssistant slug="ai-image-assistant-gemini" />
  ),
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

  if (IMAGE_TOOL_SLUGS.has(slug)) {
    return (
      <ImageToolDesignWrapper slug={slug}>
        <Comp />
        {slug !== "ai-image-assistant-gemini" && (
          <GeminiImageAssistant slug={slug} />
        )}
      </ImageToolDesignWrapper>
    );
  }

  return <Comp />;
}
