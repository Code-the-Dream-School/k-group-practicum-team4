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


  const [startedAt] = useState(() => new Date().toISOString());

  // load quiz 
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

  // submit
  async function handleSubmit() {
    if (!quiz) return;

    setIsSubmitting(true);

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      })
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

        <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-[var(--shadow-card)]">
          <h2 className="mb-6 text-lg font-semibold">
            {question.prompt}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt, i) => (
              <label
                key={i}
                className="flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50"
              >
                <span
                  className={[
                    "h-4 w-4 rounded-full border flex items-center justify-center",
                    answers[question.id] === i
                      ? "border-[var(--color-primary)]"
                      : "border-gray-300",
                  ].join(" ")}
                >
                  {answers[question.id] === i && (
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  )}
                </span>

                <input
                  type="radio"
                  className="hidden"
                  checked={answers[question.id] === i}
                  onChange={() =>
                    setAnswers((s) => ({ ...s, [question.id]: i }))
                  }
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={safeIndex === 0}
            className="h-10 w-10 rounded-full bg-white border shadow disabled:opacity-50"
          >
            ‹
          </button>

          {safeIndex === total - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          ) : (
            <Button onClick={() => setCurrentIndex((i) => i + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
