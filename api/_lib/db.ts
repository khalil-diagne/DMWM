import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "admin" | "secretaire";
  created_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  place: string;
  city: string;
  lat: number;
  lng: number;
  desc: string;
  host: string;
  phone: string;
  created_by: string | null;
  created_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export async function query<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: unknown[]): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}

export type NewEvent = Omit<EventRow, "created_at">;
export type NewUser = Omit<UserRow, "created_at">;

export const getEvents = () =>
  query<EventRow>("SELECT * FROM events ORDER BY date ASC");

export const getEvent = (id: string) =>
  queryOne<EventRow>("SELECT * FROM events WHERE id = $1", [id]);

export const createEvent = (e: NewEvent) =>
  query(
    `INSERT INTO events (id, title, category, date, time, place, city, lat, lng, "desc", host, phone, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [e.id, e.title, e.category, e.date, e.time, e.place, e.city, e.lat, e.lng, e.desc, e.host, e.phone, e.created_by]
  );

export const updateEvent = (id: string, e: Partial<EventRow>) =>
  query(
    `UPDATE events
     SET title = COALESCE($2, title),
         category = COALESCE($3, category),
         date = COALESCE($4, date),
         time = COALESCE($5, time),
         place = COALESCE($6, place),
         city = COALESCE($7, city),
         lat = COALESCE($8, lat),
         lng = COALESCE($9, lng),
         "desc" = COALESCE($10, "desc"),
         host = COALESCE($11, host),
         phone = COALESCE($12, phone)
     WHERE id = $1`,
    [id, e.title, e.category, e.date, e.time, e.place, e.city, e.lat, e.lng, e.desc, e.host, e.phone]
  );

export const deleteEvent = (id: string) =>
  query("DELETE FROM events WHERE id = $1", [id]);

export const deleteAllEvents = () => query("DELETE FROM events");

export const getUserByEmail = (email: string) =>
  queryOne<UserRow>("SELECT * FROM users WHERE email = $1", [email]);

export const getUserById = (id: string) =>
  queryOne<UserRow>("SELECT * FROM users WHERE id = $1", [id]);

export const getUsers = () =>
  query<UserRow>("SELECT id, email, name, role, created_at FROM users ORDER BY created_at ASC");

export const createUser = (u: NewUser) =>
  query(
    `INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)`,
    [u.id, u.email, u.password_hash, u.name, u.role]
  );

export const deleteUser = (id: string) =>
  query("DELETE FROM users WHERE id = $1", [id]);

export const getCategories = () =>
  query<CategoryRow>("SELECT * FROM categories ORDER BY name ASC");

export const getCategory = (id: string) =>
  queryOne<CategoryRow>("SELECT * FROM categories WHERE id = $1", [id]);

export const getCategoryByName = (name: string) =>
  queryOne<CategoryRow>("SELECT * FROM categories WHERE name = $1", [name]);

export const createCategory = (c: Omit<CategoryRow, "created_at">) =>
  query("INSERT INTO categories (id, name, color) VALUES ($1, $2, $3)", [c.id, c.name, c.color]);

export const updateCategory = (id: string, name: string, color: string) =>
  query("UPDATE categories SET name = $2, color = $3 WHERE id = $1", [id, name, color]);

export const deleteCategory = (id: string) =>
  query("DELETE FROM categories WHERE id = $1", [id]);

export const countEventsByCategory = (name: string) =>
  queryOne<{ n: string }>("SELECT COUNT(*) AS n FROM events WHERE category = $1", [name]).then((r) => Number(r?.n ?? 0));
