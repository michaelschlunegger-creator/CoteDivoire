import Link from "next/link";
import {PageShell} from "@/components/PageShell";
import {EventPulse} from "@/components/UltraModern";
import {SITE_NAVIGATION} from "@/lib/site-navigation";

export default function Home(){return <PageShell><main>
  <section className="save-date-hero" aria-label="West African Transform Margin Symposium save the date">
    <div className="save-date-orbit orbit-a" aria-hidden="true"/>
    <div className="save-date-orbit orbit-b" aria-hidden="true"/>
    <div className="save-date-artwork"><img src="/images/west-african-transform-key-visual.png" alt="Save the Date — AAPG and EAGE West African Transform Margin Symposium: Proven Successes and Emerging Frontiers, 19–21 April 2027 in Abidjan, Côte d’Ivoire"/></div>
    <div className="save-date-quickbar">
      <div className="save-date-status"><i/><span><small>REGISTRATION</small><strong>Join the transform-margin conversation</strong></span></div>
      <div className="save-date-facts"><span><small>WHEN</small><strong>19–21 April 2027</strong></span><span><small>WHERE</small><strong>Abidjan, Côte d’Ivoire</strong></span></div>
      <div className="save-date-ctas"><Link className="button button-gold" href="/register#email-verification">Register for Event <span>↗</span></Link><Link className="button save-date-secondary" href="/programme">View programme <span>→</span></Link></div>
    </div>
  </section>

  <div className="signal-marquee" aria-hidden="true"><div>SIERRA LEONE <span>✦</span> LIBERIA <span>✦</span> CÔTE D’IVOIRE <span>✦</span> GHANA <span>✦</span> TOGO <span>✦</span> BENIN <span>✦</span> NIGERIA <span>✦</span> WEST AFRICAN TRANSFORM MARGIN <span>✦</span></div></div>
  <EventPulse/>

  <section className="section event-gateway" data-reveal><div className="section-inner">
    <div className="section-head"><div><p className="eyebrow">EXPLORE THE SYMPOSIUM</p><h2>Everything in<br/>one clear place.</h2></div><p className="section-lead">The website is organized into four dedicated areas. Each item has one authoritative home, so programme, travel and commercial information remain easy to find and maintain.</p></div>
    <div className="gateway-grid">{SITE_NAVIGATION.map((group,index)=><article className="gateway-card" key={group.label}><div className="gateway-card-head"><span>0{index+1}</span><div><small>EVENT DIRECTORY</small><h3>{group.label}</h3></div></div><p>{group.description}</p><div className="gateway-links">{group.items.slice(0,5).map(item=><Link key={item.href} href={item.href}><span>{item.label}</span>{item.status==="pending"?<small>Pending</small>:<b>↗</b>}</Link>)}</div><Link className="gateway-open" href={group.href}>Open {group.label} <span>→</span></Link></article>)}</div>
  </div></section>

  <section className="section participant-entry" data-reveal><div className="section-inner participant-entry-inner"><div><p className="eyebrow">YOUR PERSONAL EVENT</p><h2>One sign-in.<br/>Your complete journey.</h2><p>Registered participants manage their agenda, reservations, downloads, announcements and feedback inside one private participant hub.</p></div><div className="participant-entry-actions"><Link className="button button-gold" href="/register#email-verification">Register for Event <span>↗</span></Link><Link className="button button-dark" href="/signin">Participant Sign In <span>→</span></Link></div></div></section>
</main></PageShell>}
