import { asc,eq,inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyRecaps,recapPhotos } from "@/db/schema";

export async function GET(){try{const db=getDb();const recaps=await db.select().from(dailyRecaps).where(eq(dailyRecaps.status,"published")).orderBy(asc(dailyRecaps.dayNumber));if(!recaps.length)return Response.json({recaps:[]});const photos=await db.select({id:recapPhotos.id,recapId:recapPhotos.recapId,caption:recapPhotos.caption,credit:recapPhotos.credit,fileName:recapPhotos.fileName,sortOrder:recapPhotos.sortOrder}).from(recapPhotos).where(inArray(recapPhotos.recapId,recaps.map(r=>r.id))).orderBy(asc(recapPhotos.sortOrder),asc(recapPhotos.id));return Response.json({recaps:recaps.map(recap=>({...recap,photos:photos.filter(photo=>photo.recapId===recap.id)}))})}catch(error){return Response.json({error:error instanceof Error?error.message:"Unable to load highlights.",recaps:[]},{status:500})}}
