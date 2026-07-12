import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminNotifications } from "@/db/schema";
import { getRuntimeEnv } from "@/lib/runtime-env";

type NotificationInput={kind:string;title:string;detail:string;contactEmail?:string;fields?:Record<string,string|number|null|undefined>};

export async function notifyEventAdmins(input:NotificationInput){
  const db=getDb();
  const env=getRuntimeEnv();
  const[row]=await db.insert(adminNotifications).values({kind:input.kind,title:input.title,detail:input.detail,contactEmail:input.contactEmail||"",payload:JSON.stringify(input.fields||{}),emailStatus:"pending"}).returning();
  const recipients=(env.ADMIN_NOTIFICATION_EMAILS||"").split(",").map(v=>v.trim()).filter(Boolean);
  if(!env.RESEND_API_KEY||!env.NOTIFICATION_FROM_EMAIL||!recipients.length){await db.update(adminNotifications).set({emailStatus:"not_configured"}).where(eq(adminNotifications.id,row.id));return{sent:false,status:"not_configured"}}
  try{
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:env.NOTIFICATION_FROM_EMAIL,to:recipients,subject:`[WAT Margin 2027] ${input.title}`,html:notificationHtml(input)})});
    const status=response.ok?"sent":`failed_${response.status}`;
    await db.update(adminNotifications).set({emailStatus:status}).where(eq(adminNotifications.id,row.id));
    return{sent:response.ok,status};
  }catch{await db.update(adminNotifications).set({emailStatus:"failed"}).where(eq(adminNotifications.id,row.id));return{sent:false,status:"failed"}}
}

function notificationHtml(input:NotificationInput){const rows=Object.entries(input.fields||{}).filter(([,value])=>value!==undefined&&value!==null&&String(value).trim()).map(([key,value])=>`<tr><td style="padding:8px 12px;color:#62717a;border-bottom:1px solid #e4ecec">${escapeHtml(key)}</td><td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #e4ecec">${escapeHtml(String(value))}</td></tr>`).join("");return`<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#041521"><div style="background:#041521;padding:22px;border-bottom:4px solid #008b6c"><strong style="font-size:22px;color:white">AAPG · EAGE · WAT Margin 2027</strong></div><div style="padding:26px;border:1px solid #d8e2e3"><p style="font-size:12px;letter-spacing:2px;color:#008b6c;text-transform:uppercase">${escapeHtml(input.kind)}</p><h1 style="font-size:26px">${escapeHtml(input.title)}</h1><p style="line-height:1.6">${escapeHtml(input.detail)}</p><table style="border-collapse:collapse;width:100%;margin-top:20px">${rows}</table><p style="margin-top:24px;font-size:12px;color:#71808a">Open the protected organizer studio to review the full event activity.</p></div></div>`}
function escapeHtml(value:string){return value.replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]||char))}
