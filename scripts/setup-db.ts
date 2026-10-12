import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Pool } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("ERREUR : la variable DATABASE_URL n'est pas définie. Copiez .env.example vers .env et renseignez votre URL Neon.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schema = readFileSync(join(__dirname, "..", "api", "_lib", "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("Schéma appliqué : tables users, categories, events et event_attendance prêtes.");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
