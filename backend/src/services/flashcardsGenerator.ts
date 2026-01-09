// backend/src/services/flashcardsGenerator.ts
import { generateText } from "../ai/llm";

export type GeneratedFlashcard = {
  front: string;
  back: string;
  explanation: string;
};

const stubCards = (count: number): GeneratedFlashcard[] =>
  Array.from({ length: count }).map((_, i) => ({
    front: `Question ${i + 1}`,
    back: `Answer ${i + 1}`,
    explanation: "Short explanation (stub).",
  }));

const stripFences = (raw: string) =>
  (raw || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

const looksTruncatedJson = (s: string) => {
  const t = stripFences(s);
  const startsOk = t.startsWith("{") || t.startsWith("[");
  const endsOk = t.endsWith("}") || t.endsWith("]");
  return startsOk && !endsOk;
};

const extractJsonPayload = (raw: string): string => {
  const noFences = stripFences(raw);

  const objStart = noFences.indexOf("{");
  const objEnd = noFences.lastIndexOf("}");

  const arrStart = noFences.indexOf("[");
  const arrEnd = noFences.lastIndexOf("]");

  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    return noFences.slice(objStart, objEnd + 1);
  }

  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    return noFences.slice(arrStart, arrEnd + 1);
  }

  throw new Error("No JSON payload found in LLM response");
};

const parseCards = (jsonText: string): GeneratedFlashcard[] => {
  const parsed = JSON.parse(jsonText) as any;

  const cardsArray = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.cards)
      ? parsed.cards
      : Array.isArray(parsed?.flashcards)
        ? parsed.flashcards
        : null;

  if (!cardsArray || !Array.isArray(cardsArray)) {
    throw new Error('LLM JSON missing a "cards" array');
  }

  return cardsArray
    .map((c: any) => {
      const front = String(c?.front ?? c?.question ?? "").trim();
      const back = String(c?.back ?? c?.answer ?? "").trim();
      const explanation = String(c?.explanation ?? c?.rationale ?? c?.why ?? "").trim();

      if (!front || !back) return null;

      return {
        front,
        back,
        explanation: explanation || "-",
      } satisfies GeneratedFlashcard;
    })
    .filter(Boolean) as GeneratedFlashcard[];
};

export const generateFlashcardsFromText = async (params: {
  text: string;
  count: number;
}): Promise<GeneratedFlashcard[]> => {
  const mode = (process.env.LLM_MODE || "stub").toLowerCase();
  const text = (params.text || "").trim();
  const count = Math.max(1, Math.min(30, Math.floor(params.count)));

  if (!text || mode === "stub") return stubCards(count);

  const prompt = `
You are generating study flashcards.
Return ONLY valid JSON.

Schema:
{ "cards": [ { "front": "...", "back": "...", "explanation": "..." } ] }

Rules:
- Exactly ${count} cards.
- Use the text as the only source.
- explanation may be "-" if unsure.

Text:
"""${text}"""
`.trim();

  try {
    let raw = await generateText({ prompt });

    // If model returned truncated JSON — retry once (this is your case).
    if (looksTruncatedJson(raw)) {
      raw = await generateText({
        prompt: `${prompt}\n\nIMPORTANT: Your previous response was cut off. Return the FULL JSON again. No extra text.`,
      });
    }

    const jsonText = extractJsonPayload(raw);
    const cleaned = parseCards(jsonText);

    if (cleaned.length >= count) return cleaned.slice(0, count);

    return [...cleaned, ...stubCards(count - cleaned.length)];
  } catch (err) {
    console.error("[flashcardsGenerator] LLM parse/call failed -> stub fallback:", err);
    return stubCards(count);
  }
};
