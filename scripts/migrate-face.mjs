// Uses the project's migration ledger. Explicit opt-in keeps existing deployments unchanged.
import pg from "pg";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
if (!process.env.DATABASE_URL)
  throw Error("DATABASE_URL is required; select the intended Neon branch.");
const name = "047_face_embeddings.sql",
  sql = readFileSync(new URL("../database/" + name, import.meta.url), "utf8"),
  checksum = createHash("sha256").update(sql).digest("hex");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('aerotech-schema-migrations'))",
  );
  const ledger = await client.query(
    "SELECT to_regclass('public.schema_migrations') AS ledger",
  );
  if (!ledger.rows[0].ledger)
    throw Error("Run the core migration runner and adopt its ledger first.");
  const core = await client.query(
    "SELECT 1 FROM schema_migrations WHERE name='046_attendance_audit_holidays.sql'",
  );
  if (!core.rowCount) throw Error("Core migration 046 is required first.");
  const previous = await client.query(
    "SELECT checksum FROM schema_migrations WHERE name=$1",
    [name],
  );
  if (previous.rowCount) {
    if (previous.rows[0].checksum !== checksum)
      throw Error("Applied migration checksum differs");
    console.log("Face migration already applied.");
  } else {
    await client.query(sql);
    await client.query(
      "INSERT INTO schema_migrations(name,checksum) VALUES($1,$2)",
      [name, checksum],
    );
    console.log("Applied " + name);
  }
  await client.query("COMMIT");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  await client.end();
}
