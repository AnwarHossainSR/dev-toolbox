import { Copy, Key, Plus } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Key className="h-6 w-6 text-amber-400" />
          API Keys
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API keys for programmatic access to Dev Toolbox
        </p>
      </div>

      {/* Coming soon notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 mb-6">
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
          Coming soon
        </p>
        <p className="text-sm text-muted-foreground">
          API access is under development. You&apos;ll be able to call Dev
          Toolbox tools programmatically via a REST API — useful for CI/CD
          pipelines, scripts, and integrations.
        </p>
      </div>

      {/* Preview UI */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Your keys</h2>
          <button
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground cursor-not-allowed opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            New key
          </button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <Key className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            No API keys yet
          </p>
          <p className="text-xs text-muted-foreground">
            Keys you create will appear here
          </p>
        </div>
      </section>

      {/* Docs preview */}
      <section className="rounded-xl border border-border bg-card p-5 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Usage example
        </h2>
        <div className="rounded-lg bg-muted/60 p-4 font-mono text-xs text-muted-foreground space-y-1 relative">
          <div>
            <span className="text-amber-500">POST</span>{" "}
            /api/tools/json-formatter
          </div>
          <div>
            <span className="text-muted-foreground/60">Authorization:</span>{" "}
            Bearer dtb_••••••••••••
          </div>
          <div className="pt-1">
            {`{ "input": "{ \\"key\\": \\"value\\" }" }`}
          </div>
          <button
            disabled
            className="absolute top-3 right-3 p-1 rounded text-muted-foreground/60 cursor-not-allowed"
            aria-label="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}
