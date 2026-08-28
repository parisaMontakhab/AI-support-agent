import { GEMINI_MODEL, getGeminiClient } from "@/lib/ai/gemini";
import { CUSTOMER_SUPPORT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import {
  getOrCreateConversation,
  updateConversationInteractionId,
} from "@/lib/db/conversations";
import { saveMessage } from "@/lib/db/messages";

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

  const conversationId =
    typeof body === "object" &&
    body !== null &&
    "conversationId" in body &&
    typeof body.conversationId === "string"
      ? body.conversationId.trim()
      : "";

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const conversation = await getOrCreateConversation(conversationId || undefined);
    await saveMessage({
      conversationId: conversation._id,
      role: "user",
      content: message,
    });

    const priorInteractionId =
      conversation.interactionId || previousInteractionId;

    const ai = getGeminiClient();
    const interaction = await ai.interactions.create({
      model: GEMINI_MODEL,
      input: message,
      system_instruction: CUSTOMER_SUPPORT_SYSTEM_PROMPT,
      ...(priorInteractionId
        ? { previous_interaction_id: priorInteractionId }
        : {}),
    });

    const reply = interaction.output_text ?? "";

    await saveMessage({
      conversationId: conversation._id,
      role: "assistant",
      content: reply,
    });
    await updateConversationInteractionId(conversation._id, interaction.id);

    return Response.json({
      reply,
      interactionId: interaction.id,
      conversationId: conversation._id.toHexString(),
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to generate a reply.";

    return Response.json({ error: detail }, { status: 500 });
  }
}
