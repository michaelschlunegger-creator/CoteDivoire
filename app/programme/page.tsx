import type{Metadata}from"next";
import Link from"next/link";
import{PageShell}from"@/components/PageShell";
import{ProgrammeExplorer}from"@/components/UltraModern";
export const metadata:Metadata={title:"Technical Program"};

const formats=[
  ["opening-plenary","Opening Plenary Session","Opening speakers, format and timing are awaiting organizer approval."],
  ["panels-special-sessions","Panels and Special Sessions","Panel topics, moderators and invited contributors are awaiting organizer approval."],
  ["topical-luncheons","Topical Luncheons","No luncheon programme, venue or access arrangement has been confirmed."],
  ["short-course","Short Course","Course subject, instructor, capacity and registration conditions remain to be announced."],
  ["technology-showcase","New Technology Showcase","Showcase format, submission process and participating organizations are pending."],
  ["core-exhibits","Core Exhibits","Core-display scope, handling arrangements and viewing times remain to be confirmed."],
] as const;

export default function ProgrammePage(){return <PageShell><main><section className="page-hero"><div className="page-hero-inner"><div className="breadcrumb"><span>Home</span><span>/</span><span>Technical Program</span></div><p className="eyebrow">DRAFT PROGRAMME FRAMEWORK</p><h1>Three days of<br/>technical progression.</h1><p>This is the authoritative programme area. Detailed timings, speakers and special-session information will be added here after organizer approval.</p></div></section>
  <section className="programme-link-band"><div><span>CONFIRMED CONTENT AREA</span><strong>Six technical themes define the symposium scope.</strong></div><Link className="button button-secondary" href="/technical-themes">Explore technical themes →</Link></section>
  <div id="at-a-glance" className="anchor-section"><ProgrammeExplorer/></div>
  <section className="content-shell programme-directory"><div className="section-head"><div><p className="eyebrow">PROGRAMME FORMATS</p><h2>Sessions and<br/>special formats.</h2></div><p className="section-lead">Items below are published once confirmed. Placeholder status is shown deliberately so no draft detail is mistaken for an official commitment.</p></div><div className="programme-format-grid">{formats.map(([id,title,copy],index)=><article id={id} className="programme-format-card anchor-section" key={id}><span>0{index+1}</span><small>AWAITING ORGANIZER CONFIRMATION</small><h3>{title}</h3><p>{copy}</p><Link href="/contact">Contact the event team →</Link></article>)}</div><div className="trust-note"><span>i</span><span>All programme sequencing is a professional draft based on the supplied technical outline. It is not a final timetable.</span></div></section>
</main></PageShell>}
