import type { IncomingMessage, ServerResponse } from "node:http";
import { getUserByEmail } from "../_lib/db";
import { setAuthCookie, signToken, verifyPassword } from "../_lib/auth";
import { json, readBody, str } from "../_lib/http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Méthode non autorisée" });

  let body: Record<string, unknown>;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { error: "Corps de requête invalide" });
  }

  const email = str(body.email).toLowerCase();
  const password = str(body.password);
  if (!email || !password) return json(res, 400, { error: "Email et mot de passe requis" });

  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return json(res, 401, { error: "Identifiants incorrects" });
  }

  const token = await signToken(user);
  setAuthCookie(res, token);
  json(res, 200, { user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
