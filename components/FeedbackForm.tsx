"use client";

import { FormEvent, useState } from "react";

const requiredQuestions = [
  "registrationRating", "communicationsRating", "programmeRating", "technicalRelevanceRating", "speakerRating",
  "programmeBalanceRating", "networkingRating", "exhibitionRating", "venueRating", "hospitalityRating",
  "travelInfoRating", "digitalRating", "conciergeRating", "returnIntentRating", "rating", "recommendScore",
  "mostValuable", "improvements", "futureTopics", "message",
];

const scaleLabels = [
  { value: 1, label: "Poor" }, { value: 2, label: "Fair" }, { value: 3, label: "Good" },
  { value: 4, label: "Very good" }, { value: 5, label: "Excellent" }, { value: 0, label: "N/A" },
];

export function FeedbackForm({ email, defaultName = "" }: { email: string; defaultName?: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  function updateProgress(form: HTMLFormElement) {
    const data = new FormData(form);
    const answered = requiredQuestions.filter(name => String(data.get(name) ?? "").trim().length > 0).length;
    setProgress(Math.round((answered / requiredQuestions.length) * 100));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    setError(false);
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "The survey could not be submitted.");
      setSubmitted(true);
      setProgress(100);
      form.reset();
    } catch (reason) {
      setError(true);
      setStatus(reason instanceof Error ? reason.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) return <section className="survey-complete">
    <div className="survey-complete-mark">✓</div>
    <span className="tag">RESPONSE SECURELY SAVED</span>
    <h2>Thank you for raising the standard.</h2>
    <p>Your complete 20-question response is linked to your verified participant account and is visible only to you and authorized event administrators.</p>
    <div className="survey-complete-actions"><a className="button" href="/dashboard">Return to participant hub</a><button className="button button-secondary" onClick={() => { setSubmitted(false); setProgress(0); }}>Submit another response</button></div>
  </section>;

  return <form className="feedback-survey-pro" onSubmit={submit} onInput={event => updateProgress(event.currentTarget)}>
    <header className="survey-form-header">
      <div className="signed-in-as"><span>✓</span><div><small>VERIFIED PARTICIPANT</small><strong>{defaultName}</strong><p>{email}</p></div></div>
      <div className="survey-progress"><div><span>Survey progress</span><strong>{progress}%</strong></div><div className="survey-progress-track"><i style={{ width: `${progress}%` }} /></div><small>20 questions · approximately 6 minutes</small></div>
    </header>

    <input type="hidden" name="name" value={defaultName} readOnly />
    <input type="hidden" name="category" value="Comprehensive participant survey" readOnly />

    <section className="survey-context">
      <div><span className="survey-kicker">RESPONSE CONTEXT</span><h2>Which stage are you evaluating?</h2><p>You may submit a response after each day and again after the complete symposium.</p></div>
      <label><span>Survey timing</span><select name="eventDay" defaultValue="Overall event"><option>Before the event</option><option>Day 1</option><option>Day 2</option><option>Day 3</option><option>Overall event</option></select></label>
    </section>

    <SurveySection number="01" eyebrow="BEFORE ARRIVAL" title="Registration and communication" description="Evaluate the experience from initial interest through arrival preparation.">
      <RatingQuestion number={1} name="registrationRating" title="How easy and professional was the event registration process?" />
      <RatingQuestion number={2} name="communicationsRating" title="How clear and timely were the pre-event communications?" />
    </SurveySection>

    <SurveySection number="02" eyebrow="TECHNICAL VALUE" title="Programme and expertise" description="Help the technical committee understand where the programme delivered the greatest professional value.">
      <RatingQuestion number={3} name="programmeRating" title="How would you rate the overall quality of the technical programme?" />
      <RatingQuestion number={4} name="technicalRelevanceRating" title="How relevant was the content to your professional work and interests?" />
      <RatingQuestion number={5} name="speakerRating" title="How would you rate the expertise and delivery of speakers and moderators?" />
      <RatingQuestion number={6} name="programmeBalanceRating" title="How effective was the balance of regional frameworks, case studies and emerging workflows?" />
    </SurveySection>

    <SurveySection number="03" eyebrow="EVENT EXPERIENCE" title="Connections, venue and hospitality" description="Assess the environment created for learning, exchange and meaningful industry connections.">
      <RatingQuestion number={7} name="networkingRating" title="How valuable were the networking opportunities?" />
      <RatingQuestion number={8} name="exhibitionRating" title="How relevant was the sponsor and exhibition experience?" />
      <RatingQuestion number={9} name="venueRating" title="How would you rate the venue, room setup and on-site logistics?" />
      <RatingQuestion number={10} name="hospitalityRating" title="How would you rate the catering and event hospitality?" />
    </SurveySection>

    <SurveySection number="04" eyebrow="PARTICIPANT SUPPORT" title="Travel and digital experience" description="Evaluate the information and tools supporting your complete event journey.">
      <RatingQuestion number={11} name="travelInfoRating" title="How useful were the travel, hotel and arrival information?" />
      <RatingQuestion number={12} name="digitalRating" title="How easy was it to use the website, participant hub and downloads?" />
      <RatingQuestion number={13} name="conciergeRating" title="How useful was the event concierge when looking for information?" />
    </SurveySection>

    <SurveySection number="05" eyebrow="OVERALL IMPACT" title="Loyalty and recommendation" description="Your overall assessment helps the organizers benchmark event quality and future demand.">
      <RatingQuestion number={14} name="returnIntentRating" title="How likely are you to attend another AAPG/EAGE technical event?" />
      <RatingQuestion number={15} name="rating" title="How would you rate your overall symposium experience?" allowNa={false} />
      <NpsQuestion number={16} />
    </SurveySection>

    <SurveySection number="06" eyebrow="YOUR PERSPECTIVE" title="What should we preserve or change?" description="Specific examples are especially valuable to the organizing and technical committees.">
      <TextQuestion number={17} name="mostValuable" title="What was the most valuable part of your experience?" placeholder="A technical insight, session, connection, workflow or event moment…" />
      <TextQuestion number={18} name="improvements" title="What is the single most important improvement we should make?" placeholder="Tell us what would make the next edition materially stronger…" />
      <TextQuestion number={19} name="futureTopics" title="Which technical topics, regions or case studies should future programmes cover?" placeholder="Themes, basins, technologies, discoveries or workflow challenges…" />
      <TextQuestion number={20} name="message" title="Is there anything else the organizers should know?" placeholder="Additional comments, requests or context for your ratings…" />
    </SurveySection>

    <section className="survey-consent">
      <label><input name="contactPermission" type="checkbox" value="yes" /><span><strong>The event team may contact me about this response.</strong><small>This is optional. Your survey remains private whether or not you provide permission.</small></span></label>
      <div className="survey-privacy"><span>⌾</span><p><strong>Private by design.</strong> Your response is associated with your verified email. Only you and approved event administrators can view the individual submission.</p></div>
    </section>

    <footer className="survey-submit-bar">
      <div><strong>{progress === 100 ? "Ready to submit" : `${progress}% complete`}</strong><span>All 20 numbered questions are required. Select N/A where appropriate.</span></div>
      <button className="button" disabled={busy || progress < 100}>{busy ? "Saving securely…" : "Submit confidential survey"}</button>
    </footer>
    {status && <p className={`form-status survey-error ${error ? "error" : ""}`}>{status}</p>}
  </form>;
}

function SurveySection({ number, eyebrow, title, description, children }: { number: string; eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="survey-section"><header><span>{number}</span><div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div></header><div className="survey-questions">{children}</div></section>;
}

function RatingQuestion({ number, name, title, allowNa = true }: { number: number; name: string; title: string; allowNa?: boolean }) {
  const options = allowNa ? scaleLabels : scaleLabels.filter(option => option.value !== 0);
  return <fieldset className="survey-question"><legend><span>Q{String(number).padStart(2, "0")}</span>{title}<b>Required</b></legend><div className="rating-scale">{options.map(option => <label key={option.value}><input type="radio" name={name} value={option.value} required /><span><strong>{option.value === 0 ? "—" : option.value}</strong><small>{option.label}</small></span></label>)}</div></fieldset>;
}

function NpsQuestion({ number }: { number: number }) {
  return <fieldset className="survey-question nps-question"><legend><span>Q{String(number).padStart(2, "0")}</span>How likely are you to recommend this symposium to a colleague?<b>Required</b></legend><div className="nps-labels"><span>Not at all likely</span><span>Extremely likely</span></div><div className="nps-scale">{Array.from({ length: 11 }, (_, value) => <label key={value}><input type="radio" name="recommendScore" value={value} required /><span>{value}</span></label>)}</div></fieldset>;
}

function TextQuestion({ number, name, title, placeholder }: { number: number; name: string; title: string; placeholder: string }) {
  return <label className="survey-question survey-text-question"><span className="survey-text-label"><i>Q{String(number).padStart(2, "0")}</i><strong>{title}</strong><b>Required</b></span><textarea name={name} required minLength={3} placeholder={placeholder} /></label>;
}
