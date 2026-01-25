import { generateText } from "../ai/llm";
import { LIMITS } from "../config/constants";

export const QUIZ_LIMITS = {
  MAX_QUESTION_COUNT: LIMITS.MAX_QUESTION_COUNT,
  MIN_QUESTION_COUNT: LIMITS.MIN_QUESTION_COUNT,
  MIN_CHARS_PER_QUESTION: LIMITS.MIN_CHARS_PER_QUESTION,
  MAX_TEXT_LENGTH: LIMITS.TEXT_CONTENT_MAX_LENGTH,
} as const;

interface IGeneratedQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface IGeneratedQuiz {
  questions: IGeneratedQuestion[];
}

const QUIZ_GENERATION_PROMPT = (questionCount: number) =>
  `
You are a quiz generator for educational content. Generate exactly ${questionCount} multiple-choice questions from the provided text.

CRITICAL RULES:
1. Each question must have EXACTLY 4 options
2. Only ONE option is correct
3. Distractors (wrong answers) must be plausible but clearly incorrect
4. Include a brief explanation (1-2 sentences) for why the correct answer is right
5. Questions should test understanding, not just memorization
6. Return ONLY valid JSON, no markdown formatting, no code blocks
7. Do NOT add any text before or after the JSON

OUTPUT FORMAT (strict JSON):
{
  "questions": [
    {
      "prompt": "Clear question text ending with ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct."
    }
  ]
}

IMPORTANT: Your entire response must be valid JSON that can be parsed with JSON.parse()

VALIDATION:
- All options must be non-empty strings
- correctIndex must be 0, 1, 2, or 3
- No duplicate options within a question
- Explanation must be non-empty
`.trim();

function validateQuizStructure(quiz: any): void {
  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    throw new Error(
      "Invalid quiz structure: questions array is missing or not an array"
    );
  }

  if (quiz.questions.length === 0) {
    throw new Error("Invalid quiz structure: questions array is empty");
  }

  quiz.questions.forEach((q: any, idx: number) => {
    if (
      !q.prompt ||
      typeof q.prompt !== "string" ||
      q.prompt.trim().length === 0
    ) {
      throw new Error(`Question ${idx + 1}: prompt is missing or empty`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${idx + 1}: must have exactly 4 options`);
    }

    q.options.forEach((opt: any, optIdx: number) => {
      if (typeof opt !== "string" || opt.trim().length === 0) {
        throw new Error(`Question ${idx + 1}: option ${optIdx + 1} is empty`);
      }
    });

    const uniqueOptions = new Set(
      q.options.map((o: string) => o.trim().toLowerCase())
    );
    if (uniqueOptions.size !== 4) {
      throw new Error(`Question ${idx + 1}: duplicate options detected`);
    }

    if (
      typeof q.correctIndex !== "number" ||
      q.correctIndex < 0 ||
      q.correctIndex > 3
    ) {
      throw new Error(
        `Question ${idx + 1}: correctIndex must be between 0 and 3`
      );
    }

    if (
      !q.explanation ||
      typeof q.explanation !== "string" ||
      q.explanation.trim().length === 0
    ) {
      throw new Error(`Question ${idx + 1}: explanation is missing or empty`);
    }
  });
}

export const generateQuizFromText = async (
  text: string,
  questionCount: number = 10
): Promise<IGeneratedQuiz> => {
  const cleanedText = (text || "").trim();

  if (!cleanedText) {
    throw new Error("Text content is required for quiz generation.");
  }

  if (
    questionCount < LIMITS.MIN_QUESTION_COUNT ||
    questionCount > LIMITS.MAX_QUESTION_COUNT
  ) {
    throw new Error(
      `Question count must be between ${LIMITS.MIN_QUESTION_COUNT} and ${LIMITS.MAX_QUESTION_COUNT}.`
    );
  }

  const minRequired = questionCount * LIMITS.MIN_CHARS_PER_QUESTION;
  if (cleanedText.length < minRequired) {
    throw new Error(
      `Text too short for ${questionCount} questions. Need at least ${minRequired} characters, got ${cleanedText.length}.`
    );
  }

  if (cleanedText.length > LIMITS.TEXT_CONTENT_MAX_LENGTH) {
    throw new Error(
      `Text is too long (maximum ${LIMITS.TEXT_CONTENT_MAX_LENGTH} characters).`
    );
  }

  const prompt = `
${QUIZ_GENERATION_PROMPT(questionCount)}

Text to create quiz from:
"""
${cleanedText}
"""

Generate ${questionCount} questions in JSON format:
`.trim();

  try {
    const response = await generateText({ prompt });

    let cleanedResponse = response.trim();

    // Remove markdown code blocks BEFORE parsing
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, "");
    }
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, "");
    }
    if (cleanedResponse.endsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/\s*```$/, "");
    }

    cleanedResponse = cleanedResponse.trim();

    let parsed: IGeneratedQuiz;
    try {
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        "[quiz] Failed to parse AI response:",
        cleanedResponse.substring(0, 200)
      );
      throw new Error("AI returned invalid JSON format. Please try again.");
    }

    validateQuizStructure(parsed);

    return parsed;
  } catch (error) {
    console.error("[quiz] Quiz generation failed:", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      throw error;
    }

    throw new Error(
      "Unable to generate quiz at this time. Please try again later."
    );
  }
};
