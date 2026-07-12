"use client";

import{MouseEvent,ReactNode}from"react";
import Link from"next/link";

export function RegisterCtaLink({className,children}:{className?:string;children:ReactNode}){
  function handleClick(event:MouseEvent<HTMLAnchorElement>){
    if(location.pathname!=="/register")return;
    event.preventDefault();
    history.replaceState(null,"","/register#email-verification");
    document.getElementById("email-verification")?.scrollIntoView({behavior:"smooth",block:"center"});
    window.setTimeout(()=>document.getElementById("signin-email")?.focus({preventScroll:true}),450);
  }
  return <Link className={className} href="/register#email-verification" onClick={handleClick}>{children}</Link>;
}
