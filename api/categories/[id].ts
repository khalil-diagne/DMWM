import type { IncomingMessage, ServerResponse } from "node:http";
import { getCategory, getCategoryByName, updateCategory, deleteCategory, countEventsByCategory } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const admin = await requireRole(req, res, ["admin"]);
  if (!admin) return;

  const url = new URL(req.url ?? "/", "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];

  const existing = await getCategory(id);
  if (!existing) return json(res, 404, { error: "Catégorie introuvable" });

  if (req.method === "PUT") {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide" });
    }
    const name = str(body.name);
    const color = /^#[0-9a-fA-F]{6}$/.test(str(body.color)) ? str(body.color) : existing.color;

    if (!name) return json(res, 400, { error: "Nom de catégorie requis" });
    if (name !== existing.name && (await getCategoryByName(name))) {
      return json(res, 409, { error: "Cette catégorie existe déjà" });
    }

    await updateCategory(id, name, color);
    return json(res, 200, { ok: true, category: { id, name, color } });
  }

  if (req.method === "DELETE") {
    const used = await countEventsByCategory(existing.name);
    if (used > 0) {
      return json(res, 409, {
        error: `Catégorie utilisée par ${used} événement(s). Supprimez ou modifiez ces événements d'abord.`,
      });
    }
    await deleteCategory(id);
    return json(res, 200, { ok: true });
  }

  json(res, 405, { error: "Méthode non autorisée" });
}
