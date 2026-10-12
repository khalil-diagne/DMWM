import type { IncomingMessage, ServerResponse } from "node:http";
import { query, queryOne } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";
export default async function handler(req: IncomingMessage,res:ServerResponse){
 const user=await requireRole(req,res,["admin","secretaire"]); if(!user)return;
 if(req.method==="GET"){
   const reports=await query("SELECT r.event_id,r.summary,r.updated_at,u.name AS updated_by FROM event_reports r LEFT JOIN users u ON u.id=r.updated_by ORDER BY r.updated_at DESC");
   return json(res,200,{reports});
 }
 if(req.method==="PUT"){
   let body:Record<string,unknown>;try{body=await readBody(req)}catch{return json(res,400,{error:"Corps invalide"})}
   const eventId=str(body.eventId),summary=str(body.summary);
   if(!eventId||summary.length>10000)return json(res,400,{error:"Événement requis ou compte rendu trop long"});
   const event=await queryOne("SELECT id FROM events WHERE id=$1",[eventId]);if(!event)return json(res,404,{error:"Événement introuvable"});
   await query("INSERT INTO event_reports(event_id,summary,updated_by,updated_at) VALUES($1,$2,$3,now()) ON CONFLICT(event_id) DO UPDATE SET summary=EXCLUDED.summary,updated_by=EXCLUDED.updated_by,updated_at=now()",[eventId,summary,user.id]);
   return json(res,200,{ok:true});
 }
 return json(res,405,{error:"Méthode non autorisée"});
}
