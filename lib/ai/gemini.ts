import "server-only";

import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY. Add it to .env.local (see .env.example).",
    );
  }

  return apiKey;
}

export function getGeminiClient() {
  return new GoogleGenAI({ apiKey: getGeminiApiKey() });
}
