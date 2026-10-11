import type { IncomingMessage, ServerResponse } from "node:http";
import { query, queryOne } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

type AttendanceRow = {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!(await requireRole(req, res, ["admin", "secretaire"]))) return;

  if (req.method === "GET") {
    const url = new URL(req.url ?? "/", "http://localhost");
    const eventId = str(url.searchParams.get("eventId"));
    if (!eventId) return json(res, 400, { error: "Événement requis" });

    const event = await queryOne<{ id: string }>("SELECT id FROM events WHERE id = $1", [eventId]);
    if (!event) return json(res, 404, { error: "Événement introuvable" });

    const attendees = await query<AttendanceRow>(
      "SELECT id, event_id, name, created_at FROM event_attendance WHERE event_id = $1 ORDER BY created_at ASC, id ASC",
      [eventId]
    );
    return json(res, 200, { attendees });
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide" });
    }

    const eventId = str(body.eventId);
    const name = str(body.name);
    if (!eventId || !name) return json(res, 400, { error: "Événement et nom requis" });
    if (name.length > 120) return json(res, 400, { error: "Le nom ne peut pas dépasser 120 caractères" });

    const event = await queryOne<{ id: string }>("SELECT id FROM events WHERE id = $1", [eventId]);
    if (!event) return json(res, 404, { error: "Événement introuvable" });

    const id = "att_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const attendee = await queryOne<AttendanceRow>(
      "INSERT INTO event_attendance (id, event_id, name) VALUES ($1, $2, $3) RETURNING id, event_id, name, created_at",
      [id, eventId, name]
    );
    return json(res, 201, { attendee });
  }

  return json(res, 405, { error: "Méthode non autorisée" });
}
