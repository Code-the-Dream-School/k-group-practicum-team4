import { useState } from "react";
import Button from "./Button";
import type { ResourceDto } from "../api/apiClient";
import { generateResourceSummary } from "../api/apiClient";

type Props = {
  resource: ResourceDto;
  onReloadResource: () => Promise<void>;
};

export default function ResourceSummaryTab({ resource, onReloadResource }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSummary = Boolean(resource.summary?.content);

  async function handleGenerate() {
    if (isGenerating) return;
    if (!resource?._id) {
      setError("Missing resource id.");
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);

      await generateResourceSummary(resource._id);
      await onReloadResource();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate summary.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}


      {!hasSummary ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] shadow-[var(--shadow-card)]">
            ✨
          </div>

          <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating…" : "Generate Summary"}
          </Button>
        </div>
      ) : (
        <article className="rounded-3xl bg-white/70 p-8 shadow-[var(--shadow-card)] h-[calc(100vh-24rem)]">
          <div className="h-full overflow-y-auto pr-2">
            <div className="prose prose-stone max-w-none whitespace-pre-wrap">
              {resource.summary?.content}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
