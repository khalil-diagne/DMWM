import "dotenv/config";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import login from "../api/auth/login.js";
import logout from "../api/auth/logout.js";
import me from "../api/auth/me.js";
import eventsIndex from "../api/events/index.js";
import eventDetail from "../api/events/[id].js";
import usersIndex from "../api/users/index.js";
import userDetail from "../api/users/[id].js";
import categoriesIndex from "../api/categories/index.js";
import categoryDetail from "../api/categories/[id].js";
import reset from "../api/reset.js";
import { json } from "../api/_lib/http.js";

const routes: { match: (method: string, path: string) => boolean; handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> }[] = [
  { match: (m, p) => m === "POST" && p === "/api/auth/login", handler: login },
  { match: (m, p) => m === "POST" && p === "/api/auth/logout", handler: logout },
  { match: (m, p) => m === "GET" && p === "/api/auth/me", handler: me },
  { match: (m, p) => m === "POST" && p === "/api/reset", handler: reset },
  { match: (m, p) => m === "GET" && p === "/api/events", handler: eventsIndex },
  { match: (m, p) => m === "POST" && p === "/api/events", handler: eventsIndex },
  { match: (m, p) => m === "GET" && /^\/api\/events\/.+/.test(p), handler: eventDetail },
  { match: (m, p) => m === "PUT" && /^\/api\/events\/.+/.test(p), handler: eventDetail },
  { match: (m, p) => m === "DELETE" && /^\/api\/events\/.+/.test(p), handler: eventDetail },
  { match: (m, p) => m === "GET" && p === "/api/users", handler: usersIndex },
  { match: (m, p) => m === "POST" && p === "/api/users", handler: usersIndex },
  { match: (m, p) => m === "DELETE" && /^\/api\/users\/.+/.test(p), handler: userDetail },
  { match: (m, p) => m === "GET" && p === "/api/categories", handler: categoriesIndex },
  { match: (m, p) => m === "POST" && p === "/api/categories", handler: categoriesIndex },
  { match: (m, p) => m === "PUT" && /^\/api\/categories\/.+/.test(p), handler: categoryDetail },
  { match: (m, p) => m === "DELETE" && /^\/api\/categories\/.+/.test(p), handler: categoryDetail },
];

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = (req.method ?? "GET").toUpperCase();
  const path = url.pathname;

  for (const route of routes) {
    if (route.match(method, path)) {
      try {
        await route.handler(req, res);
      } catch (err) {
        console.error(err);
        json(res, 500, { error: "Erreur serveur" });
      }
      return;
    }
  }
  json(res, 404, { error: "Route inconnue" });
});

const PORT = Number(process.env.PORT || 8787);
server.listen(PORT, () => {
  console.log(`API locale démarrée sur http://localhost:${PORT}`);
});
