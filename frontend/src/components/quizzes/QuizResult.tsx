import Button from "../Button";
import type { QuizSubmitResponseDto } from "../../api/quizzes";

type QuizResultProps = {
  result: QuizSubmitResponseDto;
  onBack: () => void;
};

export default function QuizResult({ result, onBack }: QuizResultProps) {
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

      {/* Score card */}
      <div className="rounded-2xl bg-[var(--color-primary)] p-10 text-white shadow-[var(--shadow-card)] flex justify-between items-center">
        <div>
          <div className="text-sm opacity-80 mb-1">Your Score :</div>
          <div className="text-6xl font-black">
            {result.scorePercent}%
          </div>
        </div>

        <div className="text-sm space-y-1 text-right">
          <div>{result.correctCount} correct</div>
          <div>{result.totalQuestions - result.correctCount} incorrect</div>
          <div className="font-semibold mt-2">
            You're on the right track!
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
  );
}
