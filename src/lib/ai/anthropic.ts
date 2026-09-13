import type { AIService, ReplyDraft, ReplyDraftRequest, SentimentResult } from "./types";

/**
 * AnthropicAIService — production AI provider (server-side only).
 * Enabled when ANTHROPIC_API_KEY is set. Uses the Messages API directly so
 * there is no SDK dependency in the demo build.
 */
export class AnthropicAIService implements AIService {
  readonly kind = "anthropic" as const;
  private readonly model: string;

  constructor(
    private readonly apiKey: string,
    model?: string,
  ) {
    this.model = model ?? process.env.AI_MODEL ?? "claude-sonnet-5";
  }

  private async complete(system: string, user: string, maxTokens = 400): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`AI provider error ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as { content: { type: string; text?: string }[] };
    return json.content
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("")
      .trim();
  }

  async draftReply(req: ReplyDraftRequest): Promise<ReplyDraft> {
    const system = `You write replies to Google reviews on behalf of local business owners. Rules: sound like a real person, not a corporation; 2–4 sentences; thank the reviewer by first name; reference one specific detail from their review; for 1–3 star reviews apologize sincerely, name the concrete fix, and invite them to contact the business directly; never argue, never offer discounts publicly unless asked, never invent facts. Tone: ${req.tone ?? "warm"}. Output only the reply text.`;
    const user = `Business: ${req.businessName}\nReviewer: ${req.review.reviewerName}\nRating: ${req.review.rating}/5\nReview: """${req.review.text}"""`;
    const text = await this.complete(system, user);
    return { text, model: this.model, generatedAt: new Date().toISOString() };
  }

  async analyzeSentiment(text: string, rating: number): Promise<SentimentResult> {
    const system = `Classify a customer review. Return strict JSON: {"sentiment":"positive|neutral|negative","themes":["..."],"confidence":0-1}. Themes must come from: staff, quality, clean, atmosphere, value, booking_easy, wait, availability, parking, pricing, front_desk, inconsistent.`;
    const raw = await this.complete(system, `Rating: ${rating}/5\nReview: """${text}"""`, 200);
    try {
      const parsed = JSON.parse(raw) as SentimentResult;
      return parsed;
    } catch {
      return { sentiment: rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative", themes: [], confidence: 0.5 };
    }
  }

  async summarizeReputation({ businessName, bullets }: { businessName: string; bullets: string[] }) {
    const system = "You write a 3-sentence executive summary of a local business's online reputation for its owner. Plain English, encouraging but honest, no jargon.";
    return this.complete(system, `Business: ${businessName}\nFacts:\n- ${bullets.join("\n- ")}`, 300);
  }
}
