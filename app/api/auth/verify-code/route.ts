import { eventAuthConfig,eventSessionCookies } from "@/lib/event-auth";
import { ensureParticipantAccess,participantAccessError } from "@/lib/participant-access";

type VerificationData={access_token?:string;refresh_token?:string;expires_in?:number;message?:string;msg?:string;error_code?:string};
type EmailOtpType="email"|"signup"|"magiclink";

async function verifyEmailCode(url:string,key:string,email:string,code:string,type:EmailOtpType){
  const response=await fetch(`${url}/auth/v1/verify`,{
    method:"POST",
    headers:{apikey:key,"Content-Type":"application/json"},
    body:JSON.stringify({type,email,token:code}),
  });
  const data=await response.json() as VerificationData;
  return{response,data};
}

export async function POST(request:Request){
  try{
    const{email,code}=await request.json() as {email?:string;code?:string};
    const normalized=email?.trim().toLowerCase()||"";
    if(!/^\S+@\S+\.\S+$/.test(normalized)||!/^[0-9]{6}$/.test(code||"")){
      return Response.json({error:"Enter the six-digit code from your email."},{status:400});
    }

    const{url,key}=eventAuthConfig();
    let result=await verifyEmailCode(url,key,normalized,code!,"email");

    // Supabase can classify a first-time OTP as signup and an existing-user OTP
    // as email/magiclink. The aliases remain supported by GoTrue, so retrying the
    // same email-bound token keeps the flow compatible without weakening it.
    if(!result.response.ok){
      result=await verifyEmailCode(url,key,normalized,code!,"signup");
    }
    if(!result.response.ok){
      result=await verifyEmailCode(url,key,normalized,code!,"magiclink");
    }

    const{response,data}=result;
    if(!response.ok||!data.access_token||!data.refresh_token){
      return Response.json({error:data.msg||data.message||"The code is incorrect or has expired."},{status:401});
    }

    const access=await ensureParticipantAccess(normalized);
    if(access.status!=="active"){
      await fetch(`${url}/auth/v1/logout`,{method:"POST",headers:{apikey:key,Authorization:`Bearer ${data.access_token}`}}).catch(()=>undefined);
      return Response.json({error:participantAccessError(access.status)},{status:403});
    }

    const headers=new Headers({"Content-Type":"application/json"});
    for(const cookie of eventSessionCookies({access_token:data.access_token,refresh_token:data.refresh_token,expires_in:data.expires_in,sessionVersion:access.sessionVersion})){
      headers.append("Set-Cookie",cookie);
    }
    return new Response(JSON.stringify({verified:true}),{status:200,headers});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Unable to verify code."},{status:500});
  }
}
