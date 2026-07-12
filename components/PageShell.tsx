import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { EventConcierge } from "./EventConcierge";
import { ModernEffects } from "./UltraModern";
import { AuthLinkHandler } from "./AuthLinkHandler";

export function PageShell({ children }: { children: ReactNode }) {
  return <><AuthLinkHandler/><ModernEffects /><SiteHeader />{children}<SiteFooter /><EventConcierge /></>;
}
