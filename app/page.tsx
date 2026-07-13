import Link from "next/link";
import {PageShell} from "@/components/PageShell";

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

  <section className="section participant-entry" data-reveal><div className="section-inner participant-entry-inner"><div><p className="eyebrow">YOUR PERSONAL EVENT</p><h2>One sign-in.<br/>Your complete journey.</h2><p>Registered participants manage their agenda, reservations, downloads, announcements and feedback inside one private participant hub.</p></div><div className="participant-entry-actions"><Link className="button button-gold" href="/register#email-verification">Register for Event <span>↗</span></Link><Link className="button button-dark" href="/signin">Participant Sign In <span>→</span></Link></div></div></section>
</main></PageShell>}
