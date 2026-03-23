import { notFound } from 'next/navigation';
import { TOOLS } from '@/lib/tools';
import { getFavorites } from '@/lib/tool-actions';
import { FavoriteButton } from '@/components/tools/favorite-button';
import { JsonFormatter } from '@/components/tools/json-formatter';
import { Base64Encoder } from '@/components/tools/base64-encoder';
import { UuidGenerator } from '@/components/tools/uuid-generator';
import { UrlEncoder } from '@/components/tools/url-encoder';
import { JwtDecoder } from '@/components/tools/jwt-decoder';
import { WordCounter } from '@/components/tools/word-counter';
import { CaseConverter } from '@/components/tools/case-converter';
import { RegexTester } from '@/components/tools/regex-tester';
import { ColorConverter } from '@/components/tools/color-converter';
import { MarkdownPreviewer } from '@/components/tools/markdown-previewer';
import { UnixTimestamp } from '@/components/tools/unix-timestamp';

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'json-formatter': JsonFormatter,
  'base64-encoder-decoder': Base64Encoder,
  'uuid-generator': UuidGenerator,
  'url-encoder-decoder': UrlEncoder,
  'jwt-decoder': JwtDecoder,
  'word-counter': WordCounter,
  'text-case-converter': CaseConverter,
  'regex-tester': RegexTester,
  'color-converter': ColorConverter,
  'markdown-previewer': MarkdownPreviewer,
  'unix-timestamp': UnixTimestamp,
};

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = TOOLS.find(
    (t) => t.name.toLowerCase().replace(/\s+/g, '-') === params.slug
  );

  if (!tool) {
    notFound();
  }

  const Component = TOOL_COMPONENTS[params.slug];

  if (!Component) {
    notFound();
  }

  const favorites = await getFavorites();
  const isFavorited = favorites.includes(tool.name);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{tool.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{tool.name}</h1>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>
          </div>
          <FavoriteButton toolName={tool.name} initialFavorited={isFavorited} />
        </div>
      </div>

      <div className="max-w-6xl">
        <Component />
      </div>
    </div>
  );
}
