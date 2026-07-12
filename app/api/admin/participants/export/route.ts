import { desc, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { activityReservations, adminAuditLogs, agendaSelections, feedback, participantAccess, participantProfiles, privateReminders, registrations } from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";
import { isAdminEmail } from "@/lib/admin";
import { normalizeParticipantEmail } from "@/lib/participant-access";

export async function GET(request: Request) {
  const admin = await getEventUser();
  if (!admin || !isAdminEmail(admin.email)) return Response.json({ error: "Organizer access required." }, { status: 403 });
  const email = normalizeParticipantEmail(new URL(request.url).searchParams.get("email") || "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Participant email required." }, { status: 400 });
  const db = getDb();
  const [registrationRows, profileRows, reservationRows, feedbackRows, agendaRows, reminderRows, accessRows, auditRows] = await Promise.all([
    db.select().from(registrations).where(or(eq(registrations.userEmail, email), eq(registrations.email, email))).orderBy(desc(registrations.createdAt)),
    db.select().from(participantProfiles).where(eq(participantProfiles.userEmail, email)),
    db.select().from(activityReservations).where(eq(activityReservations.userEmail, email)).orderBy(desc(activityReservations.createdAt)),
    db.select().from(feedback).where(or(eq(feedback.userEmail, email), eq(feedback.email, email))).orderBy(desc(feedback.createdAt)),
    db.select().from(agendaSelections).where(eq(agendaSelections.userEmail, email)).orderBy(desc(agendaSelections.createdAt)),
    db.select().from(privateReminders).where(eq(privateReminders.userEmail, email)).orderBy(desc(privateReminders.createdAt)),
    db.select().from(participantAccess).where(eq(participantAccess.userEmail, email)),
    db.select().from(adminAuditLogs).where(eq(adminAuditLogs.targetEmail, email)).orderBy(desc(adminAuditLogs.createdAt)),
  ]);
  const record = { exportedAt: new Date().toISOString(), exportedBy: admin.email, participant: { email, access: accessRows[0] || { status: "active", sessionVersion: 1 }, registrations: registrationRows, profiles: profileRows, reservations: reservationRows, feedback: feedbackRows, agendaSelections: agendaRows, privateReminders: reminderRows, administrativeHistory: auditRows } };
  const safe = email.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 80);
  return new Response(JSON.stringify(record, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="participant-${safe}.json"`, "Cache-Control": "no-store" } });
}
