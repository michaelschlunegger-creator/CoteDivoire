"use client";

import { useEffect, useMemo, useState } from "react";

type Feedback = {
  id: number;
  name: string;
  email: string;
  userEmail: string | null;
  eventDay: string;
  rating: number;
  recommendScore: number;
  registrationRating: number;
  communicationsRating: number;
  programmeRating: number;
  technicalRelevanceRating: number;
  speakerRating: number;
  programmeBalanceRating: number;
  networkingRating: number;
  exhibitionRating: number;
  venueRating: number;
  hospitalityRating: number;
  travelInfoRating: number;
  digitalRating: number;
  conciergeRating: number;
  returnIntentRating: number;
  mostValuable: string;
  improvements: string;
  futureTopics: string;
  message: string;
  contactPermission: boolean;
  createdAt: string;
};

const ratingFields: { key: keyof Feedback; label: string; suffix?: string }[] = [
  { key: "registrationRating", label: "Registration" },
  { key: "communicationsRating", label: "Communications" },
  { key: "programmeRating", label: "Programme" },
  { key: "technicalRelevanceRating", label: "Technical relevance" },
  { key: "speakerRating", label: "Speakers" },
  { key: "programmeBalanceRating", label: "Programme balance" },
  { key: "networkingRating", label: "Networking" },
  { key: "exhibitionRating", label: "Exhibition" },
  { key: "venueRating", label: "Venue" },
  { key: "hospitalityRating", label: "Hospitality" },
  { key: "travelInfoRating", label: "Travel information" },
  { key: "digitalRating", label: "Digital experience" },
  { key: "conciergeRating", label: "Concierge" },
  { key: "returnIntentRating", label: "Return intent" },
  { key: "rating", label: "Overall" },
  { key: "recommendScore", label: "Recommendation score", suffix: "/10" },
];

export function FeedbackStudio() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/feedback", { cache: "no-store" })
      .then(response => response.json())
      .then((data: { feedback?: Feedback[] }) => setItems(data.feedback || []));
  }, []);

  const visible = useMemo(
    () => items.filter(item => `${item.name} ${item.email} ${item.eventDay} ${item.message}`.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  );

  return <section className="dashboard-card feedback-studio">
    <div className="dashboard-head">
      <div><span className="tag">ALL RESPONSES</span><h2>Participant feedback</h2><p>Review every private survey answer. Export remains available above.</p></div>
      <span className="status-pill">{items.length} responses</span>
    </div>
    <label className="participant-search"><span>Search feedback</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Participant, day or comment" /></label>
    <div className="studio-inventory">
      {visible.map(item => <details key={item.id}>
        <summary><div><strong>{item.name || item.email}</strong><small>{item.eventDay} · {item.rating}/5 overall · NPS {item.recommendScore}/10</small></div><span>{item.createdAt.slice(0, 10)}</span></summary>
        <div className="feedback-detail-grid">
          {ratingFields.map(field => <p key={String(field.key)}><strong>{field.label}</strong>{String(item[field.key] ?? "—")}{field.suffix || "/5"}</p>)}
          <p><strong>Contact permission</strong>{item.contactPermission ? "Yes" : "No"}</p>
          <article><strong>Most valuable</strong><p>{item.mostValuable}</p></article>
          <article><strong>Improvement</strong><p>{item.improvements}</p></article>
          <article><strong>Future topics</strong><p>{item.futureTopics}</p></article>
          <article><strong>Additional comments</strong><p>{item.message}</p></article>
        </div>
      </details>)}
      {!visible.length && <p className="form-status">No matching responses.</p>}
    </div>
  </section>;
}
