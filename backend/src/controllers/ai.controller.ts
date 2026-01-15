import type { Request, Response } from "express";
import { generateText } from "../ai/llm";

export const askAi = async (req: Request, res: Response) => {
  try {
    const prompt = String(req.body?.prompt ?? "").trim();
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required." });
    }

    const text = await generateText({ prompt });
    const responseText = text?.trim() || "No response generated.";

    return res.status(200).json({ response: responseText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ message });
  }
};
