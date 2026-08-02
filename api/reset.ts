import type { IncomingMessage, ServerResponse } from "node:http";
import { deleteAllEvents, createEvent } from "./_lib/db";
import { requireRole } from "./_lib/auth";
import { json } from "./_lib/http";
import { seedEvents } from "./_lib/seed";

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
