import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Tabs from "../components/Tabs";
import ResourceFlashcardsTab from "../components/ResourceFlashcardsTab";
import { getResourceById, type ResourceDto } from "../api/apiClient";

type TabKey = "resource" | "summary" | "flashcards" | "quizzes";

function ResourcePage() {
  const { id } = useParams();
  const resourceId = id ?? "";

  const [activeTab, setActiveTab] = useState<TabKey>("resource");
  const [resource, setResource] = useState<ResourceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        if (!resourceId) throw new Error("Missing resource id in URL.");

        const data = await getResourceById(resourceId);
        if (cancelled) return;

        setResource(data);
      } catch (e) {
        if (cancelled) return;
        setResource(null);
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  const pageTitle = resource?.title ?? (isLoading ? "Loading…" : "Resource");

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <main className="px-4">
        <div className="mx-auto max-w-6xl py-10">
          {/* Header like in mock (always shown) */}
          <div className="mb-10 flex items-baseline gap-6">
            <h1 className="text-5xl font-black tracking-tight">{pageTitle}</h1>
            <Link
              to="/library"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-muted)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Library
            </Link>
          </div>

          {/* Tabs (always shown) */}
          <div className="mb-14">
            <Tabs
              tabs={["resource", "summary", "flashcards", "quizzes"]}
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab as TabKey)}
              labelMap={{
                resource: "Resource",
                summary: "Summary",
                flashcards: "Flashcards",
                quizzes: "Quizzes",
              }}
            />
          </div>

          {/* Content */}
          {error ? (
            <div className="text-sm text-gray-500">
              Couldn’t load resource: {error}
            </div>
          ) : isLoading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : activeTab === "resource" && resource ? (
            <article className="max-w-3xl rounded-2xl border border-white/60 bg-white/90 p-6 text-base leading-7 text-slate-700 shadow-[var(--shadow-card)]">
              <div className="whitespace-pre-wrap">{resource.textContent}</div>
            </article>
          ) : activeTab === "flashcards" && resource ? (
            <ResourceFlashcardsTab resourceId={resource._id} resourceTitle={resource.title} />
          ) : (
            <div className="text-sm text-gray-500">Not implemented yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResourcePage;
