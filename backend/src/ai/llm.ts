// backend/src/ai/llm.ts
export type GenerateTextParams = {
    prompt: string;
  };
  
  export const generateText = async ({ prompt }: GenerateTextParams): Promise<string> => {
    const mode = (process.env.LLM_MODE || 'stub').toLowerCase();
  
    // STUB mode: no external API calls.
    if (mode === 'stub') {
      return '';
    }
  
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing');
    }
  
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
    const genAI = new GoogleGenerativeAI(apiKey);
  
    // Keep provider-specific config here (single place to switch LLM later)
    const generationConfig: any = {
      temperature: 0,
      maxOutputTokens: 1200,
      responseMimeType: 'application/json',
    };
  
    const gemini = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });
  
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  };
  