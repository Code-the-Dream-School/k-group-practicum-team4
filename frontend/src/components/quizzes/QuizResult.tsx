import { useEffect } from "react";
import confetti from "canvas-confetti";
import Button from "../Button";
import type { QuizSubmitResponseDto } from "../../api/quizzes";

type QuizResultProps = {
  result: QuizSubmitResponseDto;
  onBack: () => void;
};

function getEncouragement(score: number) {
  if (score >= 80) {
    return {
      emoji: "🎉",
      title: "Great job!",
      subtitle: "You're on the right track!",
    };
  }

  if (score >= 50) {
    return {
      emoji: "👍",
      title: "Nice effort!",
      subtitle: "Keep practicing and you'll improve.",
    };
  }

  return {
    emoji: "💪",
    title: "Don't give up!",
    subtitle: "Practice makes perfect.",
  };
}

export default function QuizResult({ result, onBack }: QuizResultProps) {
  const encouragement = getEncouragement(result.scorePercent);

  // Confetti once on mount
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="space-y-10">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to all quizzes sets
      </button>

      {/* CENTERED CONTENT (same width as quiz) */}
      <div className="mx-auto w-full max-w-xl space-y-10">
        {/* Score card */}
        <div className="flex items-center justify-between rounded-2xl bg-[var(--color-primary)] p-8 text-white shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-5">
            <div className="text-4xl">{encouragement.emoji}</div>

            <div>
              <div className="text-sm opacity-80 mb-1">Your Score</div>
              <div className="text-5xl font-black">
                {result.scorePercent}%
              </div>
              <div className="mt-1 text-sm">
                {encouragement.subtitle}
              </div>
            </div>
          </div>

          <div className="text-sm space-y-1 text-right">
            <div>{result.correctCount} correct</div>
            <div>{result.totalQuestions - result.correctCount} incorrect</div>
            <div className="mt-2 font-semibold">
              {encouragement.title}
            </div>
          </div>
        </div>

        {/* Questions review */}
        {result.results.map((q) => (
          <div
            key={q.questionId}
            className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] space-y-4"
          >
            <div className="font-semibold">{q.prompt}</div>

            <div className="space-y-2 text-sm">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIndex;
                const isSelected = i === q.selectedIndex;

                return (
                  <div
                    key={i}
                    className={[
                      "rounded-lg px-4 py-2 border",
                      isCorrect && "bg-green-50 border-green-400",
                      !isCorrect && isSelected && "bg-red-50 border-red-400",
                      !isCorrect && !isSelected && "border-gray-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {opt}
                  </div>
                );
              })}
            </div>

            {q.explanation && (
              <div className="rounded-xl bg-gray-50 p-4 text-sm">
                <strong>Explanation:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}

        {/* Bottom action */}
        <div className="flex justify-center pt-6">
          <Button onClick={onBack}>Back to quizzes</Button>
        </div>
      </div>
    </div>
  );
}
