import { AnthropicAIService } from "./anthropic";
import { DemoAIService } from "./demo";
import type { AIService } from "./types";

export type { AIService, ReplyDraft, ReplyDraftRequest, SentimentResult } from "./types";
export { draftReplyDemo } from "./demo";

/**
 * Server-side factory. Reads ANTHROPIC_API_KEY (never exposed to the client).
 * Falls back to the demo service so the app always works.
 */
export function getAIService(): AIService {
  const key = process.env.ANTHROPIC_API_KEY;
  const enabled = (process.env.AI_PROVIDER ?? "demo").toLowerCase() === "anthropic";
  if (enabled && key) return new AnthropicAIService(key);
  return new DemoAIService();
}
