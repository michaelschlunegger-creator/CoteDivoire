import { eq } from "drizzle-orm";
import { getEventUser } from "@/lib/event-auth";
import { getDb } from "@/db";
import { recapPhotos } from "@/db/schema";
import { isAdminEmail } from "@/lib/admin";
import { getRuntimeEnv } from "@/lib/runtime-env";
async function authorized(){const user=await getEventUser();return Boolean(user&&isAdminEmail(user.email))}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){if(!await authorized())return Response.json({error:"Organizer access required."},{status:403});const{id}=await params;const photoId=Number(id);const body=await request.json() as {caption?:string;credit?:string;sortOrder?:number};const[photo]=await getDb().update(recapPhotos).set({caption:body.caption?.trim()||"",credit:body.credit?.trim()||"",...(Number.isInteger(body.sortOrder)?{sortOrder:Number(body.sortOrder)}:{})}).where(eq(recapPhotos.id,photoId)).returning();return photo?Response.json({photo}):Response.json({error:"Photo not found."},{status:404})}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){if(!await authorized())return Response.json({error:"Organizer access required."},{status:403});const{id}=await params;const photoId=Number(id);const[photo]=await getDb().select().from(recapPhotos).where(eq(recapPhotos.id,photoId)).limit(1);if(!photo)return Response.json({error:"Photo not found."},{status:404});await getRuntimeEnv().BUCKET.delete(photo.fileKey);await getDb().delete(recapPhotos).where(eq(recapPhotos.id,photoId));return Response.json({deleted:true})}
