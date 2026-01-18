import { generateText } from "../ai/llm";

const MAX_RESPONSE_CHARS = 10_000;

const SYSTEM_PROMPT = `
You are a study assistant for a learning app.
Answer in clear, concise plain text that helps the user study.

Formatting rules:
- Plain text only (no Markdown, no code fences, no headings).
- Avoid bullet lists; use short paragraphs or sentences instead.
- Do not include citations or links unless explicitly requested.
- Keep the response under ${MAX_RESPONSE_CHARS} characters.

Behavior rules:
- Be accurate and grounded in the user's prompt.
- If the prompt is unclear, ask one short clarifying question.
`.trim();

export const generateStudyAssistantResponse = async (prompt: string): Promise<string> => {
  const cleanedPrompt = (prompt || "").trim();
  if (!cleanedPrompt) return "No response generated.";

  const combinedPrompt = `
${SYSTEM_PROMPT}

User prompt:
"""${cleanedPrompt}"""
`.trim();

  const raw = await generateText({ prompt: combinedPrompt });
  const trimmed = raw?.trim() || "No response generated.";
  if (trimmed.length <= MAX_RESPONSE_CHARS) return trimmed;
  return trimmed.slice(0, MAX_RESPONSE_CHARS).trimEnd();
};
