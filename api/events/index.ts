import type { IncomingMessage, ServerResponse } from "node:http";
import { getEvents, createEvent, getCategories } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
