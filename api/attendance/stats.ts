import type { IncomingMessage, ServerResponse } from "node:http";
import { query } from "../../_lib/db.js";
import { requireRole } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!(await requireRole(req, res, ["admin", "secretaire"]))) return;
  if (req.method !== "GET") return json(res, 405, { error: "Méthode non autorisée" });
  const stats = await query<{event_id:string;title:string;date:string;attendance_count:number}>(
    "SELECT e.id AS event_id, e.title, e.date, COUNT(a.id)::int AS attendance_count FROM events e LEFT JOIN event_attendance a ON a.event_id=e.id GROUP BY e.id ORDER BY e.date DESC"
  );
  return json(res, 200, { stats, total: stats.reduce((n, row) => n + row.attendance_count, 0) });
}
