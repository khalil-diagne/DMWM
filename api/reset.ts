import type { IncomingMessage, ServerResponse } from "node:http";
import { deleteAllEvents, createEvent } from "../server/db";
import { requireRole } from "../server/auth";
import { json } from "../server/http";
import { seedEvents } from "../server/seed";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const user = await requireRole(req, res, ["admin", "secretaire"]);
  if (!user) return;

  if (req.method === "POST") {
    await deleteAllEvents();
    for (const e of seedEvents) {
      await createEvent({ ...e, created_by: user.id });
    }
    return json(res, 200, { ok: true, count: seedEvents.length });
  }

  json(res, 405, { error: "Méthode non autorisée" });
}
