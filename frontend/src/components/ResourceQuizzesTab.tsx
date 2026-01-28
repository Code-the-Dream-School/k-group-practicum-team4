import { useState } from "react";
import { useParams } from "react-router-dom";

import { useQuizzes } from "./quizzes/useQuizzes";
import QuizSetCard from "./quizzes/QuizSetCard";
import QuizzesEmptyState from "./quizzes/QuizzesEmptyState";
import GenerateQuizModal from "./quizzes/GenerateQuizModal";
import QuizPlayer from "./quizzes/QuizPlayer";
import QuizResult from "./quizzes/QuizResult";
import Button from "./Button";

import type { QuizSubmitResponseDto } from "../api/quizzes";

export default function ResourceQuizzesTab() {
  const { id: resourceId } = useParams<{ id: string }>();

  const {
    quizzes,
    isLoading,
    isGenerating,
    generate,
  } = useQuizzes(resourceId!);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [quizResult, setQuizResult] =
    useState<QuizSubmitResponseDto | null>(null);

  // RESULT 
  if (quizResult && selectedQuizId) {
    return (
      <QuizResult
        result={quizResult}
        onBack={() => {
          setQuizResult(null);
          setSelectedQuizId(null);
        }}
      />
    );
  }

  // PLAYER
  if (selectedQuizId) {
    return (
      <QuizPlayer
        quizId={selectedQuizId}
        onBack={() => setSelectedQuizId(null)}
        onFinish={(result) => {
          setQuizResult(result);
        }}
      />
    );
  }

  if (isLoading) {
    return <div className="py-20 text-sm text-gray-500">Loading quizzes…</div>;
  }

  // EMPTY STATE
  if (quizzes.length === 0) {
    return (
      <>
        <GenerateQuizModal
          isOpen={isGenerateOpen}
          isGenerating={isGenerating}
          onGenerate={(count) => {
            generate(count);
            setIsGenerateOpen(false);
          }}
          onClose={() => setIsGenerateOpen(false)}
        />

        <QuizzesEmptyState
          onGenerate={() => setIsGenerateOpen(true)}
          isGenerating={isGenerating}
        />
      </>
    );
  }

  // LIST STATE 
  return (
    <>
      <GenerateQuizModal
        isOpen={isGenerateOpen}
        isGenerating={isGenerating}
        onGenerate={(count) => {
          generate(count);
          setIsGenerateOpen(false);
        }}
        onClose={() => setIsGenerateOpen(false)}
      />

      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-black">My Quizzes</h2>

          <Button
            type="button"
            onClick={() => setIsGenerateOpen(true)}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating…" : "Generate Quiz"}
          </Button>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizSetCard
              key={quiz.id}
              title={quiz.title}
              createdAt={quiz.createdAt}
              countLabel={`${quiz.questionCount} questions`}
              isDeleting={false}
              onOpen={() => setSelectedQuizId(quiz.id)}
              onDelete={() => {}}
            />
          ))}
        </div>
      </div>
    </>
  );
}
