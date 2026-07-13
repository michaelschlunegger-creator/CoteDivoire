import{clearRegistrationProofCookie,getFreshRegistrationUser}from"@/lib/event-auth";
import{getDb}from"@/db";
import{registrations}from"@/db/schema";
import{notifyEventAdmins}from"@/lib/admin-notifications";
import{sendParticipantEmail}from"@/lib/participant-emails";

const requiredLabels:Record<string,string>={firstName:"First name",lastName:"Last name",jobTitle:"Job title",organization:"Organization",country:"Country / market",participationType:"Participation type"};

export async function POST(request:Request){
  try{
    const user=await getFreshRegistrationUser();
    if(!user)return Response.json({error:"Please verify your email before registering."},{status:401});
    const body=await request.json() as Record<string,string>;
    for(const[key,label]of Object.entries(requiredLabels)){
      if(!body[key]?.trim())return Response.json({error:`${label} is required.`},{status:400});
    }
    if(body.privacyConsent!=="yes")return Response.json({error:"Privacy consent is required."},{status:400});

    const verifiedEmail=user.email;
    const firstName=body.firstName.trim();
    const lastName=body.lastName.trim();
    const fullName=`${firstName} ${lastName}`.replace(/\s+/g," ");
    const[registration]=await getDb().insert(registrations).values({
      userEmail:verifiedEmail,fullName,email:verifiedEmail,jobTitle:body.jobTitle.trim(),organization:body.organization.trim(),country:body.country.trim(),phone:body.phone?.trim()||"",participationType:body.participationType.trim(),interests:body.interests?.trim()||"",dietary:body.dietary?.trim()||"",accessibility:body.accessibility?.trim()||"",privacyConsent:true,communicationConsent:body.communicationConsent==="yes",
    }).returning();

    await Promise.all([
      notifyEventAdmins({kind:"Registration",title:`New ${body.participationType} registration`,detail:`${fullName} from ${body.organization} registered for West African Transform Margin 2027.`,contactEmail:verifiedEmail,fields:{Name:fullName,Email:verifiedEmail,Organization:body.organization,"Job title":body.jobTitle,Country:body.country,Participation:body.participationType,Interests:body.interests}}),
      sendParticipantEmail({to:verifiedEmail,subject:"Registration received · WAT Margin 2027",heading:"Your registration is linked to your participant hub",body:`Thank you, ${fullName}. Your ${body.participationType} registration has been received. Programme, travel and venue details will be updated as they are confirmed.`,actionLabel:"Open participant hub",actionUrl:`${new URL(request.url).origin}/dashboard`}),
    ]);
    const headers=new Headers({"Content-Type":"application/json","Cache-Control":"no-store, max-age=0"});
    headers.append("Set-Cookie",clearRegistrationProofCookie());
    return new Response(JSON.stringify({registration}),{status:201,headers});
  }catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to register."},{status:500})}
}
