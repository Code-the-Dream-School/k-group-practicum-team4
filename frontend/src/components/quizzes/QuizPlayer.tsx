import { useEffect, useMemo, useState } from "react";
import Button from "../Button";
import {
  getQuiz,
  submitQuiz,
  type QuizDetailDto,
  type QuizSubmitResponseDto,
} from "../../api/quizzes";

type QuizPlayerProps = {
  quizId: string;
  onBack: () => void;
  onFinish: (result: QuizSubmitResponseDto) => void;
};

export default function QuizPlayer({
  quizId,
  onBack,
  onFinish,
}: QuizPlayerProps) {
  const [quiz, setQuiz] = useState<QuizDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [startedAt] = useState(() => new Date().toISOString());

  // ───────── Load quiz ─────────
  useEffect(() => {
    let cancelled = false;

    async function loadQuiz() {
      setIsLoading(true);
      const data = await getQuiz(quizId);
      if (!cancelled) {
        setQuiz(data);
        setIsLoading(false);
      }
    }

    loadQuiz();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const questions = quiz?.questions ?? [];
  const total = questions.length;

  const safeIndex = useMemo(() => {
    if (total === 0) return 0;
    return Math.min(currentIndex, total - 1);
  }, [currentIndex, total]);

  const question = questions[safeIndex];

  const isAllAnswered = Object.keys(answers).length === total;
  const isLastQuestion = safeIndex === total - 1;

  // ───────── Submit ─────────
  async function handleSubmit() {
    setSubmitAttempted(true);

    if (!quiz || !isAllAnswered) {
      return;
    }

    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }),
    );

    const result = await submitQuiz(quiz.id, {
      startedAt,
      answers: formattedAnswers,
    });

    onFinish(result);
  }

  if (isLoading || !quiz) {
    return <div className="py-20 text-sm text-gray-500">Loading quiz…</div>;
  }

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to quizzes
      </button>

      <div className="flex flex-col items-center gap-6">
        {/* Progress */}
        <div className="w-full max-w-xl">
          <div className="mb-2 text-center text-sm text-gray-500">
            Question {safeIndex + 1} of {total}
          </div>

          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-[var(--color-primary)]"
              style={{ width: `${((safeIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-xl h-[480px] rounded-2xl bg-white p-8 shadow-[var(--shadow-card)] flex flex-col">
          <h2 className="mb-4 text-lg font-semibold shrink-0">
            {question.prompt}
          </h2>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {question.options.map((opt, i) => (
              <label
                key={i}
                onClick={() =>
                  setAnswers((s) => ({ ...s, [question.id]: i }))
                }
                className="flex cursor-pointer items-start gap-4 rounded-xl px-4 py-3 transition hover:bg-gray-50"
              >
                <div
                  className={[
                    "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    answers[question.id] === i
                      ? "border-[var(--color-primary)]"
                      : "border-gray-300",
                  ].join(" ")}
                >
                  {answers[question.id] === i && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)]" />
                  )}
                </div>

                <span className="text-sm leading-snug">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={safeIndex === 0}
              className="h-10 w-10 rounded-full bg-white shadow disabled:opacity-50"
            >
              ‹
            </button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
              </Button>
            )}
          </div>

          {/* Error message — ONLY after submit attempt */}
          {isLastQuestion && submitAttempted && !isAllAnswered && (
            <div className="text-sm text-gray-500">
              Please answer all questions before submitting the quiz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
