import type { IncomingMessage, ServerResponse } from "node:http";
import { deleteUser } from "../_lib/db";
import { requireRole } from "../_lib/auth";
import { json } from "../_lib/http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const admin = await requireRole(req, res, ["admin"]);
  if (!admin) return;

  const url = new URL(req.url ?? "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];

  if (req.method === "DELETE") {
    if (id === admin.id) return json(res, 400, { error: "Impossible de supprimer votre propre compte" });
    await deleteUser(id);
    return json(res, 200, { ok: true });
  }

  json(res, 405, { error: "Méthode non autorisée" });
}
