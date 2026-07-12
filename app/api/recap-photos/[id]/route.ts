import { and,eq } from "drizzle-orm";
import { getEventUser } from "@/lib/event-auth";
import { getDb } from "@/db";
import { dailyRecaps,recapPhotos } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";
import { getRuntimeEnv } from "@/lib/runtime-env";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const{id}=await params;const photoId=Number(id);const[photo]=await getDb().select({id:recapPhotos.id,fileKey:recapPhotos.fileKey,contentType:recapPhotos.contentType,status:dailyRecaps.status}).from(recapPhotos).innerJoin(dailyRecaps,eq(recapPhotos.recapId,dailyRecaps.id)).where(and(eq(recapPhotos.id,photoId))).limit(1);if(!photo)return new Response("Not found",{status:404});if(photo.status!=="published"){const user=await getEventUser();if(!user||!isAdminEmail(user.email))return new Response("Not found",{status:404})}const object=await getRuntimeEnv().BUCKET.get(photo.fileKey);if(!object)return new Response("Not found",{status:404});return new Response(object.body,{headers:{"Content-Type":photo.contentType,"Cache-Control":photo.status==="published"?"public, max-age=86400":"private, no-store"}})}
