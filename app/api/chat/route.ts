import { GEMINI_MODEL, getGeminiClient } from "@/lib/ai/gemini";
import { CUSTOMER_SUPPORT_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  const previousInteractionId =
    typeof body === "object" &&
    body !== null &&
    "previousInteractionId" in body &&
    typeof body.previousInteractionId === "string"
      ? body.previousInteractionId.trim()
      : "";

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const ai = getGeminiClient();
    const interaction = await ai.interactions.create({
      model: GEMINI_MODEL,
      input: message,
      system_instruction: CUSTOMER_SUPPORT_SYSTEM_PROMPT,
      ...(previousInteractionId
        ? { previous_interaction_id: previousInteractionId }
        : {}),
    });

    return Response.json({
      reply: interaction.output_text ?? "",
      interactionId: interaction.id,
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to generate a reply.";

    return Response.json({ error: detail }, { status: 500 });
  }
}
