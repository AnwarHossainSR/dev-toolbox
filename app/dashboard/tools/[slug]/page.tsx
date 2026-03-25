import { Base64Encoder } from "@/components/tools/base64-encoder";
import { CaseConverter } from "@/components/tools/case-converter";
import { ColorConverter } from "@/components/tools/color-converter";
import { FavoriteButton } from "@/components/tools/favorite-button";
import { GeneratedTools } from "@/components/tools/generated-tools";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { JwtDecoder } from "@/components/tools/jwt-decoder";
import { MarkdownPreviewer } from "@/components/tools/markdown-previewer";
import { PremiumGate } from "@/components/tools/premium-gate";
import { RegexTester } from "@/components/tools/regex-tester";
import { UnixTimestamp } from "@/components/tools/unix-timestamp";
import { UrlEncoder } from "@/components/tools/url-encoder";
import { UuidGenerator } from "@/components/tools/uuid-generator";
import { WordCounter } from "@/components/tools/word-counter";
import { getFavorites } from "@/lib/tool-actions";
import { TOOLS } from "@/lib/tools";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => toSlug(t.name) === slug);

  if (!tool) {
    notFound();
  }

  const Component = TOOL_COMPONENTS[slug];

  const favorites = await getFavorites();
  const isFavorited = favorites.includes(tool.name);
  const isImageTool = IMAGE_TOOL_SLUGS.has(slug);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
              {tool.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">
                  {tool.name}
                </h1>
                {isImageTool && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[11px] font-medium text-green-600 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Browser-side · Private
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                {tool.description}
              </p>
            </div>
          </div>
          <FavoriteButton toolName={tool.name} initialFavorited={isFavorited} />
        </div>
      </div>

      <div className="max-w-7xl">
        {tool.isPremium ? (
          <PremiumGate>
            {Component ? <Component /> : <GeneratedTools slug={slug} />}
          </PremiumGate>
        ) : Component ? (
          <Component />
        ) : (
          <GeneratedTools slug={slug} />
        )}
      </div>
    </div>
  );
}

