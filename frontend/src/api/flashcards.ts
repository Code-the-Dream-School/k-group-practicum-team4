const BASE_URL = import.meta.env.VITE_API_URL as string;

if (!BASE_URL) {
  throw new Error(
    "VITE_API_URL is not set. Create frontend/.env.local with VITE_API_URL=http://localhost:8080"
  );
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data as T;
}

/**
 * GET /api/resources/:resourceId/flashcard-sets
 */
export type FlashcardSetListItemDto = {
  id: string;
  title: string;
  sequenceNumber: number;
  createdAt: string;
  // cardsCount: number; // появится позже (шаг про контракт бэка)
};

export async function getFlashcardSetsByResource(
  resourceId: string
): Promise<FlashcardSetListItemDto[]> {
  return request<FlashcardSetListItemDto[]>(
    `/api/resources/${resourceId}/flashcard-sets`
  );
}

/**
 * GET /api/flashcard-sets
 */
export type FlashcardSetSummaryDto = {
  id: string;
  title: string;
  sequenceNumber: number;
  createdAt: string;
  resourceId: string;
  resourceTitle: string;
  cardsCount: number;
};

export async function getAllFlashcardSets(): Promise<FlashcardSetSummaryDto[]> {
  return request<FlashcardSetSummaryDto[]>(`/api/flashcard-sets`);
}

/**
 * GET /api/flashcard-sets/:setId
 */
export type FlashcardDto = {
  id: string;
  front: string;
  back: string;
  explanation?: string;
};

export type FlashcardSetDetailDto = {
  id: string;
  title: string;
  sequenceNumber: number;
  createdAt: string;
  cards: FlashcardDto[];
};

export async function getFlashcardSetById(
  setId: string
): Promise<FlashcardSetDetailDto> {
  return request<FlashcardSetDetailDto>(`/api/flashcard-sets/${setId}`);
}

/**
 * POST /api/flashcard-sets/generate
 */
export type GenerateFlashcardsBody = {
  resourceId: string;
  title?: string;
  count?: number;
};

export type GenerateFlashcardsResponseDto = {
  setId: string;
  title: string;
  sequenceNumber: number;
  cardsCount: number;
};

export async function generateFlashcards(
  body: GenerateFlashcardsBody
): Promise<GenerateFlashcardsResponseDto> {
  return request<GenerateFlashcardsResponseDto>(`/api/flashcard-sets/generate`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE /api/flashcard-sets/:setId
 */
export async function deleteFlashcardSet(setId: string): Promise<void> {
  await request<unknown>(`/api/flashcard-sets/${setId}`, { method: "DELETE" });
}
