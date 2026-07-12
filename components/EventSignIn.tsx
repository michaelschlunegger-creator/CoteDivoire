"use client";

import{FormEvent,useEffect,useRef,useState}from"react";

const RESEND_WAIT_SECONDS=60;

export function EventSignIn({returnTo="/dashboard",journey="signin"}:{returnTo?:string;journey?:"signin"|"register"}){
  const[email,setEmail]=useState("");
  const[code,setCode]=useState("");
  const[step,setStep]=useState<"email"|"code">("email");
  const[status,setStatus]=useState("");
  const[busy,setBusy]=useState(false);
  const[resendWait,setResendWait]=useState(0);
  const requestInFlight=useRef(false);
  const codeInput=useRef<HTMLInputElement>(null);
  const registering=journey==="register";

  useEffect(()=>{
    if(step==="code")window.setTimeout(()=>codeInput.current?.focus(),120);
  },[step]);

  useEffect(()=>{
    const bringEmailIntoView=()=>{
      if(location.pathname!=="/register")return;
      window.setTimeout(()=>{
        document.getElementById("email-verification")?.scrollIntoView({behavior:"smooth",block:"center"});
        document.getElementById("signin-email")?.focus({preventScroll:true});
      },180);
    };
    bringEmailIntoView();
    addEventListener("hashchange",bringEmailIntoView);
    return()=>removeEventListener("hashchange",bringEmailIntoView);
  },[]);

  useEffect(()=>{
    if(resendWait<=0)return;
    const timer=window.setInterval(()=>setResendWait(value=>Math.max(0,value-1)),1000);
    return()=>window.clearInterval(timer);
  },[resendWait]);

  async function requestCode(){
    if(requestInFlight.current)return false;
    requestInFlight.current=true;
    setBusy(true);
    setStatus("");
    try{
      const response=await fetch("/api/auth/request-code",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email}),
      });
      const data=await response.json() as {error?:string};
      if(!response.ok){
        setStatus(data.error||"Unable to send code.");
        return false;
      }
      setStep("code");
      setResendWait(RESEND_WAIT_SECONDS);
      setStatus(`A new six-digit code was sent to ${email}. Use only the newest code.`);
      return true;
    }finally{
      requestInFlight.current=false;
      setBusy(false);
    }
  }

  async function send(event:FormEvent){
    event.preventDefault();
    await requestCode();
  }

  async function resend(){
    if(resendWait>0||busy)return;
    setCode("");
    await requestCode();
    window.setTimeout(()=>codeInput.current?.focus(),120);
  }

  async function verify(event:FormEvent){
    event.preventDefault();
    if(code.length!==6){
      setStatus("Enter all six digits from the newest email.");
      codeInput.current?.focus();
      return;
    }
    setBusy(true);
    setStatus("");
    const response=await fetch("/api/auth/verify-code",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,code}),
    });
    const data=await response.json() as {error?:string};
    setBusy(false);
    if(!response.ok){
      setStatus(data.error||"Unable to verify code.");
      return;
    }
    location.href=returnTo.startsWith("/")&&!returnTo.startsWith("//")?returnTo:"/dashboard";
  }

  return <div className="signin-card" id="email-verification">
    <div className="signin-security"><span>✓</span><div>
      <strong>{registering?"Step 1 of 2 · Verify your email":"Secure participant access"}</strong>
      <small>Passwordless · six-digit code · 10-minute expiry</small>
    </div></div>
    {step==="email"?<form onSubmit={send}>
      <div className="field"><label htmlFor="signin-email">Email address</label><input id="signin-email" type="email" value={email} onChange={event=>setEmail(event.target.value)} autoComplete="email" placeholder="you@company.com" required/></div>
      <button className="button" disabled={busy}>{busy?"Sending code…":registering?"Verify email to continue":"Send sign-in code"} →</button>
    </form>:<form onSubmit={verify}>
      <div className="field otp-field"><label htmlFor="signin-code">Six-digit code</label><input ref={codeInput} id="signin-code" className="otp-input" type="tel" inputMode="numeric" maxLength={6} value={code} onInput={event=>setCode(event.currentTarget.value.replace(/\D/g,"").slice(0,6))} onPaste={event=>{const digits=event.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);if(digits){event.preventDefault();setCode(digits)}}} autoComplete="one-time-code" enterKeyHint="done" placeholder="Tap to enter code" aria-describedby="otp-help" required/><small id="otp-help" className="otp-help">Tap the box and use the number keypad, or paste the complete code.</small></div>
      <button className="button" disabled={busy||code.length!==6}>{busy?"Verifying…":registering?"Continue to registration":"Enter participant hub"} →</button>
      <button className="text-button" type="button" disabled={busy||resendWait>0} onClick={resend}>{resendWait>0?`Resend code in ${resendWait}s`:"Resend a new code"}</button>
      <button className="text-button" type="button" onClick={()=>{setStep("email");setCode("");setStatus("");setResendWait(0)}}>Use a different email</button>
    </form>}
    {status&&<p className={`signin-status ${status.startsWith("A new")?"success":""}`}>{status}</p>}
    <p className="signin-note">{registering?"After verification, you will complete your event registration. Your personal participant hub is created automatically.":"Returning participants can sign in here to access their agenda, reservations, downloads and feedback."}</p>
  </div>;
}
