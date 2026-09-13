import { NextResponse } from "next/server";
import { currentUser, supabaseConfigured, userClient } from "@/lib/db/server";
import { completeAction } from "@/lib/db/repo";

/** PATCH /api/actions/:id { done: boolean } */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!supabaseConfigured()) return NextResponse.json({ mode: "demo" });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { done } = (await req.json()) as { done: boolean };
  await completeAction(await userClient(), id, !!done);
  return NextResponse.json({ ok: true });
}
