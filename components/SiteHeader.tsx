import Link from"next/link";
import{desc,eq,or}from"drizzle-orm";
import{getEventUser}from"@/lib/event-auth";
import{isAdminEmail}from"@/lib/admin";
import{RegisterCtaLink}from"@/components/RegisterCtaLink";
import{getDb}from"@/db";
import{registrations}from"@/db/schema";
import{participantDisplayName}from"@/lib/participant-name";
import{SITE_NAVIGATION}from"@/lib/site-navigation";
import{HeaderMenuController}from"@/components/HeaderMenuController";

export async function SiteHeader(){
  const user=await getEventUser();
  const admin=Boolean(user&&isAdminEmail(user.email));
  let participantName="Participant";
  if(user){
    try{
      const rows=await getDb().select({fullName:registrations.fullName}).from(registrations).where(or(eq(registrations.email,user.email),eq(registrations.userEmail,user.email))).orderBy(desc(registrations.createdAt)).limit(1);
      participantName=participantDisplayName(rows[0]?.fullName||user.displayName,user.email);
    }catch{}
  }

  return <header className="site-header"><HeaderMenuController/><div className="nav-shell">
    <Link className="brand" href="/" aria-label="West African Transform Margin 2027 home">
      <span className="header-logo-pair" aria-label="AAPG and EAGE">
        <span className="header-logo-canvas"><img className="header-aapg-mark" src="/images/aapg-logo.png" alt="AAPG"/></span>
        <span className="header-logo-canvas"><img className="header-eage-mark" src="/images/eage-wordmark-white.svg" alt="EAGE"/></span>
      </span>
      <span className="brand-divider"/>
      <span className="event-brand-title"><strong>West African Transform Margin Symposium</strong><small>Proven Successes and Emerging Frontiers</small></span>
    </Link>
    <nav className="desktop-nav grouped-nav" aria-label="Primary navigation">{SITE_NAVIGATION.map(group=><details className="nav-dropdown" key={group.label}><summary>{group.label}<span>⌄</span></summary><div className="nav-dropdown-panel"><div><small>EXPLORE</small><strong>{group.label}</strong><p>{group.description}</p></div><div>{group.items.map(item=><Link key={item.href} href={item.href}>{item.label}{item.status==="pending"&&<small>Pending</small>}</Link>)}</div></div></details>)}{admin&&<Link className="admin-nav-link" href="/admin">Admin</Link>}</nav>
    <div className="nav-actions">
      {user?<><Link className="text-link desktop-only account-link" href="/dashboard">{participantName}</Link><Link className="text-link desktop-only signout-link" href="/api/auth/signout">Sign out</Link></>:<Link className="text-link desktop-only" href="/signin">Participant Sign In</Link>}
      {user?<Link className="button button-small hub-button" href="/dashboard">My Hub <span>↗</span></Link>:<RegisterCtaLink className="button button-small">Register <span>↗</span></RegisterCtaLink>}
      <details className="mobile-menu"><summary aria-label="Open menu">☰</summary><div className="mobile-menu-panel">{SITE_NAVIGATION.map(group=><details className="mobile-nav-group" key={group.label}><summary>{group.label}<span>⌄</span></summary><div>{group.items.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</div></details>)}{admin&&<Link href="/admin">Organizer studio</Link>}{user?<><Link href="/dashboard">My participant hub</Link><Link href="/api/auth/signout">Sign out</Link></>:<><Link href="/register#email-verification">Register for Event</Link><Link href="/signin">Participant sign in</Link></>}</div></details>
    </div>
  </div></header>;
}
