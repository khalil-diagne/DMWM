import type { IncomingMessage, ServerResponse } from "node:http";
import { queryOne, query } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

type AttendanceRow = { id: string; event_id: string; name: string; created_at: string; };

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = await requireRole(req, res, ["admin", "secretaire"]);
  if (!user) return;
  const url = new URL(req.url ?? "/", "http://localhost");
  const id = url.pathname.split("/").filter(Boolean).pop() ?? "";
  if (req.method === "PATCH" || req.method === "PUT") {
    let body: Record<string, unknown>;
    try { body = await readBody(req); } catch { return json(res, 400, { error: "Corps de requête invalide" }); }
    const name = str(body.name);
    if (!name) return json(res, 400, { error: "Nom requis" });
    if (name.length > 120) return json(res, 400, { error: "Le nom ne peut pas dépasser 120 caractères" });
    const prior = await queryOne<AttendanceRow>("SELECT id, event_id, name, created_at FROM event_attendance WHERE id = $1", [id]);
    if (!prior) return json(res, 404, { error: "Présence introuvable" });
    const attendee = await queryOne<AttendanceRow>("UPDATE event_attendance SET name = $2, updated_by = $3, updated_at = now() WHERE id = $1 RETURNING id, event_id, name, created_at", [id, name, user.id]);
    await query("INSERT INTO event_attendance_history (id, event_id, attendee_id, action, name, previous_name, changed_by) VALUES ($1, $2, $3, 'renamed', $4, $5, $6)",
      ["hist_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), prior.event_id, id, name, prior.name, user.id]);
    return json(res, 200, { attendee });
  }
  if (req.method === "DELETE") {
    const prior = await queryOne<AttendanceRow>("DELETE FROM event_attendance WHERE id = $1 RETURNING id, event_id, name, created_at", [id]);
    if (!prior) return json(res, 404, { error: "Présence introuvable" });
    await query("INSERT INTO event_attendance_history (id, event_id, attendee_id, action, name, changed_by) VALUES ($1, $2, $3, 'removed', $4, $5)",
      ["hist_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8), prior.event_id, id, prior.name, user.id]);
    return json(res, 200, { ok: true });
  }
  return json(res, 405, { error: "Méthode non autorisée" });
}
