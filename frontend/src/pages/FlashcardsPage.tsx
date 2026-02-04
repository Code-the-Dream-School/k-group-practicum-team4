import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import {
  getAllFlashcardSets,
  getFlashcardSetById,
  type FlashcardSetDetailDto,
  type FlashcardSetSummaryDto,
} from "../api/flashcards";
import FlashcardPlayer from "../components/flashcards/FlashcardPlayer";
import AppHeader from "../components/AppHeader";
import TopNav from "../components/TopNav";

type CountsBySetId = Record<string, number>;

function FlashcardsPage() {
  const [sets, setSets] = useState<FlashcardSetSummaryDto[]>([]);
  const [countsBySetId, setCountsBySetId] = useState<CountsBySetId>({});
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSetDetailDto | null>(null);
  const [isLoadingSet, setIsLoadingSet] = useState(false);
  const [setError, setSetError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSets() {
      try {
        setIsLoading(true);
        setListError(null);
        const data = await getAllFlashcardSets();
        if (cancelled) return;
        setSets(data);
        setCountsBySetId(
          data.reduce<CountsBySetId>((acc, item) => {
            acc[item.id] = item.cardsCount;
            return acc;
          }, {})
        );
      } catch (err) {
        if (cancelled) return;
        setListError(err instanceof Error ? err.message : "Unable to load flashcards.");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    loadSets();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedSet(setId: string) {
      try {
        setIsLoadingSet(true);
        setSetError(null);
        const data = await getFlashcardSetById(setId);
        if (cancelled) return;
        setSelectedSet(data);
      } catch (err) {
        if (cancelled) return;
        setSelectedSet(null);
        setSelectedSetId(null);
        setSetError(err instanceof Error ? err.message : "Unable to load flashcards.");
      } finally {
        if (cancelled) return;
        setIsLoadingSet(false);
      }
    }

    if (!selectedSetId) return;
    loadSelectedSet(selectedSetId);

    return () => {
      cancelled = true;
    };
  }, [selectedSetId]);

  const hasSets = useMemo(() => sets.length > 0, [sets.length]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <AppHeader />
      <TopNav />

      <main className="px-6 pb-14 pt-10">
        <div className="mx-auto max-w-6xl">
          {selectedSetId ? (
            isLoadingSet ? (
              <div className="text-sm text-gray-500">Loading flashcards...</div>
            ) : setError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {setError}
              </div>
            ) : selectedSet ? (
              <FlashcardPlayer
                set={selectedSet}
                onBack={() => {
                  setSelectedSetId(null);
                  setSelectedSet(null);
                }}
              />
            ) : null
          ) : (
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Star className="h-6 w-6 text-[var(--color-primary-strong)]" />
                <h1 className="text-3xl font-black">All Flashcards</h1>
              </div>

              {listError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {listError}
                </div>
              ) : isLoading ? (
                <div className="text-sm text-gray-500">Loading flashcards...</div>
              ) : !hasSets ? (
                <div className="rounded-2xl border border-white/50 bg-white/60 px-5 py-6 text-sm text-gray-600 shadow-[var(--shadow-card)]">
                  No flashcard sets yet. Generate a set from any resource.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sets.map((set) => (
                    <button
                      key={set.id}
                      type="button"
                      onClick={() => setSelectedSetId(set.id)}
                      className="rounded-2xl border border-white/50 bg-white/90 p-6 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {set.resourceTitle}
                      </div>
                      <div className="mt-3 text-lg font-bold text-[var(--color-primary-strong)]">
                        {set.title}
                      </div>
                      <div className="mt-4 inline-flex rounded-full bg-[var(--color-primary-muted)] px-4 py-1 text-xs font-semibold text-[var(--color-primary)]">
                        {countsBySetId[set.id] ?? 0} Flashcards
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default FlashcardsPage;
