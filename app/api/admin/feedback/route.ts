import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { feedback, participantAccess } from "@/db/schema";
import { getEventUser } from "@/lib/event-auth";
import { isAdminEmail } from "@/lib/admin";
export async function GET(){const user=await getEventUser();if(!user||!isAdminEmail(user.email))return Response.json({error:"Organizer access required."},{status:403});const[rows,access]=await Promise.all([getDb().select().from(feedback).orderBy(desc(feedback.createdAt)),getDb().select().from(participantAccess)]);const archived=new Set(access.filter(item=>item.status==="soft_deleted").map(item=>item.userEmail));return Response.json({feedback:rows.filter(item=>!archived.has((item.userEmail||item.email).toLowerCase()))},{headers:{"Cache-Control":"no-store"}})}
