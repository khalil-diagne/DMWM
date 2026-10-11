import type { IncomingMessage, ServerResponse } from "node:http";
import { queryOne } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

type AttendanceRow = {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = await requireRole(req, res, ["admin", "secretaire"]);
  if (!user) return;

  const url = new URL(req.url ?? "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];

  if (req.method === "PATCH" || req.method === "PUT") {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide" });
    }

    const name = str(body.name);
    if (!name) return json(res, 400, { error: "Nom requis" });
    if (name.length > 120) return json(res, 400, { error: "Le nom ne peut pas dépasser 120 caractères" });

    const attendee = await queryOne<AttendanceRow>(
      "UPDATE event_attendance SET name = $2 WHERE id = $1 RETURNING id, event_id, name, created_at",
      [id, name]
    );
    if (!attendee) return json(res, 404, { error: "Présence introuvable" });
    return json(res, 200, { attendee });
  }

  if (req.method === "DELETE") {
    const deleted = await queryOne<{ id: string }>(
      "DELETE FROM event_attendance WHERE id = $1 RETURNING id",
      [id]
    );
    if (!deleted) return json(res, 404, { error: "Présence introuvable" });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: "Méthode non autorisée" });
}
