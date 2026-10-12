import type { IncomingMessage, ServerResponse } from "node:http";
import { queryOne } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";
export default async function handler(req: IncomingMessage, res: ServerResponse) {
 const user=await requireRole(req,res,["admin"]); if(!user)return;
 const id=new URL(req.url??"/","http://localhost").pathname.split("/").filter(Boolean).pop()??"";
 if(req.method==="PATCH"){
   let body:Record<string,unknown>; try{body=await readBody(req)}catch{return json(res,400,{error:"Corps invalide"})}
   const status=str(body.status); if(!["new","read"].includes(status))return json(res,400,{error:"Statut invalide"});
   const row=await queryOne("UPDATE contact_messages SET status=$2 WHERE id=$1 RETURNING id",[id,status]);
   if(!row)return json(res,404,{error:"Message introuvable"}); return json(res,200,{ok:true});
 }
 if(req.method==="DELETE"){const row=await queryOne("DELETE FROM contact_messages WHERE id=$1 RETURNING id",[id]); if(!row)return json(res,404,{error:"Message introuvable"}); return json(res,200,{ok:true});}
 return json(res,405,{error:"Méthode non autorisée"});
}
