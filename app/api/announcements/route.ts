import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { announcements } from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";

export async function GET() {
  const user = await getEventUser();
  if (!user) return Response.json({ error: "Participant sign in required." }, { status: 401 });
  const rows = await getDb().select().from(announcements).where(eq(announcements.published, true)).orderBy(desc(announcements.createdAt)).limit(30);
  return Response.json({ announcements: rows }, { headers: { "Cache-Control": "private, no-store" } });
}
