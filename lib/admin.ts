import { getRuntimeEnv } from "@/lib/runtime-env";

export function isAdminEmail(email:string){
  const value=getRuntimeEnv().ADMIN_EMAILS;
  const admins=["michael.schlunegger@gmail.com","cnavarro@aapg.org",...(typeof value==="string"?value.split(",").map(v=>v.trim().toLowerCase()).filter(Boolean):[])];
  return admins.includes(email.toLowerCase());
}
