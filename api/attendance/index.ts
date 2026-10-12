import type { IncomingMessage, ServerResponse } from "node:http";
import { query, queryOne } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

type AttendanceRow = { id: string; event_id: string; name: string; created_at: string; };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = await requireRole(req, res, ["admin", "secretaire"]);
  if (!user) return;
  if (req.method === "GET") {
    const url = new URL(req.url ?? "/", "http://localhost");
    const view = url.searchParams.get("view");
    if (view === "stats") {
      const stats = await query<{event_id:string;title:string;date:string;attendance_count:number}>(
        "SELECT e.id AS event_id, e.title, e.date, COUNT(a.id)::int AS attendance_count FROM events e LEFT JOIN event_attendance a ON a.event_id=e.id GROUP BY e.id ORDER BY e.date DESC"
      );
      return json(res, 200, { stats, total: stats.reduce((n, row) => n + row.attendance_count, 0) });
    }
    if (view === "history") {
      const eventId = url.searchParams.get("eventId");
      const history = await query(
        "SELECT h.id,h.action,h.name,h.previous_name,h.changed_at,u.name AS changed_by,e.title AS event_title FROM event_attendance_history h JOIN events e ON e.id=h.event_id LEFT JOIN users u ON u.id=h.changed_by WHERE ($1::text IS NULL OR h.event_id=$1) ORDER BY h.changed_at DESC LIMIT 300",
        [eventId]
      );
      return json(res, 200, { history });
    }
    const eventId = str(url.searchParams.get("eventId"));
    if (!eventId) return json(res, 400, { error: "Événement requis" });
    const event = await queryOne<{ id: string }>("SELECT id FROM events WHERE id = $1", [eventId]);
    if (!event) return json(res, 404, { error: "Événement introuvable" });
    const attendees = await query<AttendanceRow>("SELECT id, event_id, name, created_at FROM event_attendance WHERE event_id = $1 ORDER BY created_at ASC, id ASC", [eventId]);
    return json(res, 200, { attendees });
  }
  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try { body = await readBody(req); } catch { return json(res, 400, { error: "Corps de requête invalide" }); }
    const eventId = str(body.eventId), name = str(body.name);
    if (!eventId || !name) return json(res, 400, { error: "Événement et nom requis" });
    if (name.length > 120) return json(res, 400, { error: "Le nom ne peut pas dépasser 120 caractères" });
    const event = await queryOne<{ id: string }>("SELECT id FROM events WHERE id = $1", [eventId]);
    if (!event) return json(res, 404, { error: "Événement introuvable" });
    const id = "att_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const attendee = await queryOne<AttendanceRow>(
      "INSERT INTO event_attendance (id, event_id, name, created_by, updated_by) VALUES ($1, $2, $3, $4, $4) RETURNING id, event_id, name, created_at",
      [id, eventId, name, user.id]
    );
    await query("INSERT INTO event_attendance_history (id, event_id, attendee_id, action, name, changed_by) VALUES ($1, $2, $3, 'added', $4, $5)",
      ["hist_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), eventId, id, name, user.id]);
    return json(res, 201, { attendee });
  }
  return json(res, 405, { error: "Méthode non autorisée" });
}
