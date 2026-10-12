import type { IncomingMessage, ServerResponse } from "node:http";
import { query } from "../../_lib/db.js";
import { requireRole } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!(await requireRole(req, res, ["admin", "secretaire"]))) return;
  if (req.method !== "GET") return json(res, 405, { error: "Méthode non autorisée" });
  const eventId = new URL(req.url ?? "/", "http://localhost").searchParams.get("eventId");
  const rows = await query("SELECT h.id,h.action,h.name,h.previous_name,h.changed_at,u.name AS changed_by,e.title AS event_title FROM event_attendance_history h JOIN events e ON e.id=h.event_id LEFT JOIN users u ON u.id=h.changed_by WHERE ($1::text IS NULL OR h.event_id=$1) ORDER BY h.changed_at DESC LIMIT 300", [eventId]);
  return json(res, 200, { history: rows });
}
