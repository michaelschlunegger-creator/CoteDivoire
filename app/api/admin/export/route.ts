import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { activityReservations, feedback, participantAccess, registrations } from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";
import { isAdminEmail } from "@/lib/admin";

const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "No records\n";
  const keys = Object.keys(rows[0]);
  const cell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [keys.map(cell).join(","), ...rows.map(row => keys.map(key => cell(row[key])).join(","))].join("\n");
};

export async function GET(request: Request) {
  const user = await getEventUser();
  if (!user || !isAdminEmail(user.email)) return Response.json({ error: "Organizer access required." }, { status: 403 });
  const type = new URL(request.url).searchParams.get("type") || "registrations";
  const db = getDb();
  const archivedRows = await db.select({ email: participantAccess.userEmail, status: participantAccess.status }).from(participantAccess);
  const archived = new Set(archivedRows.filter(row => row.status === "soft_deleted").map(row => row.email.toLowerCase()));
  let rows: Record<string, unknown>[];
  if (type === "reservations") {
    const all = await db.select().from(activityReservations).orderBy(desc(activityReservations.createdAt));
    rows = all.filter(row => !archived.has(row.userEmail.toLowerCase())) as Record<string, unknown>[];
  } else if (type === "feedback") {
    const all = await db.select().from(feedback).orderBy(desc(feedback.createdAt));
    rows = all.filter(row => !archived.has((row.userEmail || row.email).toLowerCase())) as Record<string, unknown>[];
  } else {
    const all = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
    rows = all.filter(row => !archived.has((row.userEmail || row.email).toLowerCase())) as Record<string, unknown>[];
  }
  return new Response(csv(rows), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="wat-margin-2027-${type}.csv"` } });
}
