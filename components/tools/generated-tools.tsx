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
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-sky-200/60 bg-linear-to-r from-sky-50 via-white to-cyan-50 px-6 py-5 shadow-sm">
        <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-cyan-500 text-white shadow">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sky-600">
              Image Lab
            </p>
            <h3 className="text-base font-bold text-slate-900">
              {slugTitle(slug)}
            </h3>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-sky-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
            Browser-side · Private
          </div>
        </div>
      </div>
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
  const [selected, setSelected] = useState<string | null>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) {
      setSelected(null);
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
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </label>
      )}
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setDraggingOver(true);
        }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all ${
          draggingOver
            ? "border-sky-400 bg-sky-50 scale-[1.01]"
            : selected
              ? "border-sky-300 bg-sky-50/60"
              : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/50"
        }`}
      >
        {selected ? (
          <>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 15v4a2 2 0 002 2h14a2 2 0 002-2v-4M12 3v12m0 0-4-4m4 4 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-700 line-clamp-1 max-w-50">
                {selected}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Click to replace
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">
                Drop image here
              </p>
              <p className="text-[10px] text-slate-400">or click to browse</p>
            </div>
          </>
        )}
      </label>
      <Input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
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
  badge,
}: {
  title: string;
  src?: string;
  emptyText: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${src ? "bg-green-400" : "bg-slate-300"}`}
          />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
        </div>
        {badge && (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
            {badge}
          </span>
        )}
      </div>
      {src ? (
        <div className="flex flex-1 items-center justify-center bg-size-[20px_20px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%),linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%)] bg-position-[0_0,10px_10px] p-3">
          <img
            src={src}
            alt={title}
            className="max-h-80 w-full rounded-lg object-contain drop-shadow-sm"
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">{emptyText}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Shared image tool layout ─────────────────────────────────────────────── */
function ImageToolLayout({
  controls,
  previews,
}: {
  controls: React.ReactNode;
  previews: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      {/* Controls sidebar — scrollable, fixed width on large screens */}
      <div className="w-full shrink-0 lg:w-90 xl:w-100">
        <div className="sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4 p-5">{controls}</div>
        </div>
      </div>
      {/* Preview area — stacked vertically */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">{previews}</div>
    </div>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">
          {display ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-500"
      />
    </div>
  );
}

function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {children}
    </p>
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker label="" onSelect={(files) => onFile(files?.[0])} />
          <ControlLabel>Dimensions</ControlLabel>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Width (px)</label>
              <Input
                type="number"
                value={w}
                onChange={(e) => setW(Number(e.target.value || 1))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Height (px)</label>
              <Input
                type="number"
                value={h}
                onChange={(e) => setH(Number(e.target.value || 1))}
                className="h-8 text-sm"
              />
            </div>
          </div>
          {img && (
            <p className="text-[10px] text-slate-400">
              Original: {img.width} × {img.height}px
            </p>
          )}
          <Button onClick={run} disabled={!img} className="w-full">
            Generate Preview
          </Button>
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() =>
              downloadDataUrl(
                result,
                `${stripExtension(img?.fileName || "image")}-resized.png`,
              )
            }
          >
            ↓ Download Resized Image
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to start resizing."
            badge={img ? `${img.width}×${img.height}` : undefined}
          />
          <ImagePreviewPanel
            title="Resized Preview"
            src={result}
            emptyText="Hit Generate Preview to see the result here."
            badge={result ? `${w}×${h}` : undefined}
          />
        </>
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={async (files) => {
              const file = files?.[0];
              setResult("");
              setImg(file ? await loadImageFromFile(file) : null);
            }}
          />
          <ControlLabel>Settings</ControlLabel>
          <SliderControl
            label="JPEG Quality"
            value={quality}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setQuality}
            display={`${Math.round(quality * 100)}%`}
          />
          <Button onClick={run} disabled={!img} className="w-full">
            Generate Preview
          </Button>
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() =>
              downloadDataUrl(
                result,
                `${stripExtension(img?.fileName || "image")}-compressed.jpg`,
              )
            }
          >
            &darr; Download Compressed JPG
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to preview compression."
            badge={img ? `${img.width}×${img.height}` : undefined}
          />
          <ImagePreviewPanel
            title="Compressed Preview"
            src={result}
            emptyText="Hit Generate Preview to see the result here."
          />
        </>
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={async (files) => {
              const file = files?.[0];
              setResult("");
              setImg(file ? await loadImageFromFile(file) : null);
            }}
          />
          <ControlLabel>Crop Size</ControlLabel>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Width (px)</label>
              <Input
                type="number"
                value={cw}
                onChange={(e) => setCw(Number(e.target.value || 1))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Height (px)</label>
              <Input
                type="number"
                value={ch}
                onChange={(e) => setCh(Number(e.target.value || 1))}
                className="h-8 text-sm"
              />
            </div>
          </div>
          {img && (
            <p className="text-[10px] text-slate-400">
              Original: {img.width} × {img.height}px — crops from center
            </p>
          )}
          <Button onClick={run} disabled={!img} className="w-full">
            Generate Preview
          </Button>
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() =>
              downloadDataUrl(
                result,
                `${stripExtension(img?.fileName || "image")}-cropped.png`,
              )
            }
          >
            &darr; Download Cropped Image
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to preview crop."
            badge={img ? `${img.width}×${img.height}` : undefined}
          />
          <ImagePreviewPanel
            title="Cropped Preview"
            src={result}
            emptyText="Hit Generate Preview to see the cropped result."
            badge={result ? `${cw}×${ch}` : undefined}
          />
        </>
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={async (files) => {
              const file = files?.[0];
              setResult("");
              setImg(file ? await loadImageFromFile(file) : null);
            }}
          />
          <ControlLabel>Output Format</ControlLabel>
          <select
            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="image/png">PNG — lossless</option>
            <option value="image/jpeg">JPG — smaller file</option>
            <option value="image/webp">WEBP — modern, compact</option>
          </select>
          <Button onClick={run} disabled={!img} className="w-full">
            Generate Preview
          </Button>
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() => {
              const ext = format.split("/")[1];
              downloadDataUrl(
                result,
                `${stripExtension(img?.fileName || "image")}-converted.${ext}`,
              );
            }}
          >
            &darr; Download Converted Image
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to preview conversion."
            badge={img ? img.fileName : undefined}
          />
          <ImagePreviewPanel
            title="Converted Preview"
            src={result}
            emptyText="Hit Generate Preview to see the converted result."
            badge={result ? format.split("/")[1].toUpperCase() : undefined}
          />
        </>
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={async (files) => {
              const file = files?.[0];
              setResult("");
              setImg(file ? await loadImageFromFile(file) : null);
            }}
          />
          <ControlLabel>Settings</ControlLabel>
          <SliderControl
            label="Color Tolerance"
            value={threshold}
            min={5}
            max={120}
            onChange={setThreshold}
          />
          <p className="text-[10px] text-slate-400">
            Higher tolerance removes more background pixels. Works best on
            solid-color backgrounds.
          </p>
          <Button onClick={run} disabled={!img} className="w-full">
            Generate Preview
          </Button>
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() =>
              downloadDataUrl(
                result,
                `${stripExtension(img?.fileName || "image")}-bg-removed.png`,
              )
            }
          >
            &darr; Download PNG
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to preview background removal."
            badge={img ? `${img.width}×${img.height}` : undefined}
          />
          <ImagePreviewPanel
            title="Background Removed"
            src={result}
            emptyText="Processed image will appear here (transparent PNG)."
          />
        </>
      }
    />
  );
}

function ImageWatermark() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [text, setText] = useState("Dev Toolbox");
  const [result, setResult] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(42);
  const [fontWeight, setFontWeight] = useState("700");
  const [italic, setItalic] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(0.75);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [rotation, setRotation] = useState(0);
  const [xPct, setXPct] = useState(0.82);
  const [yPct, setYPct] = useState(0.88);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const updatePosition = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    setXPct(px);
    setYPct(py);
  };

  const presetPosition = (
    preset:
      | "top-left"
      | "top-right"
      | "center"
      | "bottom-left"
      | "bottom-right",
  ) => {
    const map: Record<string, [number, number]> = {
      "top-left": [0.2, 0.16],
      "top-right": [0.8, 0.16],
      center: [0.5, 0.5],
      "bottom-left": [0.2, 0.88],
      "bottom-right": [0.82, 0.88],
    };
    const [px, py] = map[preset];
    setXPct(px);
    setYPct(py);
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
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    ctx.save();
    ctx.font = `${italic ? "italic" : "normal"} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(canvas.width * xPct, canvas.height * yPct);
    ctx.rotate((rotation * Math.PI) / 180);
    if (strokeWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeText(text, 0, 0);
    }
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.fillText(text, 0, 0);
    ctx.restore();
    setResult(canvas.toDataURL("image/png"));
  };

  return (
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={async (files) => {
              const file = files?.[0];
              setResult("");
              setImg(file ? await loadImageFromFile(file) : null);
            }}
          />
          <ControlLabel>Watermark Text</ControlLabel>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your watermark text"
            className="h-9"
          />
          <ControlLabel>Typography</ControlLabel>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Font Family</label>
              <select
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Courier New">Courier New</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Weight</label>
              <select
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm"
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
              >
                <option value="400">Regular</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="800">Extra Bold</option>
              </select>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
            <input
              type="checkbox"
              checked={italic}
              onChange={(e) => setItalic(e.target.checked)}
              className="accent-sky-500"
            />
            <span className="text-slate-600">Italic</span>
          </label>
          <SliderControl
            label="Font Size"
            value={fontSize}
            min={16}
            max={140}
            onChange={setFontSize}
            display={`${fontSize}px`}
          />
          <SliderControl
            label="Opacity"
            value={opacity}
            min={0.1}
            max={1}
            step={0.05}
            onChange={setOpacity}
            display={`${Math.round(opacity * 100)}%`}
          />
          <SliderControl
            label="Rotation"
            value={rotation}
            min={-45}
            max={45}
            onChange={setRotation}
            display={`${rotation}°`}
          />
          <SliderControl
            label="Stroke Width"
            value={strokeWidth}
            min={0}
            max={8}
            onChange={setStrokeWidth}
            display={`${strokeWidth}px`}
          />
          <ControlLabel>Colors</ControlLabel>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Text Color</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                />
                <span className="font-mono text-xs text-slate-600">
                  {color}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">Stroke Color</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                />
                <span className="font-mono text-xs text-slate-600">
                  {strokeColor}
                </span>
              </div>
            </div>
          </div>
          <ControlLabel>Quick Position</ControlLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                "top-left",
                "center",
                "top-right",
                "bottom-left",
                "",
                "bottom-right",
              ] as const
            ).map((p, i) =>
              p ? (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => presetPosition(p)}
                >
                  {p.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Button>
              ) : (
                <div key={i} />
              ),
            )}
          </div>
          <Button onClick={run} disabled={!img} className="w-full">
            Generate Export
          </Button>
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() =>
              downloadDataUrl(
                result,
                `${stripExtension(img?.fileName || "image")}-watermarked.png`,
              )
            }
          >
            &darr; Download Watermarked Image
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to preview watermark."
          />
          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${img?.src ? "bg-sky-400" : "bg-slate-300"}`}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Live Placement
                </p>
              </div>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                Drag to reposition
              </span>
            </div>
            <div
              ref={stageRef}
              className="relative flex-1 overflow-hidden bg-size-[20px_20px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%),linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%)] bg-position-[0_0,10px_10px] cursor-crosshair"
              style={{ minHeight: "320px" }}
              onMouseDown={(e) => {
                setDragging(true);
                updatePosition(e.clientX, e.clientY);
              }}
              onMouseMove={(e) => {
                if (!dragging) return;
                updatePosition(e.clientX, e.clientY);
              }}
              onMouseUp={() => setDragging(false)}
              onMouseLeave={() => setDragging(false)}
            >
              {img?.src ? (
                <>
                  <img
                    src={img.src}
                    alt="watermark-stage"
                    className="h-full w-full object-contain"
                  />
                  <span
                    style={{
                      left: `${xPct * 100}%`,
                      top: `${yPct * 100}%`,
                      color,
                      opacity,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      fontFamily,
                      fontWeight,
                      fontSize: `${Math.max(12, Math.round((fontSize / 140) * 38))}px`,
                      fontStyle: italic ? "italic" : "normal",
                      textShadow:
                        strokeWidth > 0
                          ? `${strokeWidth}px 0 ${strokeColor}, -${strokeWidth}px 0 ${strokeColor}, 0 ${strokeWidth}px ${strokeColor}, 0 -${strokeWidth}px ${strokeColor}`
                          : "none",
                    }}
                    className="pointer-events-none absolute select-none whitespace-nowrap drop-shadow"
                  >
                    {text || "Watermark"}
                  </span>
                </>
              ) : (
                <div className="flex h-full min-h-80 items-center justify-center text-sm text-slate-400">
                  Upload an image to place watermark text.
                </div>
              )}
            </div>
          </div>
          <ImagePreviewPanel
            title="Final Watermarked Output"
            src={result}
            emptyText="Click Generate Export to produce the final watermarked image."
          />
        </>
      }
    />
  );
}

function ImageToBase64() {
  const [img, setImg] = useState<ImageState | null>(null);
  const [out, setOut] = useState("");
  const [result, setResult] = useState("");
  return (
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
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
          <ControlLabel>Base64 Output</ControlLabel>
          <Textarea
            value={out}
            onChange={(e) => {
              setOut(e.target.value);
              setResult(e.target.value);
            }}
            className="h-40 font-mono text-xs"
            placeholder="Base64 data URI will appear here after uploading"
          />
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() => downloadDataUrl(result, "image-from-base64.png")}
          >
            &darr; Download
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to encode to Base64."
            badge={img ? img.fileName : undefined}
          />
          <ImagePreviewPanel
            title="Decoded Preview"
            src={result}
            emptyText="Decoded preview will appear here."
          />
        </>
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image or Base64</ControlLabel>
          <StyledFilePicker
            label=""
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
          <ControlLabel>Base64 Input</ControlLabel>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-40 font-mono text-xs"
            placeholder="Paste a Base64 data URI or raw Base64 string here"
          />
          <Button
            onClick={() => downloadDataUrl(src, "decoded-image.png")}
            disabled={!src}
            className="w-full"
          >
            &darr; Download Decoded Image
          </Button>
        </>
      }
      previews={
        <ImagePreviewPanel
          title="Decoded Image Preview"
          src={src || undefined}
          emptyText="Upload an image or paste a Base64 string to see the decoded image."
        />
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={async (files) => {
              const file = files?.[0];
              setColors([]);
              setImg(file ? await loadImageFromFile(file) : null);
            }}
          />
          <Button onClick={run} disabled={!img} className="w-full">
            Extract Palette
          </Button>
          {colors.length > 0 && (
            <>
              <ControlLabel>Dominant Colors</ControlLabel>
              <div className="grid grid-cols-2 gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    className="group rounded-xl border border-slate-200 p-2 text-xs transition hover:border-sky-300 hover:shadow-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(c);
                      toast.success(`Copied ${c}`);
                    }}
                  >
                    <div
                      className="mb-1.5 h-10 rounded-lg shadow-inner"
                      style={{ background: c }}
                    />
                    <span className="font-mono text-slate-600 group-hover:text-sky-700">
                      {c}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                Click a swatch to copy its hex code.
              </p>
            </>
          )}
        </>
      }
      previews={
        <ImagePreviewPanel
          title="Image Preview"
          src={img?.src}
          emptyText="Upload an image to extract dominant colors."
          badge={img ? `${img.width}×${img.height}` : undefined}
        />
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
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
          {Object.keys(meta).length > 0 && (
            <>
              <ControlLabel>Metadata</ControlLabel>
              <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                {Object.entries(meta).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-2 text-xs"
                  >
                    <span className="font-semibold text-slate-500 capitalize">
                      {k}
                    </span>
                    <span className="font-mono text-slate-700 text-right break-all">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          <Button
            variant="outline"
            onClick={downloadJson}
            disabled={!imgSrc}
            className="w-full"
          >
            &darr; Download Metadata JSON
          </Button>
        </>
      }
      previews={
        <ImagePreviewPanel
          title="Image Preview"
          src={imgSrc}
          emptyText="Upload an image to inspect its metadata."
          badge={
            meta.width && meta.height
              ? `${meta.width}×${meta.height}`
              : undefined
          }
        />
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Screenshot</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={(files) => loadToCanvas(files?.[0])}
          />
          <ControlLabel>Brush</ControlLabel>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500">Color</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
                  />
                  <span className="font-mono text-xs text-slate-600">
                    {color}
                  </span>
                </div>
              </div>
            </div>
            <SliderControl
              label="Brush Size"
              value={size}
              min={1}
              max={12}
              onChange={setSize}
              display={`${size}px`}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Draw directly on the canvas below to annotate.
          </p>
          <Button variant="outline" onClick={download} className="w-full">
            &darr; Download Annotated Image
          </Button>
        </>
      }
      previews={
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Annotation Canvas
            </p>
          </div>
          <div className="p-3">
            <canvas
              ref={canvasRef}
              width={900}
              height={450}
              className="w-full rounded-lg border border-slate-100 bg-white"
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
                canvasRef.current?.getContext("2d")?.beginPath();
              }}
              onMouseLeave={() => {
                setDrawing(false);
                canvasRef.current?.getContext("2d")?.beginPath();
              }}
              style={{ cursor: "crosshair" }}
            />
          </div>
        </div>
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Images</ControlLabel>
          <StyledFilePicker
            label=""
            multiple
            onSelect={(files) => setFiles(Array.from(files ?? []))}
          />
          {files.length > 0 && (
            <p className="text-[10px] text-slate-500">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
          )}
          <ControlLabel>Rename Pattern</ControlLabel>
          <div className="space-y-1.5">
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Pattern, e.g. image-{n}"
              className="h-9"
            />
            <p className="text-[10px] text-slate-400">
              Use {"{"}n{"}"} as the sequential number placeholder.
            </p>
          </div>
          {mapped.length > 0 && (
            <>
              <ControlLabel>Rename Plan</ControlLabel>
              <div className="max-h-52 overflow-auto rounded-xl border border-slate-100 bg-slate-50">
                {mapped.map((m) => (
                  <div
                    key={m.from}
                    className="grid grid-cols-2 gap-2 border-b border-slate-100 px-3 py-1.5 text-xs last:border-0"
                  >
                    <span className="truncate text-slate-500">{m.from}</span>
                    <span className="truncate font-medium text-slate-700">
                      {m.to}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          <Button
            onClick={downloadCsv}
            disabled={!mapped.length}
            className="w-full"
          >
            &darr; Download Rename Plan (CSV)
          </Button>
        </>
      }
      previews={
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
            <span
              className={`h-2 w-2 rounded-full ${files.length ? "bg-green-400" : "bg-slate-300"}`}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Image Thumbnails
            </p>
            {files.length > 0 && (
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {files.length} files
              </span>
            )}
          </div>
          <div className="p-4">
            {files.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {files.slice(0, 12).map((f) => (
                  <div
                    key={f.name}
                    className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 transition hover:border-sky-200 hover:shadow-sm"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <p className="mt-1.5 truncate text-[10px] font-medium text-slate-500">
                      {f.name}
                    </p>
                  </div>
                ))}
                {files.length > 12 && (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                    +{files.length - 12} more
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">
                  Upload images to see thumbnails and build a rename plan.
                </p>
              </div>
            )}
          </div>
        </div>
      }
    />
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
    <ImageToolLayout
      controls={
        <>
          <ControlLabel>Image</ControlLabel>
          <StyledFilePicker
            label=""
            onSelect={async (files) => {
              const file = files?.[0];
              setResult("");
              setImg(file ? await loadImageFromFile(file) : null);
            }}
          />
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            Use only on images you own or have rights to edit.
          </p>
          <ControlLabel>Settings</ControlLabel>
          <SliderControl
            label="Logo Width Ratio"
            value={ratio}
            min={0.08}
            max={0.3}
            step={0.01}
            onChange={setRatio}
            display={`${Math.round(ratio * 100)}%`}
          />
          <SliderControl
            label="Edge Padding"
            value={padding}
            min={0}
            max={40}
            onChange={setPadding}
            display={`${padding}px`}
          />
          <Button onClick={run} disabled={!img} className="w-full">
            Generate Preview
          </Button>
          <Button
            variant="outline"
            disabled={!result}
            className="w-full"
            onClick={() =>
              downloadDataUrl(
                result,
                `${stripExtension(img?.fileName || "image")}-logo-clean.png`,
              )
            }
          >
            &darr; Download Clean Image
          </Button>
        </>
      }
      previews={
        <>
          <ImagePreviewPanel
            title="Original"
            src={img?.src}
            emptyText="Upload an image to clean logo area."
            badge={img ? `${img.width}×${img.height}` : undefined}
          />
          <ImagePreviewPanel
            title="Cleaned Preview"
            src={result}
            emptyText="Hit Generate Preview to see the result."
          />
        </>
      }
    />
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
