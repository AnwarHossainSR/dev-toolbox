export type Tool = {
  name: string;
  category: "developer" | "text" | "utility";
  description: string;
  icon: string;
  href: string;
};

export const TOOLS: Tool[] = [
  {
    name: "JSON Formatter",
    category: "developer",
    description: "Format and validate JSON with syntax highlighting",
    icon: "{ }",
    href: "/dashboard/json-to-yaml",
  },
  {
    name: "Base64 Encoder/Decoder",
    category: "developer",
    description: "Encode and decode Base64 strings",
    icon: "→",
    href: "/dashboard/base64-encoder",
  },
  {
    name: "UUID Generator",
    category: "developer",
    description: "Generate random UUIDs v4",
    icon: "✓",
    href: "/dashboard/uuid-generator",
  },
  {
    name: "URL Encoder/Decoder",
    category: "developer",
    description: "Encode and decode URLs",
    icon: "∞",
    href: "/dashboard/url-encoder",
  },
  {
    name: "JWT Decoder",
    category: "developer",
    description: "Decode and analyze JWT tokens",
    icon: "🔑",
    href: "/dashboard/jwt-decoder",
  },
  {
    name: "Hash Generator",
    category: "developer",
    description: "Generate MD5, SHA1, SHA256, and SHA512 hashes",
    icon: "#",
    href: "/dashboard/hash-generator",
  },
  {
    name: "SQL Formatter",
    category: "developer",
    description: "Format and beautify SQL queries",
    icon: "📝",
    href: "/dashboard/sql-formatter",
  },
  {
    name: "Word Counter",
    category: "text",
    description: "Count words, characters, and lines",
    icon: "#",
    href: "/dashboard/tools/word-counter",
  },
  {
    name: "Text Case Converter",
    category: "text",
    description: "Convert between uppercase, lowercase, and title case",
    icon: "A",
    href: "/dashboard/case-converter",
  },
  {
    name: "Regex Tester",
    category: "text",
    description: "Test and debug regular expressions",
    icon: ".*",
    href: "/dashboard/regex-tester",
  },
  {
    name: "Markdown Previewer",
    category: "text",
    description: "Preview Markdown in real-time",
    icon: "#",
    href: "/dashboard/markdown-preview",
  },
  {
    name: "Text Diff",
    category: "text",
    description: "Compare two texts and highlight differences",
    icon: "~",
    href: "/dashboard/text-diff",
  },
  {
    name: "Remove Duplicate Lines",
    category: "text",
    description: "Remove duplicate lines from your text",
    icon: "⚔️",
    href: "/dashboard/remove-duplicate-lines",
  },
  {
    name: "Color Converter",
    category: "utility",
    description: "Convert between HEX, RGB, and HSL colors",
    icon: "◯",
    href: "/dashboard/color-converter",
  },
  {
    name: "QR Code Generator",
    category: "utility",
    description: "Generate QR codes from text and URLs",
    icon: "▦",
    href: "/dashboard/qr-code-generator",
  },
  {
    name: "Unix Timestamp",
    category: "utility",
    description: "Convert between Unix timestamps and human-readable dates",
    icon: "⏱",
    href: "/dashboard/tools/unix-timestamp",
  },
  {
    name: "Password Generator",
    category: "utility",
    description: "Generate secure random passwords with custom options",
    icon: "🔐",
    href: "/dashboard/password-generator",
  },
];

export const TOOL_CATEGORIES = ["developer", "text", "utility"] as const;

