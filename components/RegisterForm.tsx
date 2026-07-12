"use client";

import{FormEvent,useMemo,useState}from"react";

export function RegisterForm({defaultEmail="",defaultName=""}:{defaultEmail?:string;defaultName?:string}){
  const[status,setStatus]=useState("");
  const[error,setError]=useState(false);
  const[busy,setBusy]=useState(false);
  const defaults=useMemo(()=>{
    const parts=defaultName.trim().includes(" ")?defaultName.trim().split(/\s+/):[];
    return{firstName:parts.slice(0,-1).join(" "),lastName:parts.at(-1)||""};
  },[defaultName]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setBusy(true);setStatus("");setError(false);
    const body=Object.fromEntries(new FormData(event.currentTarget));
    try{
      const response=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await response.json() as {error?:string};
      if(!response.ok)throw new Error(data.error||"Registration could not be submitted.");
      setStatus("Registration complete. Opening your personal participant hub…");
      window.setTimeout(()=>{window.location.href="/dashboard"},700);
    }catch(reason){
      setError(true);setStatus(reason instanceof Error?reason.message:"Please try again.");
    }finally{setBusy(false)}
  }

  return <form className="form-card registration-form" onSubmit={submit}>
    <div className="registration-form-head"><span>SECURE PARTICIPANT PROFILE</span><h2>Tell us who you are.</h2><p>Fields marked with an asterisk are required. Your verified email remains locked to this registration.</p></div>

    <section className="form-section"><div className="form-section-title"><b>01</b><span><strong>Personal details</strong><small>Your participant identity</small></span></div><div className="form-grid">
      <div className="field"><label htmlFor="firstName">First name *</label><input id="firstName" name="firstName" defaultValue={defaults.firstName} required autoComplete="given-name" placeholder="Enter your first name"/></div>
      <div className="field"><label htmlFor="lastName">Last name *</label><input id="lastName" name="lastName" defaultValue={defaults.lastName} required autoComplete="family-name" placeholder="Enter your last name"/></div>
      <div className="field full verified-email-field"><label htmlFor="email">Verified work email *</label><input id="email" name="email" type="email" defaultValue={defaultEmail} readOnly required autoComplete="email"/><span>✓ VERIFIED</span></div>
      <div className="field"><label htmlFor="jobTitle">Job title *</label><input id="jobTitle" name="jobTitle" required autoComplete="organization-title" placeholder="e.g. Senior Geophysicist"/></div>
      <div className="field"><label htmlFor="organization">Organization *</label><input id="organization" name="organization" required autoComplete="organization" placeholder="Company or institution"/></div>
      <div className="field"><label htmlFor="country">Country / market *</label><input id="country" name="country" required autoComplete="country-name" placeholder="Country of residence"/></div>
      <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="Include country code"/></div>
    </div></section>

    <section className="form-section"><div className="form-section-title"><b>02</b><span><strong>Your symposium experience</strong><small>Help us tailor your journey</small></span></div><div className="form-grid">
      <div className="field full"><label htmlFor="participationType">Participation type *</label><select id="participationType" name="participationType" required defaultValue=""><option value="" disabled>Select your participation type</option><option>Delegate</option><option>Speaker / technical contributor</option><option>Exhibitor</option><option>Sponsor / partner</option><option>Student / early career</option><option>Media</option></select></div>
      <div className="field full"><label htmlFor="interests">Technical interests</label><textarea id="interests" name="interests" placeholder="Petroleum systems, transform tectonics, seismic interpretation, deepwater exploration…"/></div>
      <div className="field"><label htmlFor="dietary">Dietary requirements</label><input id="dietary" name="dietary" placeholder="Leave blank if none"/></div>
      <div className="field"><label htmlFor="accessibility">Accessibility requirements</label><input id="accessibility" name="accessibility" placeholder="Leave blank if none"/></div>
    </div></section>

    <div className="consent-panel">
      <label className="checkbox"><input name="privacyConsent" type="checkbox" value="yes" required/><span><strong>Privacy consent *</strong>I agree to the use of my information for event registration, administration and participant services.</span></label>
      <label className="checkbox"><input name="communicationConsent" type="checkbox" value="yes"/><span><strong>Event communications</strong>I would like to receive programme, speaker and future AAPG/EAGE event updates.</span></label>
    </div>

    <div className="form-actions registration-actions"><button className="button" disabled={busy}>{busy?"Completing registration…":"Complete registration & enter hub"}<span>→</span></button>{status&&<span className={`form-status ${error?"error":""}`}>{status}</span>}</div>
    <div className="trust-note"><span>⌾</span><span>Your information is used only for event administration and participant services. Travel, accommodation and any payment information will be communicated separately by the organizers.</span></div>
  </form>;
}
