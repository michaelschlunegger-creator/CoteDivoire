import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { participantAccess } from "@/db/schema";

export type ParticipantAccessStatus = "active" | "suspended" | "soft_deleted";

export type ParticipantAccessState = {
  userEmail: string;
  status: ParticipantAccessStatus;
  sessionVersion: number;
  note: string;
  suspendedAt: string | null;
  softDeletedAt: string | null;
};

export function normalizeParticipantEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getParticipantAccess(email: string): Promise<ParticipantAccessState | null> {
  const normalized = normalizeParticipantEmail(email);
  const [row] = await getDb().select().from(participantAccess).where(eq(participantAccess.userEmail, normalized)).limit(1);
  if (!row) return null;
  return { ...row, status: row.status as ParticipantAccessStatus };
}

export async function ensureParticipantAccess(email: string): Promise<ParticipantAccessState> {
  const normalized = normalizeParticipantEmail(email);
  await getDb().insert(participantAccess).values({ userEmail: normalized }).onConflictDoNothing();
  const state = await getParticipantAccess(normalized);
  if (!state) throw new Error("Participant access state could not be created.");
  return state;
}

export function participantAccessError(status: ParticipantAccessStatus) {
  if (status === "suspended") return "This participant account has been suspended. Please contact the event organizers.";
  if (status === "soft_deleted") return "This participant account has been archived. Please contact the event organizers to restore access.";
  return "Participant access is unavailable.";
}

export async function isParticipantSessionAllowed(email: string, cookieVersion?: number | null) {
  const state = await getParticipantAccess(email);
  if (!state) return true; // Compatibility for sessions created before lifecycle controls were enabled.
  if (state.status !== "active") return false;
  if (state.sessionVersion === 1 && !cookieVersion) return true;
  return cookieVersion === state.sessionVersion;
}
