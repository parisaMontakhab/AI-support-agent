import { GEMINI_MODEL, getGeminiClient } from "@/lib/ai/gemini";

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

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const ai = getGeminiClient();
    const interaction = await ai.interactions.create({
      model: GEMINI_MODEL,
      input: message,
    });

    return Response.json({ reply: interaction.output_text ?? "" });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Failed to generate a reply.";

    return Response.json({ error: detail }, { status: 500 });
  }
}
