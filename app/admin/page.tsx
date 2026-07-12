import type { Metadata } from "next";
import Link from "next/link";
import { requireEventUser } from "@/lib/event-auth";
import { isAdminEmail } from "@/lib/admin";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminStudio } from "@/components/AdminStudio";
import { participantDisplayName } from "@/lib/participant-name";
export const metadata:Metadata={title:"Organizer studio"};export const dynamic="force-dynamic";
export default async function AdminPage(){const user=await requireEventUser("/admin");const admin=isAdminEmail(user.email);const name=participantDisplayName(user.displayName,user.email);return <><SiteHeader/><main><section className="page-hero"><div className="page-hero-inner"><p className="eyebrow">ORGANIZER STUDIO</p><h1>Control with clarity.<br/>Protect with confidence.</h1><p>Welcome, {name}. Manage participant access and privacy, publish material, share event updates and monitor every operational signal.</p></div></section><div className="dashboard-shell">{admin?<><div className="dashboard-head"><div><span className="tag">SECURE ADMIN · {user.email}</span><h1>Event operations</h1></div><Link className="button button-secondary" href="/api/auth/signout">Sign out</Link></div><AdminStudio/></>:<section className="panel"><h2>Organizer access required</h2><p>You are signed in as {user.email}, but this address is not on the event administrator allowlist.</p><Link className="button" href="/dashboard">Go to participant hub</Link></section>}</div></main></>}
