import type{Metadata}from"next";
import Link from"next/link";
import{PageShell}from"@/components/PageShell";
import{COMMITTEE}from"@/lib/event-content";

export const metadata:Metadata={title:"Speakers & Technical Committee"};

function initials(name:string){return name.replace(/\([^)]*\)/g,"").split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase()}

export default function SpeakersPage(){
  const chairs=COMMITTEE.filter(([,role])=>role==="Co-Chair");
  const members=COMMITTEE.filter(([,role])=>role!=="Co-Chair");
  return <PageShell><main>
    <section className="page-hero speakers-hero"><div className="page-hero-inner"><div className="breadcrumb"><span>Home</span><span>/</span><span>Speakers</span></div><p className="eyebrow">SPEAKERS & TECHNICAL COMMITTEE</p><h1>Technical voices<br/>shaping the programme.</h1><p>The speaker programme is awaiting formal organizer approval. The verified symposium committee is presented below from the supplied 03 July 2026 roster.</p></div></section>
    <section className="content-shell speakers-shell">
      <div className="speaker-status-panel"><div><span className="live-label"><i/> PROGRAMME IN DEVELOPMENT</span><h2>Speaker announcements will appear here as they are confirmed.</h2><p>No committee member is represented as a confirmed speaker unless separately approved by AAPG and EAGE.</p></div><Link className="button" href="/register#email-verification">Register for updates <span>↗</span></Link></div>

      <div className="speaker-section-head"><div><p className="eyebrow">SYMPOSIUM LEADERSHIP</p><h2>Technical co-chairs</h2></div><p>Leading the regional technical committee and programme-development process.</p></div>
      <div className="chair-grid">{chairs.map(([name,role,company],index)=><article className="chair-card" key={name}><div className={`chair-monogram tone-${index+1}`}><span>{initials(name)}</span><i/></div><div><small>{role}</small><h3>{name}</h3><p>{company}</p></div><b>0{index+1}</b></article>)}</div>

      <div className="speaker-section-head committee-heading"><div><p className="eyebrow">VERIFIED ORGANIZER ROSTER</p><h2>Technical committee</h2></div><p>Regional and international expertise spanning operators, service companies, data providers and professional associations.</p></div>
      <div className="speaker-committee-grid">{members.map(([name,role,company])=><article className="speaker-committee-card" key={`${name}-${company}`}><span>{initials(name)}</span><div><small>{role}</small><strong>{name}</strong><p>{company}</p></div></article>)}</div>
    </section>
  </main></PageShell>;
}
