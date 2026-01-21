import { generateText } from "../ai/llm";
import { LIMITS } from "../config/constants";

const MAX_SUMMARY_CHARS = 5000;
const MAX_INPUT_CHARS = LIMITS.TEXT_CONTENT_MAX_LENGTH;
const MIN_INPUT_CHARS = 100;

const SUMMARY_PROMPT = `
You are a study assistant that creates concise summaries of educational content.

Task: Create a clear, structured summary of the provided text.

Formatting rules:
- Plain text only (no Markdown, no code fences, no headings).
- Use short paragraphs separated by line breaks.
- Keep the summary under ${MAX_SUMMARY_CHARS} characters.
- Focus on key concepts, main ideas, and important details.

Quality rules:
- Be accurate and comprehensive.
- Maintain the original meaning and context.
- Use clear, simple language suitable for studying.
`.trim();

export const generateSummaryFromText = async (
  text: string
): Promise<string> => {
  const cleanedText = (text || "").trim();

  if (!cleanedText) {
    throw new Error("Text content is required for summary generation.");
  }

  if (cleanedText.length < MIN_INPUT_CHARS) {
    throw new Error(
      `Text is too short to generate a meaningful summary (minimum ${MIN_INPUT_CHARS} characters).`
    );
  }

  if (cleanedText.length > MAX_INPUT_CHARS) {
    throw new Error(
      `Text is too long (maximum ${MAX_INPUT_CHARS} characters).`
    );
  }

  const prompt = `
${SUMMARY_PROMPT}

Text to summarize:
"""
${cleanedText}
"""

Summary:
`.trim();

  try {
    const raw = await generateText({ prompt });
    const summary = raw?.trim() || "";

    if (!summary) {
      throw new Error("Failed to generate summary. Please try again.");
    }

    if (summary.length > MAX_SUMMARY_CHARS) {
      const truncated = summary.slice(0, MAX_SUMMARY_CHARS);
      const lastSpace = truncated.lastIndexOf(" ");
      return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
    }

    return summary;
  } catch (error) {
    console.error("[summary] LLM generation failed:", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      throw error;
    }

    throw new Error(
      "Unable to generate summary at this time. Please try again later."
    );
  }
};
