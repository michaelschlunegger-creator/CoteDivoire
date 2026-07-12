import type{Metadata}from"next";
import Link from"next/link";
import{PageShell}from"@/components/PageShell";
export const metadata:Metadata={title:"Exhibit and Sponsor"};
const commercial=[
  ["exhibit-space","Exhibit Space","Space options, dimensions, inclusions, pricing and technical services are awaiting organizer approval."],
  ["sponsorship-opportunities","Sponsorship Opportunities","Official packages, benefits, availability and pricing will be published in the approved prospectus."],
  ["exhibitor-list","Exhibitor List and Floor Plan","No exhibitors or floor plan are currently confirmed for publication."],
  ["sponsors","Sponsors","No organization is currently presented as a confirmed sponsor."],
  ["exhibitor-manual","Exhibitor Manual","The approved logistics, safety, delivery and build guidance has not yet been issued."],
  ["brand-builders","Brand Builders","Brand activation opportunities and production specifications remain to be announced."],
  ["exhibitor-registration","Exhibitor Registration","Exhibitor booking and registration are not yet open."],
] as const;
export default function SponsorsPage(){return <PageShell><main><section className="page-hero"><div className="page-hero-inner"><div className="breadcrumb"><span>Home</span><span>/</span><span>Exhibit & Sponsor</span></div><p className="eyebrow">COMMERCIAL PARTICIPATION</p><h1>Position your expertise<br/>along the margin.</h1><p>This is the authoritative area for exhibition and sponsorship information. Nothing is presented as confirmed before organizer approval.</p></div></section><section className="content-shell commercial-directory"><div className="commercial-grid">{commercial.map(([id,title,copy],index)=><article id={id} className="commercial-card anchor-section" key={id}><div><span>0{index+1}</span><small>INFORMATION PENDING</small></div><h2>{title}</h2><p>{copy}</p>{id==="sponsorship-opportunities"||id==="exhibit-space"?<Link className="feature-link" href="/contact">Contact the event team →</Link>:null}</article>)}</div></section></main></PageShell>}
