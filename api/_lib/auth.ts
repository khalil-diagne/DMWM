import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { getUserById, type UserRow } from "./db";

export const COOKIE_NAME = "dahira_token";
const MAX_AGE = 60 * 60 * 24 * 7;

function secretKey() {
  const s = process.env.JWT_SECRET || "dev-secret-change-me";
  return new TextEncoder().encode(s);
}

export type JwtPayload = { sub: string; email: string; name: string; role: string };

export async function signToken(user: UserRow): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      sub: payload.sub ?? "",
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? ""),
    };
  } catch {
    return null;
  }
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const header = req.headers.cookie ?? "";
  return Object.fromEntries(
    header.split(";").map((c) => {
      const i = c.indexOf("=");
      return i === -1 ? [] : [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
    })
  );
}

export function setAuthCookie(res: ServerResponse, token: string) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`
  );
}

export function clearAuthCookie(res: ServerResponse) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export async function getAuthUser(req: IncomingMessage): Promise<UserRow | null> {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const user = await getUserById(payload.sub);
  return user ?? null;
}

export async function requireRole(
  req: IncomingMessage,
  res: ServerResponse,
  roles: UserRow["role"][]
): Promise<UserRow | null> {
  const user = await getAuthUser(req);
  if (!user || !roles.includes(user.role)) {
    res.statusCode = 403;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Accès refusé" }));
    return null;
  }
  return user;
}

export const isProd = () => process.env.NODE_ENV === "production";
