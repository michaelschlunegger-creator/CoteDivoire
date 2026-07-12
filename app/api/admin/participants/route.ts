import { desc, eq, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  activityReservations,
  adminAuditLogs,
  adminNotifications,
  agendaSelections,
  feedback,
  participantAccess,
  participantProfiles,
  privateReminders,
  registrations,
} from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";
import { isAdminEmail } from "@/lib/admin";
import { ensureParticipantAccess, normalizeParticipantEmail } from "@/lib/participant-access";
import { isPermanentErasureConfigured, permanentlyDeleteAuthUser } from "@/lib/supabase-admin";

type LifecycleAction = "suspend" | "restore" | "signout_all" | "soft_delete" | "permanent_erase";

async function requireAdmin() {
  const user = await getEventUser();
  return user && isAdminEmail(user.email) ? user : null;
}

async function labelForParticipant(email: string) {
  const [registration] = await getDb().select({ fullName: registrations.fullName }).from(registrations)
    .where(or(eq(registrations.userEmail, email), eq(registrations.email, email))).orderBy(desc(registrations.createdAt)).limit(1);
  return registration?.fullName || email;
}

async function appendAudit(adminEmail: string, action: string, email: string, label: string, detail: Record<string, unknown> = {}) {
  await getDb().insert(adminAuditLogs).values({ adminEmail, action, targetEmail: email, targetLabel: label, detail: JSON.stringify(detail) });
}

async function hashedReference(email: string) {
  const bytes = new TextEncoder().encode(email.toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `erased_${Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 16)}`;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Organizer access required." }, { status: 403 });
  const db = getDb();
  const [registrationRows, accessRows, feedbackRows, reservationRows] = await Promise.all([
    db.select().from(registrations).orderBy(desc(registrations.createdAt)),
    db.select().from(participantAccess),
    db.select({ userEmail: feedback.userEmail, email: feedback.email }).from(feedback),
    db.select({ userEmail: activityReservations.userEmail, status: activityReservations.status }).from(activityReservations),
  ]);
  const accessMap = new Map(accessRows.map(row => [row.userEmail, row]));
  const participants = new Map<string, {
    email: string; fullName: string; organization: string; jobTitle: string; country: string;
    participationType: string; registrationStatus: string; registeredAt: string; status: string;
    note: string; sessionVersion: number; feedbackCount: number; reservationCount: number;
  }>();
  for (const registration of registrationRows) {
    const email = normalizeParticipantEmail(registration.userEmail || registration.email);
    if (isAdminEmail(email)) continue;
    if (!participants.has(email)) {
      const access = accessMap.get(email);
      participants.set(email, {
        email, fullName: registration.fullName, organization: registration.organization, jobTitle: registration.jobTitle,
        country: registration.country, participationType: registration.participationType, registrationStatus: registration.status,
        registeredAt: registration.createdAt, status: access?.status || "active", note: access?.note || "",
        sessionVersion: access?.sessionVersion || 1, feedbackCount: 0, reservationCount: 0,
      });
    }
  }
  for (const access of accessRows) {
    if (!participants.has(access.userEmail) && !isAdminEmail(access.userEmail)) {
      participants.set(access.userEmail, {
        email: access.userEmail, fullName: "Verified participant", organization: "", jobTitle: "", country: "",
        participationType: "Registration incomplete", registrationStatus: "not submitted", registeredAt: access.createdAt,
        status: access.status, note: access.note, sessionVersion: access.sessionVersion, feedbackCount: 0, reservationCount: 0,
      });
    }
  }
  for (const item of feedbackRows) {
    const email = normalizeParticipantEmail(item.userEmail || item.email);
    const participant = participants.get(email);
    if (participant) participant.feedbackCount += 1;
  }
  for (const item of reservationRows) {
    const participant = participants.get(normalizeParticipantEmail(item.userEmail));
    if (participant && item.status === "confirmed") participant.reservationCount += 1;
  }
  return Response.json({ participants: [...participants.values()], permanentErasureReady: isPermanentErasureConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Organizer access required." }, { status: 403 });
  const body = await request.json() as { action?: LifecycleAction; email?: string; note?: string; confirmationEmail?: string; confirmationPhrase?: string };
  const email = normalizeParticipantEmail(body.email || "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "A valid participant email is required." }, { status: 400 });
  if (isAdminEmail(email)) return Response.json({ error: "Administrator accounts cannot be changed from participant controls." }, { status: 409 });
  const action = body.action;
  if (!action || !["suspend", "restore", "signout_all", "soft_delete", "permanent_erase"].includes(action)) {
    return Response.json({ error: "Select a valid participant action." }, { status: 400 });
  }

  const db = getDb();
  const state = await ensureParticipantAccess(email);
  const label = await labelForParticipant(email);
  const now = new Date().toISOString();
  const note = body.note?.trim().slice(0, 500) || "";

  if (action === "suspend") {
    await db.update(participantAccess).set({ status: "suspended", note, suspendedAt: now, softDeletedAt: null, sessionVersion: sql`${participantAccess.sessionVersion} + 1`, updatedAt: now }).where(eq(participantAccess.userEmail, email));
    await appendAudit(admin.email, "participant.suspended", email, label, { note: note || "No reason recorded" });
  } else if (action === "restore") {
    await db.update(participantAccess).set({ status: "active", note, suspendedAt: null, softDeletedAt: null, updatedAt: now }).where(eq(participantAccess.userEmail, email));
    await appendAudit(admin.email, "participant.restored", email, label, { note: note || "Access restored" });
  } else if (action === "signout_all") {
    await db.update(participantAccess).set({ sessionVersion: sql`${participantAccess.sessionVersion} + 1`, updatedAt: now }).where(eq(participantAccess.userEmail, email));
    await appendAudit(admin.email, "participant.sessions_revoked", email, label, { scope: "all_devices" });
  } else if (action === "soft_delete") {
    await db.update(participantAccess).set({ status: "soft_deleted", note, suspendedAt: null, softDeletedAt: now, sessionVersion: sql`${participantAccess.sessionVersion} + 1`, updatedAt: now }).where(eq(participantAccess.userEmail, email));
    await appendAudit(admin.email, "participant.soft_deleted", email, label, { note: note || "Archived by administrator" });
  } else {
    if (state.status !== "soft_deleted") return Response.json({ error: "Soft-delete the participant before permanent erasure." }, { status: 409 });
    if (normalizeParticipantEmail(body.confirmationEmail || "") !== email || body.confirmationPhrase !== "PERMANENTLY ERASE") {
      return Response.json({ error: "The two-step permanent-erasure confirmation did not match." }, { status: 400 });
    }
    if (!isPermanentErasureConfigured()) return Response.json({ error: "Permanent erasure is locked until the private Supabase service-role key is configured." }, { status: 503 });

    await permanentlyDeleteAuthUser(email);
    const reference = await hashedReference(email);
    await db.delete(activityReservations).where(eq(activityReservations.userEmail, email));
    await db.delete(agendaSelections).where(eq(agendaSelections.userEmail, email));
    await db.delete(privateReminders).where(eq(privateReminders.userEmail, email));
    await db.delete(participantProfiles).where(eq(participantProfiles.userEmail, email));
    await db.delete(feedback).where(or(eq(feedback.userEmail, email), eq(feedback.email, email)));
    await db.delete(registrations).where(or(eq(registrations.userEmail, email), eq(registrations.email, email)));
    await db.delete(adminNotifications).where(eq(adminNotifications.contactEmail, email));
    await db.delete(participantAccess).where(eq(participantAccess.userEmail, email));
    await db.update(adminAuditLogs).set({ targetEmail: "", targetReference: reference, targetLabel: "Erased participant" }).where(eq(adminAuditLogs.targetEmail, email));
    await db.insert(adminAuditLogs).values({ adminEmail: admin.email, action: "participant.permanently_erased", targetEmail: "", targetReference: reference, targetLabel: "Erased participant", detail: JSON.stringify({ confirmation: "two_step", identityDeleted: true }) });
  }
  return Response.json({ ok: true, action, email });
}
