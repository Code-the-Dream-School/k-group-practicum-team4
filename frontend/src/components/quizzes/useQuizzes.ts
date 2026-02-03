import { useEffect, useState } from "react";
import {
  getResourceQuizzes,
  generateQuiz,
  deleteQuizSet,
  type QuizListItemDto,
} from "../../api/quizzes";

export function useQuizzes(resourceId: string) {
  const [quizzes, setQuizzes] = useState<QuizListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // load quizzes 
  useEffect(() => {
    if (!resourceId) return;

    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getResourceQuizzes(resourceId);
        if (cancelled) return;

        setQuizzes(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load quizzes");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [resourceId]);

  // generate quiz
  async function generate(count: number) {
    if (!resourceId) return;

    try {
      setIsGenerating(true);

      await generateQuiz(resourceId, count);

      const fresh = await getResourceQuizzes(resourceId);
      setQuizzes(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  }

  // delete quiz
  async function remove(quizId: string) {
    try {
      setDeletingId(quizId);

      await deleteQuizSet(quizId);

      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete quiz");
    } finally {
      setDeletingId(null);
    }
  }

  return {
    quizzes,
    isLoading,
    isGenerating,
    deletingId,
    error,
    generate,
    remove,
  };
}
