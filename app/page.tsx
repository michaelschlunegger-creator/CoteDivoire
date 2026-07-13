import Link from "next/link";
import {PageShell} from "@/components/PageShell";
import {RegionalFocusBand} from "@/components/RegionalFocusBand";

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
    <RegionalFocusBand/>
  </section>

  <section className="pulse-section" data-countdown-target="2027-04-19T09:00:00+00:00" data-reveal><div className="pulse-orbit orbit-one"/><div className="pulse-orbit orbit-two"/><div className="pulse-inner"><div className="pulse-copy"><span className="live-label"><i/> THE COUNTDOWN IS ON</span><h2>Abidjan becomes the centre of the transform-margin conversation.</h2><p>New programme releases, speaker announcements and participant materials will appear here as they are confirmed by AAPG and EAGE.</p><Link href="/register#email-verification" className="magnetic-link">Register for Event <span>↗</span></Link></div><div className="countdown" aria-label="Countdown to 19 April 2027"><div className="time-block"><strong data-countdown-unit="days">00</strong><span>Days</span></div><div className="time-block"><strong data-countdown-unit="hours">00</strong><span>Hours</span></div><div className="time-block"><strong data-countdown-unit="minutes">00</strong><span>Minutes</span></div><div className="time-block"><strong data-countdown-unit="seconds">00</strong><span>Seconds</span></div></div></div></section>

  <section className="abstracts-callout-section" aria-labelledby="abstracts-callout-title">
    <div className="abstracts-callout" data-reveal>
      <div className="abstracts-callout-copy">
        <h2 id="abstracts-callout-title">Call for Abstracts <em>Opening Soon</em></h2>
      </div>
      <div className="abstracts-callout-art" aria-hidden="true">
        <span className="abstracts-orbit abstracts-orbit-one"/>
        <span className="abstracts-orbit abstracts-orbit-two"/>
        <span className="abstract-sheet abstract-sheet-back"/>
        <span className="abstract-sheet abstract-sheet-front"><i/><i/><i/><b>+</b></span>
        <span className="abstracts-status">Opening soon</span>
      </div>
    </div>
  </section>
</main></PageShell>}
