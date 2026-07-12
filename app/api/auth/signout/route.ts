import { clearEventSessionCookies } from "@/lib/event-auth";
export async function GET(request:Request){const headers=new Headers({Location:new URL("/",request.url).toString()});for(const cookie of clearEventSessionCookies())headers.append("Set-Cookie",cookie);return new Response(null,{status:303,headers})}
