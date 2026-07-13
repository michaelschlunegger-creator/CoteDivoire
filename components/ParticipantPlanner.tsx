"use client";

import { FormEvent, useMemo, useState } from "react";
import { CORE_AGENDA, programmeSessionId } from "@/lib/event-program";
import type { ManagedActivity } from "@/lib/activities";

type Reminder = { id: number; dayNumber: number; reminderTime: string; note: string };
type Notice = { id: number; title: string; body: string; level: string; createdAt: string };

export function ParticipantPlanner({ initialActivityIds, initialSessionIds, initialReminders, announcements, activities }: { initialActivityIds: string[]; initialSessionIds: string[]; initialReminders: Reminder[]; announcements: Notice[]; activities: ManagedActivity[] }) {
  const [reserved, setReserved] = useState(new Set(initialActivityIds));
  const [selectedSessions, setSelectedSessions] = useState(new Set(initialSessionIds));
  const [reminders, setReminders] = useState(initialReminders);
  const [day, setDay] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const sessions = CORE_AGENDA[day] || [];
  const agenda = useMemo(() => [
    ...(CORE_AGENDA[day] || []).map(item => ({ ...item, personal: selectedSessions.has(programmeSessionId(day, item)) })),
    ...activities.filter(item => item.day === day && reserved.has(item.id)).map(item => ({ time: item.time, title: item.title, location: item.location, kind: "Your reservation", personal: true })),
    ...reminders.filter(item => item.dayNumber === day).map(item => ({ time: item.reminderTime, title: item.note, location: "Private reminder", kind: "Reminder", personal: true, reminderId: item.id })),
  ].sort((a, b) => a.time.localeCompare(b.time)), [day, reserved, selectedSessions, reminders, activities]);

  async function toggleActivity(activityId: string) {
    const active = reserved.has(activityId); setBusy(activityId); setMessage("");
    try { const response = await fetch("/api/me/activities", { method: active ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityId }) }); const data = await response.json() as { error?: string }; if (!response.ok) throw new Error(data.error || "Unable to update your reservation."); setReserved(current => { const next = new Set(current); if (active) next.delete(activityId); else next.add(activityId); return next; }); setMessage(active ? "Reservation removed from your agenda." : "Reserved and added to your personal agenda."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update your reservation."); } finally { setBusy(null); }
  }

  async function toggleSession(sessionId: string) {
    const active = selectedSessions.has(sessionId); setBusy(sessionId);
    const response = await fetch("/api/me/agenda", { method: active ? "DELETE" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "session", sessionId }) });
    if (response.ok) setSelectedSessions(current => { const next = new Set(current); if (active) next.delete(sessionId); else next.add(sessionId); return next; });
    else setMessage((await response.json() as { error?: string }).error || "Unable to update your agenda.");
    setBusy(null);
  }

  async function addReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = Object.fromEntries(new FormData(form)); setBusy("reminder");
    const response = await fetch("/api/me/agenda", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "reminder", dayNumber: Number(values.dayNumber), reminderTime: values.reminderTime, note: values.note }) });
    const data = await response.json() as { reminder?: Reminder; error?: string }; if (response.ok && data.reminder) { setReminders(current => [...current, data.reminder!]); form.reset(); setMessage("Private reminder added."); } else setMessage(data.error || "Unable to add reminder."); setBusy(null);
  }

  async function removeReminder(reminderId: number) {
    const response = await fetch("/api/me/agenda", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "reminder", reminderId }) });
    if (response.ok) setReminders(current => current.filter(item => item.id !== reminderId));
  }

  return <section className="participant-planner">
    {announcements.length > 0 && <div className="participant-announcements"><div><span className="tag">PARTICIPANT ANNOUNCEMENTS</span><h3>What you need to know.</h3></div>{announcements.map(notice => <article className={notice.level} key={notice.id}><small>{notice.level}</small><strong>{notice.title}</strong><p>{notice.body}</p><time>{notice.createdAt.slice(0, 10)}</time></article>)}</div>}
    <div className="planner-intro"><div><span className="tag">MY EVENT JOURNEY</span><h2>Build your experience.</h2><p>Select technical sessions, reserve official activities and add private reminders. Every choice updates your agenda immediately.</p></div><span className="planner-counter"><strong>{reserved.size + selectedSessions.size}</strong><small>personal choices</small></span></div>
    <div className="planner-layout"><div className="activity-market">
      <div className="planner-section-head"><div><span>TECHNICAL PROGRAMME</span><h3>Select sessions for Day {day}</h3></div></div>
      <div className="session-selection-list">{sessions.map(session => { const id = programmeSessionId(day, session); const active = selectedSessions.has(id); return <article key={id}><div><time>{session.time}</time><span><strong>{session.title}</strong><small>{session.kind} · {session.location}</small></span></div><button className={active ? "active" : ""} disabled={busy === id} onClick={() => void toggleSession(id)}>{active ? "✓ MY SESSION" : "+ Add"}</button></article>; })}</div>
      <div className="planner-section-head"><div><span>OPTIONAL EXPERIENCES</span><h3>Choose what joins your journey</h3></div></div>
      <div className="activity-grid">{activities.map(activity => { const active = reserved.has(activity.id); return <article className={`activity-card ${active ? "reserved" : ""}`} key={activity.id}><div className="activity-top"><span>{activity.type}</span><small>DAY {activity.day}</small></div><h4>{activity.title}</h4><p>{activity.description}</p><div className="activity-details"><span><b>{activity.time}</b>–{activity.endTime}</span><span>{activity.location}</span><span>{activity.capacity} places</span>{activity.isPlaceholder && <span>Details awaiting organizer approval</span>}</div><button disabled={busy === activity.id || (!activity.isOpen && !active)} onClick={() => void toggleActivity(activity.id)} className={active ? "reservation-button active" : "reservation-button"}>{busy === activity.id ? "Updating…" : active ? "✓ Reserved · Remove" : activity.isOpen ? "Reserve my place →" : "Reservations not open"}</button></article>; })}</div>
      <form className="private-reminder-form" onSubmit={addReminder}><div><span>PRIVATE REMINDER</span><h3>Add something only you can see</h3></div><select name="dayNumber" defaultValue={day} aria-label="Reminder day"><option value="1">Day 1</option><option value="2">Day 2</option><option value="3">Day 3</option></select><input name="reminderTime" type="time" defaultValue="08:00" required aria-label="Reminder time"/><input name="note" required minLength={2} maxLength={240} placeholder="Example: Meet exploration team in the lobby" aria-label="Reminder note"/><button className="button button-small" disabled={busy === "reminder"}>Add reminder</button></form>
      {message && <p className="planner-message">{message}</p>}
    </div><aside className="personal-agenda"><div className="agenda-label"><span>LIVE PERSONAL VIEW</span><i /></div><h3>Your day, at a glance.</h3><div className="agenda-tabs">{[1, 2, 3].map(number => <button className={day === number ? "active" : ""} onClick={() => setDay(number)} key={number}><small>DAY</small><strong>0{number}</strong></button>)}</div><div className="agenda-date">{day === 1 ? "19 APRIL 2027" : day === 2 ? "20 APRIL 2027" : "21 APRIL 2027"}</div><div className="agenda-stream">{agenda.map((item, index) => <div className={`agenda-entry ${item.personal ? "personal" : ""}`} key={`${item.time}-${item.title}-${index}`}><time>{item.time}</time><i /><div><small>{item.kind}</small><strong>{item.title}</strong><span>{item.location}</span></div>{item.personal && <b>{"reminderId" in item ? <button aria-label="Remove reminder" onClick={() => void removeReminder(Number(item.reminderId))}>×</button> : "YOURS"}</b>}</div>)}</div></aside></div>
  </section>;
}
