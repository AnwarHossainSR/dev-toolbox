import {
  Base64Encoder,
  CaseConverter,
  ColorConverter,
  FavoriteButton,
  GeneratedTools,
  JsonFormatter,
  JwtDecoder,
  MarkdownPreviewer,
  PremiumGate,
  RegexTester,
  UnixTimestamp,
  UrlEncoder,
  UuidGenerator,
  WordCounter,
} from "@/components";
import { getFavorites } from "@/lib/tool-actions";
import { TOOLS } from "@/lib/tools";
import { notFound } from "next/navigation";

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "json-formatter": JsonFormatter,
  "base64-encoder-decoder": Base64Encoder,
  "uuid-generator": UuidGenerator,
  "url-encoder-decoder": UrlEncoder,
  "jwt-decoder": JwtDecoder,
  "word-counter": WordCounter,
  "text-case-converter": CaseConverter,
  "regex-tester": RegexTester,
  "color-converter": ColorConverter,
  "markdown-previewer": MarkdownPreviewer,
  "unix-timestamp": UnixTimestamp,
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: toSlug(tool.name),
  }));
}

export default async function ToolPage({
  params,
}: {
  params: { slug: string };
}) {
  const tool = TOOLS.find((t) => toSlug(t.name) === params.slug);

  if (!tool) {
    notFound();
  }

  const Component = TOOL_COMPONENTS[params.slug];

  const favorites = await getFavorites();
  const isFavorited = favorites.includes(tool.name);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{tool.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {tool.name}
              </h1>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>
          </div>
          <FavoriteButton toolName={tool.name} initialFavorited={isFavorited} />
        </div>
      </div>

      <div className="max-w-6xl">
        <PremiumGate>
          {Component ? <Component /> : <GeneratedTools slug={params.slug} />}
        </PremiumGate>
      </div>
    </div>
  );
}

