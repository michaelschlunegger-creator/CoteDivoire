import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRuntimeEnv } from "@/lib/runtime-env";
import { isAdminEmail } from "@/lib/admin";
import { isParticipantSessionAllowed } from "@/lib/participant-access";

const ACCESS_COOKIE="wat_margin_2027_access";
const REFRESH_COOKIE="wat_margin_2027_refresh";
const SESSION_VERSION_COOKIE="wat_margin_2027_session_version";
export type EventUser={id:string;email:string;displayName:string};

function config(){const env=getRuntimeEnv();if(!env.NEXT_PUBLIC_SUPABASE_URL||!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)throw new Error("Participant authentication is not configured.");return{url:env.NEXT_PUBLIC_SUPABASE_URL,key:env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}}
async function userForToken(token:string){const{url,key}=config();const response=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`}});if(!response.ok)return null;const user=await response.json() as {id?:string;email?:string;user_metadata?:{full_name?:string;name?:string}};if(!user.id||!user.email)return null;return{id:user.id,email:user.email.toLowerCase(),displayName:user.user_metadata?.full_name||user.user_metadata?.name||user.email.split("@")[0]} satisfies EventUser}
async function lifecycleAuthorized(user:EventUser|null,version:number|null){if(!user)return null;if(isAdminEmail(user.email))return user;return await isParticipantSessionAllowed(user.email,version)?user:null}
export async function getEventUser():Promise<EventUser|null>{try{const env=getRuntimeEnv();if(!env.NEXT_PUBLIC_SUPABASE_URL||!env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return null;const store=await cookies();const rawVersion=store.get(SESSION_VERSION_COOKIE)?.value;const version=rawVersion&&/^\d+$/.test(rawVersion)?Number(rawVersion):null;const access=store.get(ACCESS_COOKIE)?.value;if(access){const user=await lifecycleAuthorized(await userForToken(access),version);if(user)return user}const refresh=store.get(REFRESH_COOKIE)?.value;if(!refresh)return null;const{url,key}=config();const response=await fetch(`${url}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:refresh})});if(!response.ok)return null;const session=await response.json() as {access_token?:string};return session.access_token?lifecycleAuthorized(await userForToken(session.access_token),version):null}catch{return null}}
export async function requireEventUser(returnTo:string){const user=await getEventUser();if(user)return user;const safe=returnTo.startsWith("/")&&!returnTo.startsWith("//")?returnTo:"/dashboard";redirect(`/signin?returnTo=${encodeURIComponent(safe)}`)}
export function eventAuthConfig(){return config()}
export function eventSessionCookies(session:{access_token:string;refresh_token:string;expires_in?:number;sessionVersion?:number}){const secure="; Path=/; HttpOnly; Secure; SameSite=Lax";return[`${ACCESS_COOKIE}=${encodeURIComponent(session.access_token)}; Max-Age=${session.expires_in||3600}${secure}`,`${REFRESH_COOKIE}=${encodeURIComponent(session.refresh_token)}; Max-Age=2592000${secure}`,`${SESSION_VERSION_COOKIE}=${session.sessionVersion||1}; Max-Age=2592000${secure}`]}
export function clearEventSessionCookies(){const secure="; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";return[`${ACCESS_COOKIE}=${secure}`,`${REFRESH_COOKIE}=${secure}`,`${SESSION_VERSION_COOKIE}=${secure}`]}
