import { count, desc, eq } from "drizzle-orm";
import { getEventUser } from "@/lib/event-auth";
import { getDb } from "@/db";
import { activityReservations, adminNotifications, feedback, participantAccess, registrations, resources } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const user = await getEventUser();
  if (!user || !isAdminEmail(user.email)) return Response.json({ error: "Organizer access required." }, { status: 403 });
  const db = getDb();
  const [resourceCount, accessRows, registrationRows, feedbackRows, notificationRows, reservationRows] = await Promise.all([
    db.select({ value: count() }).from(resources),
    db.select().from(participantAccess),
    db.select({ id: registrations.id, userEmail: registrations.userEmail, email: registrations.email, fullName: registrations.fullName, organization: registrations.organization, participationType: registrations.participationType, createdAt: registrations.createdAt }).from(registrations).orderBy(desc(registrations.createdAt)),
    db.select({ id: feedback.id, userEmail: feedback.userEmail, email: feedback.email, category: feedback.category, rating: feedback.rating, message: feedback.message, createdAt: feedback.createdAt }).from(feedback).orderBy(desc(feedback.createdAt)),
    db.select({ id: adminNotifications.id, kind: adminNotifications.kind, title: adminNotifications.title, detail: adminNotifications.detail, contactEmail: adminNotifications.contactEmail, emailStatus: adminNotifications.emailStatus, createdAt: adminNotifications.createdAt }).from(adminNotifications).orderBy(desc(adminNotifications.createdAt)),
    db.select({ id: activityReservations.id, userEmail: activityReservations.userEmail, activityId: activityReservations.activityId, status: activityReservations.status, createdAt: activityReservations.createdAt }).from(activityReservations).where(eq(activityReservations.status, "confirmed")).orderBy(desc(activityReservations.createdAt)),
  ]);
  const archived = new Set(accessRows.filter(row => row.status === "soft_deleted").map(row => row.userEmail));
  const visibleRegistrations = registrationRows.filter(row => !archived.has((row.userEmail || row.email).toLowerCase()));
  const visibleFeedback = feedbackRows.filter(row => !archived.has((row.userEmail || row.email).toLowerCase()));
  const visibleNotifications = notificationRows.filter(row => !row.contactEmail || !archived.has(row.contactEmail.toLowerCase()));
  const visibleReservations = reservationRows.filter(row => !archived.has(row.userEmail.toLowerCase()));
  return Response.json({
    counts: { registrations: visibleRegistrations.length, feedback: visibleFeedback.length, resources: resourceCount[0].value, reservations: visibleReservations.length },
    registrations: visibleRegistrations.slice(0, 6),
    feedback: visibleFeedback.slice(0, 6),
    notifications: visibleNotifications.slice(0, 12),
    activityReservations: visibleReservations.slice(0, 12),
  });
}
