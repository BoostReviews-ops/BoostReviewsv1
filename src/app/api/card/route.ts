import { NextResponse } from "next/server";
import { currentUser, supabaseConfigured, userClient } from "@/lib/db/server";
import { updateCard } from "@/lib/db/repo";

/** PATCH /api/card { cardId, destinationType?, destinationUrl?, status? } */
export async function PATCH(req: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ mode: "demo" });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const b = (await req.json()) as { cardId: string; destinationType?: "google_review" | "custom"; destinationUrl?: string; status?: "active" | "paused" };
  if (b.destinationUrl && !/^https?:\/\//.test(b.destinationUrl)) return NextResponse.json({ error: "destinationUrl must be https" }, { status: 400 });
  const sb = await userClient();
  await updateCard(sb, b.cardId, { destination_type: b.destinationType, destination_url: b.destinationUrl, status: b.status });
  return NextResponse.json({ ok: true });
}
