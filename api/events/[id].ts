import type { IncomingMessage, ServerResponse } from "node:http";
import { getEvent, updateEvent, deleteEvent } from "../../server/db";
import { requireRole } from "../../server/auth";
import { json, readBody, str } from "../../server/http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];

  if (req.method === "GET") {
    const event = await getEvent(id);
    if (!event) return json(res, 404, { error: "Événement introuvable" });
    return json(res, 200, { event });
  }

  const user = await requireRole(req, res, ["admin", "secretaire"]);
  if (!user) return;

  if (req.method === "PUT") {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide" });
    }
    const existing = await getEvent(id);
    if (!existing) return json(res, 404, { error: "Événement introuvable" });

    const patch: Record<string, string | number> = {};
    for (const k of ["title", "category", "date", "time", "place", "city", "desc", "host", "phone"] as const) {
      if (body[k] !== undefined) patch[k] = str(body[k]);
    }
    for (const k of ["lat", "lng"] as const) {
      if (body[k] !== undefined) patch[k] = Number(body[k]);
    }
    await updateEvent(id, patch);
    return json(res, 200, { ok: true });
  }

  if (req.method === "DELETE") {
    await deleteEvent(id);
    return json(res, 200, { ok: true });
  }

  json(res, 405, { error: "Méthode non autorisée" });
}
