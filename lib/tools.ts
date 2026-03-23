export type Tool = {
  name: string;
  category: "developer" | "text" | "utility";
  description: string;
  icon: string;
  href: string;
  isPremium: boolean;
};

export const TOOLS: Tool[] = [
  // ── Free tools ────────────────────────────────────────────────
  {
    name: "JSON Formatter",
    category: "developer",
    description: "Format and validate JSON with syntax highlighting",
    icon: "{ }",
    href: "/dashboard/json-to-yaml",
    isPremium: false,
  },
  {
    name: "Base64 Encoder/Decoder",
    category: "developer",
    description: "Encode and decode Base64 strings",
    icon: "→",
    href: "/dashboard/base64-encoder",
    isPremium: false,
  },
  {
    name: "UUID Generator",
    category: "developer",
    description: "Generate random UUIDs v4",
    icon: "✓",
    href: "/dashboard/uuid-generator",
    isPremium: false,
  },
  {
    name: "URL Encoder/Decoder",
    category: "developer",
    description: "Encode and decode URLs",
    icon: "∞",
    href: "/dashboard/url-encoder",
    isPremium: false,
  },
  // ── Premium tools ─────────────────────────────────────────────
  {
    name: "JWT Decoder",
    category: "developer",
    description: "Decode and analyze JWT tokens",
    icon: "🔑",
    href: "/dashboard/jwt-decoder",
    isPremium: true,
  },
  {
    name: "Hash Generator",
    category: "developer",
    description: "Generate MD5, SHA1, SHA256, and SHA512 hashes",
    icon: "#",
    href: "/dashboard/hash-generator",
    isPremium: true,
  },
  {
    name: "SQL Formatter",
    category: "developer",
    description: "Format and beautify SQL queries",
    icon: "📝",
    href: "/dashboard/sql-formatter",
    isPremium: true,
  },
  {
    name: "Word Counter",
    category: "text",
    description: "Count words, characters, and lines",
    icon: "#",
    href: "/dashboard/word-counter",
    isPremium: false,
  },
  {
    name: "Text Case Converter",
    category: "text",
    description: "Convert between uppercase, lowercase, and title case",
    icon: "A",
    href: "/dashboard/case-converter",
    isPremium: false,
  },
  {
    name: "Regex Tester",
    category: "text",
    description: "Test and debug regular expressions",
    icon: ".*",
    href: "/dashboard/regex-tester",
    isPremium: true,
  },
  {
    name: "Markdown Previewer",
    category: "text",
    description: "Preview Markdown in real-time",
    icon: "#",
    href: "/dashboard/markdown-preview",
    isPremium: true,
  },
  {
    name: "Text Diff",
    category: "text",
    description: "Compare two texts and highlight differences",
    icon: "~",
    href: "/dashboard/text-diff",
    isPremium: true,
  },
  {
    name: "Remove Duplicate Lines",
    category: "text",
    description: "Remove duplicate lines from your text",
    icon: "⚔️",
    href: "/dashboard/remove-duplicate-lines",
    isPremium: true,
  },
  {
    name: "Color Converter",
    category: "utility",
    description: "Convert between HEX, RGB, and HSL colors",
    icon: "◯",
    href: "/dashboard/color-converter",
    isPremium: false,
  },
  {
    name: "QR Code Generator",
    category: "utility",
    description: "Generate QR codes from text and URLs",
    icon: "▦",
    href: "/dashboard/qr-code-generator",
    isPremium: true,
  },
  {
    name: "Unix Timestamp",
    category: "utility",
    description: "Convert between Unix timestamps and human-readable dates",
    icon: "⏱",
    href: "/dashboard/unix-timestamp",
    isPremium: false,
  },
  {
    name: "Password Generator",
    category: "utility",
    description: "Generate secure random passwords with custom options",
    icon: "🔐",
    href: "/dashboard/password-generator",
    isPremium: true,
  },
];

export const TOOL_CATEGORIES = ["developer", "text", "utility"] as const;

