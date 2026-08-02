import "dotenv/config";
import { Pool } from "@neondatabase/serverless";
import { getUserByEmail, getCategoryByName, getEvent, createUser, createEvent, createCategory } from "../api/_lib/db.js";
import { hashPassword } from "../api/_lib/auth.js";
import { seedEvents, seedCategories } from "../api/_lib/seed.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dahira.sn";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dahira-admin-2026";
const ADMIN_NAME = process.env.ADMIN_NAME || "Administrateur du dahira";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("ERREUR : la variable DATABASE_URL n'est pas définie. Copiez .env.example vers .env et renseignez votre URL Neon.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  let admin = await getUserByEmail(ADMIN_EMAIL);
  if (!admin) {
    await createUser({
      id: "admin",
      email: ADMIN_EMAIL,
      password_hash: await hashPassword(ADMIN_PASSWORD),
      name: ADMIN_NAME,
      role: "admin",
    });
    console.log(`Compte admin créé : ${ADMIN_EMAIL} (mot de passe : ${ADMIN_PASSWORD})`);
  } else {
    console.log(`Compte admin déjà présent : ${ADMIN_EMAIL}`);
  }

  for (const c of seedCategories) {
    if (!(await getCategoryByName(c.name))) {
      await createCategory(c);
      console.log(`Catégorie créée : ${c.name}`);
    }
  }

  for (const e of seedEvents) {
    if (!(await getEvent(e.id))) {
      await createEvent({ ...e, created_by: "admin" });
    }
  }
  console.log(`${seedEvents.length} événements de démonstration insérés.`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
