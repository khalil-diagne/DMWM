import type { IncomingMessage, ServerResponse } from "node:http";
import { getUsers, getUserByEmail, createUser } from "../../server/db";
import { requireRole, hashPassword } from "../../server/auth";
import { json, readBody, str } from "../../server/http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const admin = await requireRole(req, res, ["admin"]);
  if (!admin) return;

  if (req.method === "GET") {
    const users = await getUsers();
    return json(res, 200, {
      users: users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, created_at: u.created_at })),
    });
  }

  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await readBody(req);
    } catch {
      return json(res, 400, { error: "Corps de requête invalide" });
    }
    const email = str(body.email).toLowerCase();
    const password = str(body.password);
    const name = str(body.name);
    const role = str(body.role);

    if (!email || !password || !name || !["admin", "secretaire"].includes(role)) {
      return json(res, 400, { error: "Champs obligatoires manquants ou invalides" });
    }
    if (password.length < 6) {
      return json(res, 400, { error: "Le mot de passe doit contenir au moins 6 caractères" });
    }
    if (await getUserByEmail(email)) {
      return json(res, 409, { error: "Un compte existe déjà avec cet email" });
    }

    const user = {
      id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      email,
      name,
      role: role as "admin" | "secretaire",
      password_hash: await hashPassword(password),
    };
    await createUser(user);
    return json(res, 201, { user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  }

  json(res, 405, { error: "Méthode non autorisée" });
}
