export type Tool = {
  name: string;
  category: "developer" | "text" | "utility";
  description: string;
  icon: string;
};

export const TOOLS: Tool[] = [
  {
    name: "JSON Formatter",
    category: "developer",
    description: "Format and validate JSON with syntax highlighting",
    icon: "{ }",
  },
  {
    name: "Base64 Encoder/Decoder",
    category: "developer",
    description: "Encode and decode Base64 strings",
    icon: "→",
  },
  {
    name: "UUID Generator",
    category: "developer",
    description: "Generate random UUIDs v4",
    icon: "✓",
  },
  {
    name: "URL Encoder/Decoder",
    category: "developer",
    description: "Encode and decode URLs",
    icon: "∞",
  },
  {
    name: "JWT Decoder",
    category: "developer",
    description: "Decode and analyze JWT tokens",
    icon: "🔑",
  },
  {
    name: "Word Counter",
    category: "text",
    description: "Count words, characters, and lines",
    icon: "#",
  },
  {
    name: "Text Case Converter",
    category: "text",
    description: "Convert between uppercase, lowercase, and title case",
    icon: "A",
  },
  {
    name: "Regex Tester",
    category: "text",
    description: "Test and debug regular expressions",
    icon: ".*",
  },
  {
    name: "Markdown Previewer",
    category: "text",
    description: "Preview Markdown in real-time",
    icon: "#",
  },
  {
    name: "Color Converter",
    category: "utility",
    description: "Convert between HEX, RGB, and HSL colors",
    icon: "◯",
  },
  {
    name: "Unix Timestamp",
    category: "utility",
    description: "Convert between Unix timestamps and human-readable dates",
    icon: "⏱",
  },
  {
    name: "SQL Formatter",
    category: "developer",
    description: "Format and beautify SQL queries",
    icon: "📝",
  },
  {
    name: "Password Generator",
    category: "utility",
    description: "Generate secure random passwords with custom options",
    icon: "🔐",
  },
  {
    name: "Remove Duplicate Lines",
    category: "text",
    description: "Remove duplicate lines from your text",
    icon: "⚔️",
  },
];

export const TOOL_CATEGORIES = ["developer", "text", "utility"] as const;

