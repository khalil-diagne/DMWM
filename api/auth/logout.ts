import type { IncomingMessage, ServerResponse } from "node:http";
import { clearAuthCookie } from "../_lib/auth.js";
import { json } from "../_lib/http.js";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "Méthode non autorisée" });
  clearAuthCookie(res);
  json(res, 200, { ok: true });
}
