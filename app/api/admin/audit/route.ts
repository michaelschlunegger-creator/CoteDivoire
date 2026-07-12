import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const admin = await getEventUser();
  if (!admin || !isAdminEmail(admin.email)) return Response.json({ error: "Organizer access required." }, { status: 403 });
  const entries = await getDb().select().from(adminAuditLogs).orderBy(desc(adminAuditLogs.createdAt)).limit(200);
  return Response.json({ entries }, { headers: { "Cache-Control": "no-store" } });
}
