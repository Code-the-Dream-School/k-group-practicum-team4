import { useEffect, useMemo, useState } from "react";
import {
  getFlashcardSetById,
  getFlashcardSetsByResource,
  type FlashcardSetListItemDto,
} from "../../api/flashcards";

type UseFlashcardSetsResult = {
  sets: FlashcardSetListItemDto[];
  countsBySetId: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export function useFlashcardSets(resourceId: string): UseFlashcardSetsResult {
  const [sets, setSets] = useState<FlashcardSetListItemDto[]>([]);
  const [countsBySetId, setCountsBySetId] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canLoad = useMemo(() => Boolean(resourceId), [resourceId]);

  async function load() {
    if (!canLoad) {
      setSets([]);
      setCountsBySetId({});
      setIsLoading(false);
      setError("Missing resourceId.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const list = await getFlashcardSetsByResource(resourceId);
    setSets(list);
    setCountsBySetId({});

    // Temporary: derive counts from set details until list endpoint returns cardsCount.
    // This keeps UI correct and consistent with mocks.
    void (async () => {
      for (const item of list) {
        try {
          const detail = await getFlashcardSetById(item.id);
          setCountsBySetId((prev) => ({ ...prev, [item.id]: detail.cards.length }));
        } catch {
          // Ignore per-item failures; list UI still works.
        }
      }
    })();

    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await load();
      } catch (e) {
        if (cancelled) return;
        setSets([]);
        setCountsBySetId({});
        setError(e instanceof Error ? e.message : "Unknown error");
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId]);

  return {
    sets,
    countsBySetId,
    isLoading,
    error,
    reload: load,
  };
}
