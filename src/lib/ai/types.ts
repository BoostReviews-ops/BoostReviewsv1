/**
 * AI service abstraction.
 *
 * DemoAIService      → deterministic, credential-free, used for the sales demo.
 * AnthropicAIService → production, enabled server-side via ANTHROPIC_API_KEY.
 *
 * Secrets never reach the browser: the client calls /api/ai/* routes, which
 * pick the service on the server.
 */
import type { Review, Sentiment } from "@/lib/types";

export interface ReplyDraftRequest {
  businessName: string;
  review: Pick<Review, "reviewerName" | "rating" | "text" | "themes">;
  tone?: "warm" | "professional" | "concise";
  ownerName?: string;
}

export interface ReplyDraft {
  text: string;
  /** "demo" or the model id used. */
  model: string;
  generatedAt: string;
}

export interface SentimentResult {
  sentiment: Sentiment;
  themes: string[];
  confidence: number;
}

export interface AIService {
  readonly kind: "demo" | "anthropic";
  draftReply(req: ReplyDraftRequest): Promise<ReplyDraft>;
  analyzeSentiment(text: string, rating: number): Promise<SentimentResult>;
  summarizeReputation(input: { businessName: string; bullets: string[] }): Promise<string>;
}
