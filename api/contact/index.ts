import type { IncomingMessage, ServerResponse } from "node:http";
import { query } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try { body = await readBody(req); } catch { return json(res,400,{error:"Message invalide"}); }
    if (str(body.website)) return json(res,201,{ok:true});
    const name=str(body.name), phone=str(body.phone), neighborhood=str(body.neighborhood), message=str(body.message);
    if (!name || !phone || !neighborhood || !message) return json(res,400,{error:"Tous les champs sont obligatoires"});
    if (name.length>120 || phone.length>40 || neighborhood.length>120 || message.length>3000) return json(res,400,{error:"Un champ dépasse la longueur autorisée"});
    const id="msg_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
    await query("INSERT INTO contact_messages (id,name,phone,neighborhood,message) VALUES ($1,$2,$3,$4,$5)",[id,name,phone,neighborhood,message]);
    return json(res,201,{ok:true});
  }
  const user=await requireRole(req,res,["admin"]);
  if (!user) return;
  if (req.method==="GET") {
    const messages=await query("SELECT id,name,phone,neighborhood,message,status,created_at FROM contact_messages ORDER BY created_at DESC LIMIT 300");
    return json(res,200,{messages});
  }
  return json(res,405,{error:"Méthode non autorisée"});
}
