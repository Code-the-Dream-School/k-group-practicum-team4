import { getAuthToken } from "./apiClient";

const BASE_URL = import.meta.env.VITE_API_URL as string;

if (!BASE_URL) {
  throw new Error("VITE_API_URL is not set");
}

/* Types */

export type QuizListItemDto = {
  id: string;
  title: string;
  questionCount: number;
  lastScore?: number | null;
  createdAt: string;
};

export type QuizQuestionDto = {
  id: string;
  prompt: string;
  options: string[];
};

export type QuizDetailDto = {
  id: string;
  title: string;
  questionCount?: number;
  questions: QuizQuestionDto[];
};

export type GenerateQuizResponseDto = {
  quizId: string;
};

export type QuizSubmitAnswerDto = {
  questionId: string;
  selectedIndex: number;
};

export type QuizSubmitRequestDto = {
  answers: QuizSubmitAnswerDto[];
  startedAt: string;
};

export type QuizSubmitResponseDto = {
  attemptId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  results: {
    questionId: string;
    prompt: string;
    options: string[];
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation?: string;
  }[];
};

/* Helper */

async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(
      data?.error || data?.message || `Request failed: ${res.status}`,
    );
  }

  return data as T;
}

// GET /api/quiz-sets/resource/:resourceId
export async function getResourceQuizzes(
  resourceId: string,
): Promise<QuizListItemDto[]> {
  return authFetch<QuizListItemDto[]>(
    `/api/resources/${resourceId}/quiz-sets`,
  );
}

// POST /api/quiz-sets/generate
export async function generateQuiz(
  resourceId: string,
  count: number,
): Promise<GenerateQuizResponseDto> {
  return authFetch<GenerateQuizResponseDto>(`/api/quiz-sets/generate`, {
    method: "POST",
    body: JSON.stringify({ resourceId, questionCount: count }),
  });
}

// GET /api/quiz-sets/:quizId/questions
export async function getQuiz(quizId: string): Promise<QuizDetailDto> {
  return authFetch<QuizDetailDto>(`/api/quiz-sets/${quizId}/questions`);
}

// POST /api/quiz-sets/:quizId/submit
export async function submitQuiz(
  quizId: string,
  body: QuizSubmitRequestDto,
): Promise<QuizSubmitResponseDto> {
  return authFetch<QuizSubmitResponseDto>(
    `/api/quiz-sets/${quizId}/submit`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

// DELETE /api/quiz-sets/:quizId
export async function deleteQuizSet(quizId: string): Promise<void> {
  await authFetch<void>(`/api/quiz-sets/${quizId}`, { method: "DELETE" });
}
