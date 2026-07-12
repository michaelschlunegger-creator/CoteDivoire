import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EventSignIn } from "@/components/EventSignIn";
import { PageShell } from "@/components/PageShell";
import { getEventUser } from "@/lib/event-auth";
export const metadata:Metadata={title:"Participant sign in"};export const dynamic="force-dynamic";
export default async function SignInPage({searchParams}:{searchParams:Promise<{returnTo?:string}>}){const params=await searchParams;const returnTo=params.returnTo?.startsWith("/")&&!params.returnTo.startsWith("//")?params.returnTo:"/dashboard";if(await getEventUser())redirect(returnTo);return <PageShell><main><section className="page-hero signin-hero"><div className="page-hero-inner"><p className="eyebrow">RETURNING PARTICIPANTS</p><h1>Welcome back.</h1><p>Sign in with your verified email to continue your personal event journey.</p></div></section><div className="content-shell signin-shell"><div className="signin-intro"><span className="tag">PARTICIPANT SIGN IN</span><h2>Your event, exactly where you left it.</h2><p>Access your personal agenda, dinner and excursion reservations, official downloads, daily highlights and private feedback history.</p><p>New to the event? <a className="feature-link" href="/register#email-verification">Register for Event →</a></p></div><EventSignIn returnTo={returnTo}/></div></main></PageShell>}
