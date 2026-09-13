import type { AIService, ReplyDraft, ReplyDraftRequest, SentimentResult } from "./types";

/**
 * DemoAIService — produces realistic, review-aware replies without any API
 * key. Deterministic per review so the demo is repeatable. Safe to run in the
 * browser as well as on the server.
 */
export class DemoAIService implements AIService {
  readonly kind = "demo" as const;

  async draftReply(req: ReplyDraftRequest): Promise<ReplyDraft> {
    return { text: draftReplyDemo(req), model: "demo", generatedAt: new Date().toISOString() };
  }

  async analyzeSentiment(text: string, rating: number): Promise<SentimentResult> {
    const t = text.toLowerCase();
    const themes: string[] = [];
    if (/wait|late|minutes past|delay/.test(t)) themes.push("wait");
    if (/park/.test(t)) themes.push("parking");
    if (/book|slot|availab|schedule/.test(t)) themes.push("availability");
    if (/price|pricey|expensive|rates|cost/.test(t)) themes.push("pricing");
    if (/front desk|reception|check-in|checked me in/.test(t)) themes.push("front_desk");
    if (/clean|spotless|sanitiz|immaculate/.test(t)) themes.push("clean");
    if (/friendly|kind|welcoming|staff|team/.test(t)) themes.push("staff");
    if (/massage|pressure|deep tissue|therapist|knots/.test(t)) themes.push("quality");
    if (/calm|quiet|peaceful|atmosphere|relax/.test(t)) themes.push("atmosphere");
    return {
      sentiment: rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative",
      themes,
      confidence: 0.82,
    };
  }

  async summarizeReputation({ businessName, bullets }: { businessName: string; bullets: string[] }) {
    return `${businessName} had a strong period. ${bullets.slice(0, 3).join(" ")}`;
  }
}

/* ------------------------------------------------------------------ */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function draftReplyDemo(req: ReplyDraftRequest): string {
  const first = req.review.reviewerName.split(" ")[0];
  const biz = req.businessName;
  const themes = req.review.themes;
  const text = req.review.text.toLowerCase();
  const seed = hash(req.review.reviewerName + req.review.text);
  const pickBy = <T>(arr: T[]) => arr[seed % arr.length];

  const mentionsWait = themes.includes("wait") || /wait|late|minutes/.test(text);
  const mentionsBooking = themes.includes("availability") || /book|slot|availab/.test(text);
  const mentionsParking = themes.includes("parking") || /park/.test(text);
  const mentionsPricing = themes.includes("pricing") || /price|expensive|rates/.test(text);
  const mentionsStaff = themes.includes("staff");
  const mentionsQuality = themes.includes("quality");
  const mentionsClean = themes.includes("clean");
  const mentionsAtmosphere = themes.includes("atmosphere");

  if (req.review.rating >= 4) {
    const openers = [
      `Thank you so much, ${first}!`,
      `${first}, this made our whole team smile.`,
      `We really appreciate you taking the time to share this, ${first}.`,
    ];
    const middle: string[] = [];
    if (mentionsQuality) middle.push("Hearing that the session helped is exactly why we do this work.");
    if (mentionsStaff) middle.push("Our team works hard to make every guest feel welcome, and we'll pass your kind words along to them.");
    if (mentionsClean) middle.push("We take a lot of pride in keeping the space spotless, so that means a lot.");
    if (mentionsAtmosphere) middle.push("We're so glad the space felt as calm and restorative as we intend it to.");
    if (!middle.length) middle.push(`It means a lot to everyone at ${biz} to know you had a great experience.`);

    let fix = "";
    if (req.review.rating === 4 && mentionsWait) fix = " You're right that the wait wasn't ideal — we've added front-desk coverage at peak hours so check-in is quicker next time.";
    else if (req.review.rating === 4 && mentionsParking) fix = " We know parking can be tight on busy days; our team is happy to point you to the overflow spots behind the building.";
    else if (req.review.rating === 4 && mentionsBooking) fix = " We're opening more weekend and evening slots soon, and you can join our waitlist to be notified first.";
    else if (req.review.rating === 4 && mentionsPricing) fix = " Thank you for the honest note on pricing — ask about our membership, which brings the per-visit cost down.";

    const closers = [
      "We can't wait to welcome you back.",
      "See you at your next visit!",
      "Thank you for being part of the Royal family.",
    ].map((c) => c.replace("Royal", biz.split(" ")[0]));
    return `${pickBy(openers)} ${middle[0]}${fix} ${pickBy(closers)}`;
  }

  if (req.review.rating === 3) {
    let specific = "";
    if (mentionsWait) specific = " A wait like that isn't the experience we want for you, and we've since added a second team member at the front desk during our busiest hours.";
    else if (mentionsBooking) specific = " We know availability has been tight; we're adding appointment slots and a waitlist so you can get the time you actually want.";
    else if (mentionsParking) specific = " We hear you on parking — we're working with the building on additional spaces, and our team can always guide you to overflow parking.";
    else if (mentionsPricing) specific = " We understand the concern on pricing and want every visit to feel worth it. Our membership option brings the per-visit cost down noticeably.";
    else if (themes.includes("inconsistent")) specific = " Consistency matters to us, and we've shared your notes with our therapists. Please request your preferred therapist and pressure when booking — we'll make sure it's right.";
    else specific = " We've shared your feedback with our team so we can do better.";
    return `Thank you for the honest feedback, ${first}, and for giving us a chance.${specific} We'd love the opportunity to show you the experience we're known for — please reach out to us directly and we'll take care of your next visit personally.`;
  }

  // 1–2 stars
  let specific = "";
  if (mentionsWait) specific = " A delay like that is not acceptable, and cutting into your session time is not how we operate. We've changed our scheduling so appointments start on time.";
  else if (mentionsBooking || themes.includes("front_desk")) specific = " The communication around your booking fell short of our standards, and we've addressed it directly with our front-desk team.";
  else if (mentionsPricing) specific = " We understand the frustration around fees and pricing, and our manager will review your account personally.";
  else if (themes.includes("inconsistent")) specific = " Not getting the pressure you asked for — twice — is on us, and we've reviewed it with the therapist involved.";
  else specific = " This is not the experience we want anyone to have, and we take it seriously.";
  return `${first}, we're truly sorry about your experience.${specific} Our manager would like to speak with you and make this right, including a complimentary session on us. Please call us at your convenience — we'd welcome the chance to earn back your trust.`;
}
