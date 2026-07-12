import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, or } from "drizzle-orm";
import { PageShell } from "@/components/PageShell";
import { ParticipantPlanner } from "@/components/ParticipantPlanner";
import { getDb } from "@/db";
import { activityReservations, agendaSelections, announcements, feedback, privateReminders, registrations } from "@/db/schema";
import { requireEventUser } from "@/lib/event-auth";
import { getManagedActivities } from "@/lib/activities";
import { participantDisplayName } from "@/lib/participant-name";

export const metadata: Metadata = { title: "Participant hub" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireEventUser("/dashboard");
  let registration: null | typeof registrations.$inferSelect = null;
  let responses: typeof feedback.$inferSelect[] = [];
  let activityIds: string[] = [];
  let selectedSessionIds: string[] = [];
  let reminders: typeof privateReminders.$inferSelect[] = [];
  let notices: typeof announcements.$inferSelect[] = [];
  const activities = await getManagedActivities();
  try {
    const [registrationRows, feedbackRows, reservationRows, selectionRows, reminderRows, announcementRows] = await Promise.all([
      getDb().select().from(registrations).where(or(eq(registrations.email, user.email), eq(registrations.userEmail, user.email))).orderBy(desc(registrations.createdAt)).limit(1),
      getDb().select().from(feedback).where(eq(feedback.userEmail, user.email)).orderBy(desc(feedback.createdAt)).limit(12),
      getDb().select().from(activityReservations).where(eq(activityReservations.userEmail, user.email)),
      getDb().select().from(agendaSelections).where(eq(agendaSelections.userEmail, user.email)),
      getDb().select().from(privateReminders).where(eq(privateReminders.userEmail, user.email)),
      getDb().select().from(announcements).where(eq(announcements.published, true)).orderBy(desc(announcements.createdAt)).limit(8),
    ]);
    registration = registrationRows[0] || null;
    responses = feedbackRows;
    activityIds = reservationRows.filter(row => row.status === "confirmed").map(row => row.activityId);
    selectedSessionIds = selectionRows.filter(row => row.status === "selected").map(row => row.sessionId);
    reminders = reminderRows;
    notices = announcementRows;
  } catch {}
  const welcomeName = participantDisplayName(registration?.fullName, user.email);
  return <PageShell><main>
    <section className="page-hero participant-hub-hero"><div className="page-hero-inner"><p className="eyebrow">PARTICIPANT HUB</p><h1>Welcome, {welcomeName}.</h1><p>Your personalized place for today’s agenda, experience reservations, registration status, private feedback and official material.</p></div></section>
    <div className="dashboard-shell"><div className="dashboard-head"><div><span className="status-pill">Securely signed in</span><h1>Your event hub</h1><p>{user.email}</p></div><Link className="button button-secondary" href="/api/auth/signout">Sign out</Link></div>
      <ParticipantPlanner initialActivityIds={activityIds} initialSessionIds={selectedSessionIds} initialReminders={reminders} announcements={notices} activities={activities} />
      <section className="participant-survey-cta"><div><span className="tag">CONFIDENTIAL · 20 QUESTIONS</span><h2>Help set the next benchmark.</h2><p>Evaluate the technical programme, speakers, networking, venue, hospitality, travel support and digital experience in one professionally structured survey.</p><div className="participant-survey-facts"><span><b>20</b> focused questions</span><span><b>≈ 6</b> minutes</span><span><b>100%</b> private</span></div></div><Link className="button" href="/feedback">Start participant survey →</Link></section>
      <div className="dashboard-grid participant-account-grid"><section className="dashboard-card"><h2>Event registration</h2>{registration ? <><span className="status-pill">{registration.status}</span><div className="profile-row"><span>Name</span><strong>{welcomeName}</strong></div><div className="profile-row"><span>Organization</span><strong>{registration.organization}</strong></div><div className="profile-row"><span>Participation</span><strong>{registration.participationType}</strong></div><div className="profile-row"><span>Submitted</span><strong>{registration.createdAt.slice(0, 10)}</strong></div></> : <><p className="section-lead" style={{ fontSize: 15 }}>Complete your event registration to add your first and last name and unlock the full participant experience.</p><Link className="button" href="/register">Complete registration →</Link></>}</section><aside className="dashboard-card"><h2>Quick access</h2><div className="admin-list"><Link className="admin-list-item" href="/resources"><span>Official downloads</span><strong>→</strong></Link><Link className="admin-list-item" href="/highlights"><span>Daily highlights</span><strong>→</strong></Link><Link className="admin-list-item" href="/feedback"><span>Private participant survey</span><strong>→</strong></Link></div><div className="trust-note"><span>✦</span><span>Your account, reservations and feedback are private. Only you and authorized administrators can view them.</span></div></aside></div>
      <section className="dashboard-card participant-feedback-history"><div className="dashboard-head" style={{ marginBottom: 12 }}><div><span className="tag">PRIVATE TO YOU</span><h2>Your survey history</h2></div><Link className="button button-small" href="/feedback">New response</Link></div>{responses.length ? <div className="response-list">{responses.map(response => <article key={response.id}><div><span className="tag">{response.eventDay}</span><strong>{response.category}</strong><p>{response.message}</p></div><div><b>{response.rating}/5</b><small>{response.createdAt.slice(0, 10)}</small></div></article>)}</div> : <p className="section-lead" style={{ fontSize: 15 }}>You have not submitted a participant survey yet.</p>}</section>
    </div>
  </main></PageShell>;
}
