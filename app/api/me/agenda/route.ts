import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { agendaSelections, announcements, privateReminders } from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";
import { PROGRAMME_SESSIONS } from "@/lib/event-program";

export async function GET() {
  const user = await getEventUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const [selections, reminders, notices] = await Promise.all([
    getDb().select().from(agendaSelections).where(and(eq(agendaSelections.userEmail, user.email), eq(agendaSelections.status, "selected"))).orderBy(desc(agendaSelections.createdAt)),
    getDb().select().from(privateReminders).where(eq(privateReminders.userEmail, user.email)).orderBy(asc(privateReminders.dayNumber), asc(privateReminders.reminderTime)),
    getDb().select().from(announcements).where(eq(announcements.published, true)).orderBy(desc(announcements.createdAt)).limit(12),
  ]);
  return Response.json({ selections, reminders, announcements: notices }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await getEventUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json() as { kind?: string; sessionId?: string; dayNumber?: number; reminderTime?: string; note?: string };
  if (body.kind === "session") {
    if (!PROGRAMME_SESSIONS.some(item => item.id === body.sessionId)) return Response.json({ error: "Programme session not found." }, { status: 404 });
    const existing = await getDb().select().from(agendaSelections).where(and(eq(agendaSelections.userEmail, user.email), eq(agendaSelections.sessionId, body.sessionId!))).limit(1);
    if (existing[0]) await getDb().update(agendaSelections).set({ status: "selected" }).where(eq(agendaSelections.id, existing[0].id));
    else await getDb().insert(agendaSelections).values({ userEmail: user.email, sessionId: body.sessionId! });
    return Response.json({ selected: true });
  }
  if (body.kind === "reminder") {
    const day = Number(body.dayNumber); const time = String(body.reminderTime || ""); const note = String(body.note || "").trim();
    if (![1, 2, 3].includes(day) || !/^\d{2}:\d{2}$/.test(time) || note.length < 2 || note.length > 240) return Response.json({ error: "Choose a day and time and enter a short reminder." }, { status: 400 });
    const [reminder] = await getDb().insert(privateReminders).values({ userEmail: user.email, dayNumber: day, reminderTime: time, note }).returning();
    return Response.json({ reminder }, { status: 201 });
  }
  return Response.json({ error: "Select a valid agenda action." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const user = await getEventUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json() as { kind?: string; sessionId?: string; reminderId?: number };
  if (body.kind === "session" && body.sessionId) {
    await getDb().update(agendaSelections).set({ status: "removed" }).where(and(eq(agendaSelections.userEmail, user.email), eq(agendaSelections.sessionId, body.sessionId)));
    return Response.json({ removed: true });
  }
  if (body.kind === "reminder" && Number.isInteger(body.reminderId)) {
    await getDb().delete(privateReminders).where(and(eq(privateReminders.userEmail, user.email), eq(privateReminders.id, Number(body.reminderId))));
    return Response.json({ removed: true });
  }
  return Response.json({ error: "Agenda item required." }, { status: 400 });
}
