import type{Metadata}from"next";
import{getFreshRegistrationUser}from"@/lib/event-auth";
import{PageShell}from"@/components/PageShell";
import{RegisterForm}from"@/components/RegisterForm";
import{EventSignIn}from"@/components/EventSignIn";

export const metadata:Metadata={title:"Register for Event"};
export const dynamic="force-dynamic";

const journey=[
  {number:"01",title:"Verify your email",copy:"A secure six-digit access code"},
  {number:"02",title:"Create your event profile",copy:"Your participation details"},
  {number:"03",title:"Enter your personal hub",copy:"Agenda, reservations and resources"},
];

export default async function RegisterPage(){
  const user=await getFreshRegistrationUser();
  return <PageShell><main className="register-page">
    <section className="register-cinematic-hero">
      <div className="register-hero-grid" aria-hidden="true"/>
      <div className="register-hero-inner">
        <div className="register-hero-copy">
          <div className="breadcrumb"><span>Home</span><span>/</span><span>Register</span></div>
          <p className="eyebrow">AAPG × EAGE · ABIDJAN 2027</p>
          <h1>{user?<>Complete your<br/><em>event pass.</em></>:<>Secure your place<br/><em>on the margin.</em></>}</h1>
          <p className="register-hero-lead">{user?"Your email is verified. Complete your participant profile to unlock your private symposium experience.":"One verified email unlocks registration, your personal agenda, curated activities and participant-only resources."}</p>
          <div className="register-event-facts">
            <span><small>WHEN</small><strong>19–21 APR 2027</strong></span>
            <span><small>WHERE</small><strong>ABIDJAN · CÔTE D’IVOIRE</strong></span>
            <span><small>FORMAT</small><strong>3-DAY TECHNICAL SYMPOSIUM</strong></span>
          </div>
        </div>
        <aside className="register-visual-console" aria-label="West African Transform Margin event overview">
          <div className="register-console-top"><span><i/> REGISTRATION ACCESS</span><b>WAT / 27</b></div>
          <div className="register-margin-scan" aria-hidden="true"><i/><i/><i/><i/><span/></div>
          <div className="register-console-copy">
            <small>ATLANTIC TRANSFORM MARGIN</small>
            <strong>Seven-country<br/>regional focus</strong>
            <p>Sierra Leone · Liberia · Côte d’Ivoire · Ghana · Togo · Benin · Nigeria</p>
          </div>
          <div className="register-console-foot"><span>DEEPWATER</span><span>TECTONICS</span><span>EXPLORATION</span></div>
        </aside>
      </div>
    </section>

    <section className="registration-stage">
      <div className="registration-glow" aria-hidden="true"/>
      {user?<div className="content-shell two-col register-complete-shell">
        <aside className="register-story sticky-intro">
          <span className="register-step-label">STEP 02 · PARTICIPANT PROFILE</span>
          <h2>Shape the experience around you.</h2>
          <p>Your verified email connects this registration to your private agenda, activity reservations, resources and feedback.</p>
          <div className="trust-note register-trust"><span>✓</span><span>Verified as <strong>{user.email}</strong></span></div>
        </aside>
        <RegisterForm defaultEmail={user.email} defaultName={user.displayName}/>
      </div>:<div className="content-shell signin-shell register-verify-shell">
        <div className="register-story">
          <span className="register-step-label">STEP 01 · SECURE ACCESS</span>
          <h2>Your complete event journey starts here.</h2>
          <p>Verify once, then move directly into registration and your private participant hub.</p>
          <div className="journey-steps modern-journey">{journey.map((item,index)=><div className={index===0?"active":""} key={item.number}><b>{item.number}</b><span><strong>{item.title}</strong><small>{item.copy}</small></span><i>{index===0?"NOW":"→"}</i></div>)}</div>
          <div className="register-security-row"><span>● PRIVATE</span><span>● PASSWORDLESS</span><span>● MOBILE READY</span></div>
        </div>
        <EventSignIn journey="register" returnTo="/register"/>
      </div>}
    </section>
  </main></PageShell>;
}
