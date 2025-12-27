// backend/src/services/flashcardsGenerator.ts
import { generateText } from '../ai/llm';

export type GeneratedFlashcard = {
  front: string;
  back: string;
  explanation: string; // REQUIRED
};

const stubCards = (count: number): GeneratedFlashcard[] =>
  Array.from({ length: count }).map((_, i) => ({
    front: `Question ${i + 1}`,
    back: `Answer ${i + 1}`,
    explanation: 'Short explanation (stub).',
  }));

const extractJsonObject = (raw: string): string => {
  const trimmed = (raw || '').trim();

  // Remove ```json fences if model still returns them
  const noFences = trimmed
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  const start = noFences.indexOf('{');
  const end = noFences.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in LLM response');
  }

  return noFences.slice(start, end + 1);
};

export const generateFlashcardsFromText = async (params: {
  text: string;
  count: number;
}): Promise<GeneratedFlashcard[]> => {
  const mode = (process.env.LLM_MODE || 'stub').toLowerCase();
  const text = (params.text || '').trim();
  const count = Math.max(1, Math.min(30, Math.floor(params.count)));

  // If no text or stub mode — return stub cards (still valid for FE testing)
  if (!text || mode === 'stub') {
    return stubCards(count);
  }

  const prompt = `
You are generating study flashcards.

Return ONLY valid JSON (no markdown, no extra text).
Schema:
{
  "cards": [
    { "front": "question", "back": "answer", "explanation": "REQUIRED short explanation" }
  ]
}

Rules:
- Make exactly ${count} cards.
- Use the provided text as the only source.
- Keep fronts concise (one question).
- Keep backs concise (one direct answer).
- explanation is REQUIRED and must be 1-2 sentences max.

Text:
"""${text}"""
`.trim();

  try {
    const raw = await generateText({ prompt });

    if (!raw || !raw.trim()) {
      throw new Error('Empty LLM response');
    }

    const jsonText = extractJsonObject(raw);
    const parsed = JSON.parse(jsonText) as { cards?: unknown };

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
      throw new Error('LLM JSON missing "cards" array');
    }

    const cleaned: GeneratedFlashcard[] = parsed.cards
      .map((c: any) => ({
        front: String(c?.front ?? '').trim(),
        back: String(c?.back ?? '').trim(),
        explanation: String(c?.explanation ?? '').trim(),
      }))
      .filter((c) => c.front && c.back && c.explanation);

    // Make output stable for UI: always return exactly `count`
    if (cleaned.length >= count) return cleaned.slice(0, count);

    // If LLM returned fewer cards, fill the rest with stubs (still valid UI)
    const filler = stubCards(count - cleaned.length);
    return [...cleaned, ...filler];
  } catch (err) {
    console.error('[flashcardsGenerator] LLM parse/call failed, fallback to stub:', err);
    return stubCards(count);
  }
};
