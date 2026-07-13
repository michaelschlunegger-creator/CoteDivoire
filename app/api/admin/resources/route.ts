import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { resources } from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";
import { isAdminEmail } from "@/lib/admin";
import { getRuntimeEnv } from "@/lib/runtime-env";
async function admin(){const user=await getEventUser();return Boolean(user&&isAdminEmail(user.email))}
export async function GET(){if(!await admin())return Response.json({error:"Organizer access required."},{status:403});return Response.json({resources:await getDb().select().from(resources).orderBy(desc(resources.createdAt))},{headers:{"Cache-Control":"no-store"}})}
export async function PATCH(request:Request){if(!await admin())return Response.json({error:"Organizer access required."},{status:403});const body=await request.json() as {id?:number;title?:string;description?:string;category?:string;visibility?:string};if(!Number.isInteger(body.id)||!body.title?.trim()||!body.category?.trim()||!["public","participant"].includes(body.visibility||""))return Response.json({error:"Title, category and visibility are required."},{status:400});const[row]=await getDb().update(resources).set({title:body.title.trim(),description:body.description?.trim()||"",category:body.category.trim(),visibility:body.visibility!}).where(eq(resources.id,body.id!)).returning();return row?Response.json({resource:row}):Response.json({error:"Resource not found."},{status:404})}
export async function DELETE(request:Request){if(!await admin())return Response.json({error:"Organizer access required."},{status:403});const{id}=await request.json() as {id?:number};if(!Number.isInteger(id))return Response.json({error:"Resource required."},{status:400});const[row]=await getDb().select().from(resources).where(eq(resources.id,id!)).limit(1);if(!row)return Response.json({error:"Resource not found."},{status:404});await getRuntimeEnv().BUCKET.delete(row.fileKey);await getDb().delete(resources).where(eq(resources.id,id!));return Response.json({deleted:true})}
