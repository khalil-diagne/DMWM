import type { IncomingMessage, ServerResponse } from "node:http";
import { getAuthUser } from "../../server/auth";
import { json } from "../../server/http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET") return json(res, 405, { error: "Méthode non autorisée" });
  const user = await getAuthUser(req);
  if (!user) return json(res, 401, { error: "Non authentifié" });
  json(res, 200, { user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
