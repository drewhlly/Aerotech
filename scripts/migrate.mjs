import pg from "pg";
import { readFileSync } from "node:fs";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  for (const file of ["001_employer_accounts.sql", "002_employer_sessions.sql", "003_applicant_accounts.sql"]) {
    await client.query(readFileSync(new URL(`../database/${file}`, import.meta.url), "utf8"));
    process.stdout.write(`Applied ${file}\n`);
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally { await client.end(); }
