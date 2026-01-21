import type { GenerateContentResult } from "@google/generative-ai";

export type GenerateTextParams = {
  prompt: string;
};

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const TIMEOUT_MS = 30000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || "";
  const status = error?.status || error?.statusCode || 0;

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("rate limit") ||
    message.includes("timeout") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("econnrefused")
  );
};

const generateWithTimeout = async (
  gemini: any,
  prompt: string
): Promise<GenerateContentResult> => {
  return Promise.race([
    gemini.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
    ),
  ]);
};

export const generateText = async ({
  prompt,
}: GenerateTextParams): Promise<string> => {
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

  const generationConfig: any = {
    temperature: 0,
    maxOutputTokens: 4096,
  };

  const gemini = genAI.getGenerativeModel({
    model: modelName,
    generationConfig,
  });

  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await generateWithTimeout(gemini, prompt);

      const text = result.response.text() || "";
      console.log(
        `[llm] total attempts=${attempt + 1}, success=true, response chars=${
          text.length
        }`
      );
      console.log(
        `[llm] response preview=${JSON.stringify(text.slice(0, 300))}`
      );
      return text;
    } catch (error: any) {
      lastError = error;
      console.error(
        `[llm] attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
        error.message
      );

      if (attempt < MAX_RETRIES - 1 && isRetryableError(error)) {
        const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.log(`[llm] retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      } else {
        break;
      }
    }
  }

  console.error(`[llm] total attempts=${MAX_RETRIES}, success=false`);
  throw new Error(
    `Failed to generate text after ${MAX_RETRIES} attempts: ${
      lastError?.message || "Unknown error"
    }`
  );
};
