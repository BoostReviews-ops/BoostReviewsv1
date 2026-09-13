import { NextResponse } from "next/server";
import { getAIService } from "@/lib/ai";

/**
 * POST /api/ai/reply — draft a review reply.
 * Server-side only: picks the AI provider from env (ANTHROPIC_API_KEY) and
 * falls back to the demo generator. Secrets never reach the browser.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { businessName?: string; review?: { reviewerName: string; rating: number; text: string; themes?: string[] }; tone?: "warm" | "professional" | "concise" };
    if (!body.review || !body.businessName) return NextResponse.json({ error: "businessName and review are required" }, { status: 400 });
    const ai = getAIService();
    const draft = await ai.draftReply({
      businessName: body.businessName,
      review: { reviewerName: body.review.reviewerName, rating: body.review.rating as 1 | 2 | 3 | 4 | 5, text: body.review.text, themes: body.review.themes ?? [] },
      tone: body.tone,
    });
    return NextResponse.json({ ...draft, provider: ai.kind });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
