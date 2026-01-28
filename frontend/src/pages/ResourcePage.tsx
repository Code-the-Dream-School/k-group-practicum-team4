import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Tabs from "../components/Tabs";
import ResourceFlashcardsTab from "../components/ResourceFlashcardsTab";
import ResourceQuizzesTab from "../components/ResourceQuizzesTab";
import ResourceSummaryTab from "../components/ResourceSummaryTab";
import { getResourceById, type ResourceDto } from "../api/apiClient";

type TabKey = "resource" | "summary" | "flashcards" | "quizzes";

function ResourcePage() {
  const { id } = useParams();
  const resourceId = id ?? "";

  const [activeTab, setActiveTab] = useState<TabKey>("resource");
  const [resource, setResource] = useState<ResourceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reloadResource() {
    if (!resourceId) return;
    const data = await getResourceById(resourceId);
    setResource(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        if (!resourceId) {
          throw new Error("Missing resource id in URL.");
        }

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
          {/* Header */}
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

          {/* Tabs */}
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
            <article className="rounded-3xl bg-white/70 p-8 shadow-[var(--shadow-card)] h-[calc(100vh-24rem)]">
              <div className="h-full overflow-y-auto pr-2">
                <div className="prose prose-stone max-w-none whitespace-pre-wrap">
                  {resource.textContent}
                </div>
              </div>
            </article>
          ) : activeTab === "summary" && resource ? (
            <ResourceSummaryTab
              resource={resource}
              onReloadResource={reloadResource}
            />
          ) : activeTab === "flashcards" && resource ? (
            <ResourceFlashcardsTab
              resourceId={resource._id}
              resourceTitle={resource.title}
            />
          ) : activeTab === "quizzes" && resource ? (
            <ResourceQuizzesTab />
          ) : (
            <div className="text-sm text-gray-500">Not implemented yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResourcePage;
