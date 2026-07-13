"use client";

import { FormEvent, useEffect, useState } from "react";
import type { ManagedActivity } from "@/lib/activities";

type Activity = ManagedActivity;

function formActivity(form: HTMLFormElement, fallback: Activity): Activity {
  const values = Object.fromEntries(new FormData(form));
  const placeholder = values.isPlaceholder === "yes";
  return {
    ...fallback,
    title: String(values.title), type: String(values.type) as Activity["type"], day: Number(values.day),
    date: String(values.date), time: String(values.time), endTime: String(values.endTime),
    location: String(values.location), description: String(values.description), capacity: Number(values.capacity),
    isPlaceholder: placeholder, isOpen: !placeholder && values.isOpen === "yes",
  };
}

export function ActivityStudio() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");
  const load = () => fetch("/api/admin/activities", { cache: "no-store" }).then(r => r.json()).then((d: { activities?: Activity[] }) => setActivities(d.activities || []));
  useEffect(() => { void load(); }, []);

  async function save(activity: Activity, method: "POST" | "PATCH" = "PATCH") {
    setBusy(activity.id || "new"); setStatus("");
    const response = await fetch("/api/admin/activities", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(activity) });
    const data = await response.json() as { error?: string };
    setStatus(response.ok ? `${activity.title} saved.` : data.error || "Unable to save activity.");
    setBusy(""); if (response.ok) await load();
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const empty: Activity = { id: "", day: 1, date: "2027-04-19", time: "18:00", endTime: "20:00", title: "", type: "Networking", location: "To be confirmed", description: "", capacity: 50, isOpen: false, isPlaceholder: true, sortOrder: activities.length };
    const activity = formActivity(event.currentTarget, empty);
    await save(activity, "POST");
    if (activity.title) event.currentTarget.reset();
  }

  return <section className="dashboard-card activity-studio">
    <div className="dashboard-head"><div><span className="tag">EXPERIENCE CONTROL</span><h2>Dinners, receptions & excursions</h2><p>Placeholders remain closed automatically. Confirm the details before opening reservations.</p></div><span className="status-pill">Admin only</span></div>
    {status && <p className="admin-notice success">{status}</p>}
    <div className="activity-admin-list">{activities.map(activity => <ActivityEditor key={activity.id} activity={activity} busy={busy === activity.id} onSave={save} />)}</div>
    <details className="admin-create-panel"><summary>Create another activity <span>＋</span></summary>
      <form className="form-grid recap-create" onSubmit={create}><ActivityFields activity={{ id: "", day: 1, date: "2027-04-19", time: "18:00", endTime: "20:00", title: "", type: "Networking", location: "To be confirmed", description: "", capacity: 50, isOpen: false, isPlaceholder: true, sortOrder: activities.length }} /><div className="form-actions field full"><button className="button button-dark" disabled={busy === "new"}>Create draft activity</button></div></form>
    </details>
  </section>;
}

function ActivityEditor({ activity, busy, onSave }: { activity: Activity; busy: boolean; onSave: (activity: Activity) => Promise<void> }) {
  return <details className="activity-admin-card"><summary><div><strong>{activity.title}</strong><small>Day {activity.day} · {activity.time} · {activity.capacity} places · {activity.location}</small></div><div><span className={`recap-status ${activity.isPlaceholder ? "" : "published"}`}>{activity.isPlaceholder ? "Placeholder" : "Confirmed"}</span><span className={`lifecycle-status ${activity.isOpen ? "active" : "suspended"}`}>{activity.isOpen ? "Open" : "Closed"}</span></div></summary>
    <form className="form-grid activity-edit-form" onSubmit={event => { event.preventDefault(); void onSave(formActivity(event.currentTarget, activity)); }}><ActivityFields activity={activity} /><div className="form-actions field full"><button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Save activity"}</button></div></form>
  </details>;
}

function ActivityFields({ activity }: { activity: Activity }) {
  return <><div className="field full"><label>Activity title</label><input name="title" required defaultValue={activity.title} placeholder="New official activity" /></div><div className="field"><label>Type</label><select name="type" defaultValue={activity.type}><option>Networking</option><option>Dinner</option><option>Reception</option><option>Excursion</option></select></div><div className="field"><label>Day</label><select name="day" defaultValue={activity.day}><option value="1">Day 1</option><option value="2">Day 2</option><option value="3">Day 3</option></select></div><div className="field"><label>Date</label><input name="date" type="date" defaultValue={activity.date} required /></div><div className="field"><label>Capacity</label><input name="capacity" type="number" min="0" defaultValue={activity.capacity} required /></div><div className="field"><label>Start</label><input name="time" type="time" defaultValue={activity.time} required /></div><div className="field"><label>End</label><input name="endTime" type="time" defaultValue={activity.endTime} required /></div><div className="field full"><label>Venue / departure point</label><input name="location" defaultValue={activity.location} required /></div><div className="field full"><label>Description</label><textarea name="description" defaultValue={activity.description} /></div><div className="activity-confirmation field full"><label className="checkbox"><input name="isPlaceholder" type="checkbox" value="yes" defaultChecked={activity.isPlaceholder} /><span><strong>Details are still placeholders</strong>Keep this selected until the organizer has approved the complete activity.</span></label><label className="checkbox"><input name="isOpen" type="checkbox" value="yes" defaultChecked={activity.isOpen} /><span><strong>Open reservations</strong>This is ignored while the activity remains a placeholder.</span></label></div></>;
}
