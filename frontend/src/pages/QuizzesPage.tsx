import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import TopNav from "../components/TopNav";
import QuizPlayer from "../components/quizzes/QuizPlayer";
import QuizResult from "../components/quizzes/QuizResult";
import QuizSetCard from "../components/quizzes/QuizSetCard";
import ConfirmDeleteQuizModal from "../components/quizzes/ConfirmDeleteQuizModal";
import Button from "../components/Button";
import {
  deleteQuizSet,
  getAllQuizSets,
  type QuizListItemWithResourceDto,
  type QuizSubmitResponseDto,
} from "../api/quizzes";

type ConfirmState = {
  isOpen: boolean;
  quizId: string | null;
};

export default function QuizzesPage() {
  const navigate = useNavigate();
  const params = useParams();
  const routeQuizId = (params as { id?: string; quizId?: string }).id ?? null;

  const [quizzes, setQuizzes] = useState<QuizListItemWithResourceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(routeQuizId);
  const [quizResult, setQuizResult] =
    useState<QuizSubmitResponseDto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    quizId: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadQuizzes() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllQuizSets();
        if (cancelled) return;
        setQuizzes(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load quizzes.");
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    }

    loadQuizzes();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (routeQuizId) {
      setSelectedQuizId(routeQuizId);
    }
  }, [routeQuizId]);

  const isModalBusy = useMemo(() => {
    if (!confirm.isOpen || !confirm.quizId) return false;
    return deletingId === confirm.quizId;
  }, [confirm.isOpen, confirm.quizId, deletingId]);

  const openQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    navigate(`/quiz/${quizId}`);
  };

  const handleBackToList = () => {
    setSelectedQuizId(null);
    setQuizResult(null);
    navigate("/quizzes");
  };

  const openConfirm = (quizId: string) => {
    setConfirm({ isOpen: true, quizId });
  };

  const closeConfirm = () => {
    if (isModalBusy) return;
    setConfirm({ isOpen: false, quizId: null });
  };

  const confirmDelete = async () => {
    if (!confirm.quizId) return;
    try {
      setDeletingId(confirm.quizId);
      await deleteQuizSet(confirm.quizId);
      setQuizzes((prev) => prev.filter((quiz) => quiz.id !== confirm.quizId));
      if (selectedQuizId === confirm.quizId) {
        handleBackToList();
      }
    } finally {
      setDeletingId(null);
      setConfirm({ isOpen: false, quizId: null });
    }
  };

  if (quizResult) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <AppHeader />
        <TopNav />
        <main className="px-6 pb-14 pt-10">
          <div className="mx-auto max-w-6xl">
            <QuizResult result={quizResult} onBack={handleBackToList} />
          </div>
        </main>
      </div>
    );
  }

  if (selectedQuizId) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <AppHeader />
        <TopNav />
        <main className="px-6 pb-14 pt-10">
          <div className="mx-auto max-w-6xl">
            <QuizPlayer
              quizId={selectedQuizId}
              onBack={handleBackToList}
              onFinish={(result) => setQuizResult(result)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <AppHeader />
      <TopNav />
      <main className="px-6 pb-14 pt-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-black">All Quizzes</h1>
            <Button type="button" onClick={() => navigate("/library")}>
              Go to Study Room
            </Button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : isLoading ? (
            <div className="text-sm text-gray-500">Loading quizzes…</div>
          ) : quizzes.length === 0 ? (
            <div className="rounded-2xl border border-white/50 bg-white/60 px-5 py-6 text-sm text-gray-600 shadow-[var(--shadow-card)]">
              No quizzes yet. Generate a quiz from any resource in the Study
              Room.
            </div>
          ) : (
            <>
              <ConfirmDeleteQuizModal
                isOpen={confirm.isOpen}
                isBusy={isModalBusy}
                onConfirm={confirmDelete}
                onClose={closeConfirm}
              />

              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                  <QuizSetCard
                    key={quiz.id}
                    title={quiz.title}
                    resourceTitle={quiz.resourceTitle}
                    createdAt={quiz.createdAt}
                    countLabel={`${quiz.questionCount} questions`}
                    lastScore={quiz.lastScore ?? null}
                    isDeleting={deletingId === quiz.id}
                    onOpen={() => openQuiz(quiz.id)}
                    onDelete={() => openConfirm(quiz.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
