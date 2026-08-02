import type { IncomingMessage, ServerResponse } from "node:http";
import { getCategories, getCategoryByName, createCategory } from "../_lib/db.js";
import { requireRole } from "../_lib/auth.js";
import { json, readBody, str } from "../_lib/http.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "GET") {
    const categories = await getCategories();
    return json(res, 200, {
      categories: categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    });
  }

  const admin = await requireRole(req, res, ["admin"]);
  if (!admin) return;

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide" });
    }
    const name = str(body.name);
    const color = /^#[0-9a-fA-F]{6}$/.test(str(body.color)) ? str(body.color) : "#0F3D2E";

    if (!name) return json(res, 400, { error: "Nom de catégorie requis" });
    if (await getCategoryByName(name)) return json(res, 409, { error: "Cette catégorie existe déjà" });

    const category = {
      id: "cat_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name,
      color,
    };
    await createCategory(category);
    return json(res, 201, { category });
  }

  json(res, 405, { error: "Méthode non autorisée" });
}
