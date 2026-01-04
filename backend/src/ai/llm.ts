// backend/src/ai/llm.ts
export type GenerateTextParams = {
  prompt: string;
};

export const generateText = async ({ prompt }: GenerateTextParams): Promise<string> => {
  const mode = (process.env.LLM_MODE || "stub").toLowerCase();
  console.log(`[llm] mode=${mode}`);

  if (mode === "stub") {
    console.log("[llm] STUB mode active -> returning empty string");
    return "";
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log(`[llm] model=${modelName} apiKeyPresent=${Boolean(apiKey)}`);

  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);

  // IMPORTANT:
  // Do NOT force responseMimeType=application/json — it often truncates/cuts off output.
  // We will enforce JSON via the prompt + backend parsing.
  const generationConfig: any = {
    temperature: 0,
    maxOutputTokens: 4096,
  };

  const gemini = genAI.getGenerativeModel({
    model: modelName,
    generationConfig,
  });

  const result = await gemini.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = result.response.text() || "";
  console.log(`[llm] response chars=${text.length}`);
  console.log(`[llm] response preview=${JSON.stringify(text.slice(0, 300))}`);
  return text;
};
