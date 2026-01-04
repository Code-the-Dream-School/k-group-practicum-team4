import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tabs from "../components/Tabs";
import ResourceFlashcardsTab from "../components/ResourceFlashcardsTab";
import { getResourceById, type ResourceDto } from "../api/apiClient";

type TabKey = "resource" | "summary" | "flashcards" | "quizzes";

function ResourcePage() {
  const { id } = useParams();
  const resourceId = id ?? "";

  const [activeTab, setActiveTab] = useState<TabKey>("flashcards");
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
            <div className="text-sm text-gray-500">Back to My Library</div>
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
          ) : activeTab === "flashcards" && resource ? (
            <ResourceFlashcardsTab resourceId={resource._id} />
          ) : (
            <div className="text-sm text-gray-500">Not implemented yet.</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResourcePage;
