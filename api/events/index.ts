import type { IncomingMessage, ServerResponse } from "node:http";
import { getEvents, createEvent, getCategories, query, queryOne } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const resource = url.searchParams.get("resource");
  if (resource === "contact") {
    if (req.method === "POST") {
      let body: Record<string, unknown>;
      try { body = await readBody(req); } catch { return json(res, 400, { error: "Message invalide" }); }
      if (str(body.website)) return json(res, 201, { ok: true });
      const name=str(body.name), phone=str(body.phone), neighborhood=str(body.neighborhood), message=str(body.message);
      if (!name || !phone || !neighborhood || !message) return json(res,400,{error:"Tous les champs sont obligatoires"});
      if (name.length>120 || phone.length>40 || neighborhood.length>120 || message.length>3000) return json(res,400,{error:"Un champ dépasse la longueur autorisée"});
      const id="msg_"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
      await query("INSERT INTO contact_messages (id,name,phone,neighborhood,message) VALUES ($1,$2,$3,$4,$5)",[id,name,phone,neighborhood,message]);
      return json(res,201,{ok:true});
    }
    const admin = await requireRole(req,res,["admin"]);
    if (!admin) return;
    const id=url.searchParams.get("id");
    if (req.method==="GET") {
      const messages=await query("SELECT id,name,phone,neighborhood,message,status,created_at FROM contact_messages ORDER BY created_at DESC LIMIT 300");
      return json(res,200,{messages});
    }
    if (req.method==="PATCH" && id) {
      let body:Record<string,unknown>;try{body=await readBody(req)}catch{return json(res,400,{error:"Corps invalide"})}
      const status=str(body.status);if(!["new","read"].includes(status))return json(res,400,{error:"Statut invalide"});
      const row=await queryOne("UPDATE contact_messages SET status=$2 WHERE id=$1 RETURNING id",[id,status]);
      if(!row)return json(res,404,{error:"Message introuvable"});return json(res,200,{ok:true});
    }
    if (req.method==="DELETE" && id) {
      const row=await queryOne("DELETE FROM contact_messages WHERE id=$1 RETURNING id",[id]);
      if(!row)return json(res,404,{error:"Message introuvable"});return json(res,200,{ok:true});
    }
    return json(res,405,{error:"Méthode non autorisée"});
  }
  if (resource === "reports") {
    const user=await requireRole(req,res,["admin","secretaire"]);if(!user)return;
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
  if (req.method === "GET") {
    const events = await getEvents();
    return json(res, 200, { events });
  }

  if (req.method === "POST") {
    const user = await requireRole(req, res, ["admin", "secretaire"]);
    if (!user) return;

    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide" });
    }

    const title = str(body.title);
    const category = str(body.category);
    const date = str(body.date);
    const time = str(body.time);
    const place = str(body.place);
    const city = str(body.city);
    const host = str(body.host);
    const phone = str(body.phone);
    const desc = str(body.desc);
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    const categories = await getCategories();
    const valid = categories.some((c) => c.name === category);

    if (!title || !date || !place || !city || !valid) {
      return json(res, 400, { error: "Champs obligatoires manquants ou invalides" });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return json(res, 400, { error: "Coordonnées invalides" });
    }

    const event = {
      id: "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title,
      category,
      date,
      time: time || "20:00",
      place,
      city,
      lat,
      lng,
      desc,
      host,
      phone,
      created_by: user.id,
    };

    await createEvent(event);
    return json(res, 201, { event });
  }

  json(res, 405, { error: "Méthode non autorisée" });
}
