"use client";

import { useEffect, useMemo, useState } from "react";

type Participant = {
  email: string;
  fullName: string;
  organization: string;
  jobTitle: string;
  country: string;
  participationType: string;
  registrationStatus: string;
  registeredAt: string;
  status: "active" | "suspended" | "soft_deleted";
  note: string;
  sessionVersion: number;
  feedbackCount: number;
  reservationCount: number;
};

type AuditEntry = {
  id: number;
  adminEmail: string;
  action: string;
  targetEmail: string;
  targetReference: string;
  targetLabel: string;
  detail: string;
  createdAt: string;
};

type LifecycleAction = "suspend" | "restore" | "signout_all" | "soft_delete" | "permanent_erase";

const actionCopy: Record<LifecycleAction, { title: string; body: string; button: string }> = {
  suspend: { title: "Suspend participant access", body: "The participant will be signed out and cannot request another code until restored. Their data remains intact.", button: "Suspend access" },
  restore: { title: "Restore participant access", body: "The participant can request a new six-digit code and access their existing event data again.", button: "Restore access" },
  signout_all: { title: "Sign out all devices", body: "Every existing browser session for this participant will be invalidated. They can sign in again with a new code.", button: "Sign out all devices" },
  soft_delete: { title: "Soft-delete participant", body: "The participant will be hidden from active operations and blocked from signing in. Their data remains recoverable.", button: "Soft delete" },
  permanent_erase: { title: "Permanently erase participant", body: "This permanently removes the Supabase identity and all participant registration, agenda, reservation, feedback and profile data. It cannot be undone.", button: "Permanently erase" },
};

const actionName = (action: string) => action.replace("participant.", "").replaceAll("_", " ").replace(/^./, value => value.toUpperCase());

export function ParticipantManagement() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [permanentReady, setPermanentReady] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"participants" | "audit">("participants");
  const [selected, setSelected] = useState<{ participant: Participant; action: LifecycleAction } | null>(null);
  const [note, setNote] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [participantResponse, auditResponse] = await Promise.all([
      fetch("/api/admin/participants", { cache: "no-store" }),
      fetch("/api/admin/audit", { cache: "no-store" }),
    ]);
    const participantData = await participantResponse.json() as { participants?: Participant[]; permanentErasureReady?: boolean; error?: string };
    const auditData = await auditResponse.json() as { entries?: AuditEntry[] };
    if (!participantResponse.ok) throw new Error(participantData.error || "Participant management could not be loaded.");
    setParticipants(participantData.participants || []);
    setPermanentReady(Boolean(participantData.permanentErasureReady));
    setAudit(auditData.entries || []);
  }

  // Initial client hydration intentionally loads protected admin data after mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load().catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load participant management.")); }, []);

  const filtered = useMemo(() => participants.filter(participant => {
    const matchesStatus = filter === "all" || participant.status === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [participant.fullName, participant.email, participant.organization, participant.country].some(value => value.toLowerCase().includes(needle));
    return matchesStatus && matchesQuery;
  }), [participants, query, filter]);

  const counts = useMemo(() => ({
    active: participants.filter(item => item.status === "active").length,
    suspended: participants.filter(item => item.status === "suspended").length,
    softDeleted: participants.filter(item => item.status === "soft_deleted").length,
  }), [participants]);

  function openAction(participant: Participant, action: LifecycleAction) {
    setSelected({ participant, action });
    setNote("");
    setConfirmationEmail("");
    setConfirmationPhrase("");
    setMessage("");
    setError("");
  }

  async function performAction() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: selected.action, email: selected.participant.email, note, confirmationEmail, confirmationPhrase }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The participant action could not be completed.");
      setMessage(`${actionCopy[selected.action].button} completed for ${selected.participant.fullName}.`);
      setSelected(null);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The participant action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  const permanentConfirmed = selected?.action !== "permanent_erase" || (confirmationEmail.trim().toLowerCase() === selected.participant.email && confirmationPhrase === "PERMANENTLY ERASE");

  return <section className="dashboard-card participant-management">
    <div className="dashboard-head participant-management-head">
      <div><span className="tag">PARTICIPANT LIFECYCLE</span><h2>Participant management</h2><p>Control access, sessions, retention and participant privacy from one protected workspace.</p></div>
      <span className="status-pill">Server-authorized</span>
    </div>

    <div className="admin-view-tabs" role="tablist" aria-label="Participant management views">
      <button className={view === "participants" ? "active" : ""} onClick={() => setView("participants")}>Participants</button>
      <button className={view === "audit" ? "active" : ""} onClick={() => setView("audit")}>Audit log <span>{audit.length}</span></button>
    </div>

    {message && <p className="admin-notice success">{message}</p>}
    {error && <p className="admin-notice error">{error}</p>}

    {view === "participants" ? <>
      <div className="participant-control-bar">
        <label className="participant-search"><span>Search participants</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Name, email, organization or country" /></label>
        <div className="participant-filters" aria-label="Filter participant status">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All <b>{participants.length}</b></button>
          <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>Active <b>{counts.active}</b></button>
          <button className={filter === "suspended" ? "active" : ""} onClick={() => setFilter("suspended")}>Suspended <b>{counts.suspended}</b></button>
          <button className={filter === "soft_deleted" ? "active" : ""} onClick={() => setFilter("soft_deleted")}>Archived <b>{counts.softDeleted}</b></button>
        </div>
      </div>

      {!permanentReady && <div className="admin-readiness"><span>◆</span><div><strong>Permanent identity erasure is safely locked.</strong><p>Add the private Supabase service-role key to production to activate irreversible identity deletion. All reversible controls already work.</p></div></div>}

      <div className="participant-table" role="table" aria-label="Event participants">
        <div className="participant-table-row participant-table-header" role="row"><span>Participant</span><span>Event record</span><span>Status</span><span>Controls</span></div>
        {filtered.length ? filtered.map(participant => <div className="participant-table-row" role="row" key={participant.email}>
          <div className="participant-identity"><strong>{participant.fullName}</strong><a href={`mailto:${participant.email}`}>{participant.email}</a><small>{[participant.jobTitle, participant.organization].filter(Boolean).join(" · ") || "Registration not completed"}</small></div>
          <div className="participant-record"><strong>{participant.participationType}</strong><small>{participant.country || "Country pending"}</small><div><span>{participant.reservationCount} reservations</span><span>{participant.feedbackCount} feedback</span></div></div>
          <div><span className={`lifecycle-status ${participant.status}`}>{participant.status === "soft_deleted" ? "Archived" : participant.status}</span>{participant.note && <small className="lifecycle-note">{participant.note}</small>}</div>
          <div className="participant-actions">
            <a className="admin-action" href={`/api/admin/participants/export?email=${encodeURIComponent(participant.email)}`}>Export</a>
            {participant.status === "active" && <button className="admin-action" onClick={() => openAction(participant, "suspend")}>Suspend</button>}
            {participant.status !== "active" && <button className="admin-action positive" onClick={() => openAction(participant, "restore")}>Restore</button>}
            {participant.status !== "soft_deleted" && <button className="admin-action" onClick={() => openAction(participant, "signout_all")}>Sign out all</button>}
            {participant.status !== "soft_deleted" && <button className="admin-action warning" onClick={() => openAction(participant, "soft_delete")}>Soft delete</button>}
            {participant.status === "soft_deleted" && <button className="admin-action danger" disabled={!permanentReady} onClick={() => openAction(participant, "permanent_erase")}>Erase permanently</button>}
          </div>
        </div>) : <div className="participant-empty"><span>✦</span><strong>No participants match this view.</strong><p>Adjust the search or status filter.</p></div>}
      </div>
    </> : <div className="audit-panel">
      <div className="audit-intro"><div><strong>Append-only administrative history</strong><p>Every participant access and retention action records the administrator, target, action and time. Participant identifiers are pseudonymized after permanent erasure.</p></div><span>{audit.length} recent actions</span></div>
      <div className="audit-list">{audit.length ? audit.map(entry => <article key={entry.id}><span className="audit-mark" aria-hidden="true">✓</span><div><strong>{actionName(entry.action)}</strong><p>{entry.targetLabel}{entry.targetEmail ? ` · ${entry.targetEmail}` : entry.targetReference ? ` · ${entry.targetReference}` : ""}</p></div><div className="audit-meta"><strong>{entry.adminEmail}</strong><time>{entry.createdAt.slice(0, 16).replace("T", " ")} UTC</time></div></article>) : <div className="participant-empty"><span>✦</span><strong>No lifecycle actions recorded yet.</strong><p>The first administrative action will appear here automatically.</p></div>}</div>
    </div>}

    {selected && <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setSelected(null); }}>
      <section className={`admin-modal ${selected.action === "permanent_erase" ? "danger" : ""}`} role="dialog" aria-modal="true" aria-labelledby="lifecycle-modal-title">
        <button className="admin-modal-close" onClick={() => setSelected(null)} disabled={busy} aria-label="Close">×</button>
        <span className="tag">PROTECTED ADMIN ACTION</span>
        <h2 id="lifecycle-modal-title">{actionCopy[selected.action].title}</h2>
        <p>{actionCopy[selected.action].body}</p>
        <div className="modal-participant"><strong>{selected.participant.fullName}</strong><span>{selected.participant.email}</span></div>
        {selected.action !== "signout_all" && selected.action !== "permanent_erase" && <label className="modal-field"><span>Administrative note <small>optional</small></span><textarea value={note} onChange={event => setNote(event.target.value)} placeholder="Reason or internal note" maxLength={500} /></label>}
        {selected.action === "permanent_erase" && <div className="permanent-confirmation">
          <p><strong>Step 1:</strong> Type the participant’s complete email address.</p>
          <input value={confirmationEmail} onChange={event => setConfirmationEmail(event.target.value)} placeholder={selected.participant.email} autoComplete="off" />
          <p><strong>Step 2:</strong> Type <code>PERMANENTLY ERASE</code></p>
          <input value={confirmationPhrase} onChange={event => setConfirmationPhrase(event.target.value)} placeholder="PERMANENTLY ERASE" autoComplete="off" />
        </div>}
        {error && <p className="admin-notice error">{error}</p>}
        <div className="admin-modal-actions"><button className="button button-secondary" onClick={() => setSelected(null)} disabled={busy}>Cancel</button><button className={`button ${selected.action === "permanent_erase" || selected.action === "soft_delete" ? "button-danger" : "button-dark"}`} onClick={performAction} disabled={busy || !permanentConfirmed}>{busy ? "Processing…" : actionCopy[selected.action].button}</button></div>
      </section>
    </div>}
  </section>;
}
