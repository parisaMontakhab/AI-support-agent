import "server-only";

import { GoogleGenAI } from "@google/genai";
import type { ContextMessage } from "@/lib/ai/context";

export const GEMINI_MODEL = "gemini-3.6-flash";

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

function toInteractionInput(messages: readonly ContextMessage[]) {
  return messages.map((message) => ({
    type: message.role === "assistant" ? ("model_output" as const) : ("user_input" as const),
    content: [{ type: "text" as const, text: message.content }],
  }));
}

export async function generateSupportReply(
  messages: readonly ContextMessage[],
  systemInstruction: string,
) {
  const ai = getGeminiClient();
  const interaction = await ai.interactions.create({
    model: GEMINI_MODEL,
    input: toInteractionInput(messages),
    system_instruction: systemInstruction,
  });

  return interaction.output_text ?? "";
}
