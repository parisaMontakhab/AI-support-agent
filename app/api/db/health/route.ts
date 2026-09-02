import { pingMongo } from "@/lib/db/mongoose";

export async function GET() {
  try {
    await pingMongo();
    return Response.json({ ok: true });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "MongoDB connection failed.";
    const safeDetail = detail.replace(
      /mongodb(\+srv)?:\/\/[^/\s]+/gi,
      "mongodb$1://***",
    );

    return Response.json({ ok: false, error: safeDetail }, { status: 500 });
  }
}
