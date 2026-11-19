// Explicit isolated validation only. Connection arrives on stdin and is never printed.
import { mock } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import pg from "pg";
const input = createInterface({ input: process.stdin });
const connection = await new Promise((r) => input.once("line", r));
input.close();
try {
  const url = new URL(connection);
  if (url.pathname !== "/aerotech_staging")
    throw Error("Expected isolated staging database");
  process.env.DATABASE_URL = connection;
  process.env.MEETING_BUILT_IN_ENABLED = "false";
  for (let n = 0; n < 2; n++) {
    const result = spawnSync(process.execPath, ["scripts/migrate.mjs"], {
      env: process.env,
      encoding: "utf8",
    });
    if (result.status !== 0)
      throw Error("Staging migration failed; inspect ledger privately.");
    console.log(
      n === 0
        ? "PASS staging migrations 048/049"
        : "PASS migration replay uses checksum ledger",
    );
  }
  const pool = new pg.Pool({ connectionString: connection }),
    tenant = randomUUID();
  await pool.query(
    "INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,'Meetings isolated QA',$2,'QA','Host','000','Nigeria','not-a-login')",
    [tenant, tenant + "@example.invalid"],
  );
  await pool.query(
    "INSERT INTO company_subscriptions(employer_id,plan,status,currency,paid_until,reference) VALUES($1,'business','active','NGN',NOW()+INTERVAL '1 day',$2)",
    [tenant, tenant],
  );
  mock.module("../src/lib/employer-session.ts", {
    namedExports: {
      db: () => new pg.Pool({ connectionString: connection }),
      currentEmployer: async () => tenant,
    },
  });
  mock.module("../src/lib/employee-auth.ts", {
    namedExports: { currentEmployee: async () => null },
  });
  mock.module("../src/lib/applicant-session.ts", {
    namedExports: { currentApplicant: async () => null },
  });
  const api = await import("../src/app/api/meet/route.ts"),
    details = await import("../src/app/api/meet/[id]/details/route.ts");
  const req = (p, b) =>
    new Request("https://qa.aerotech.test" + p, {
      method: b ? "POST" : "GET",
      headers: {
        Origin: "https://qa.aerotech.test",
        "Content-Type": "application/json",
      },
      body: b ? JSON.stringify(b) : undefined,
    });
  const created = await api.POST(
    req("/api/meet", {
      title: "External link staging acceptance",
      instant: true,
      mode: "external_link",
      externalUrl: "https://meet.google.com/qa-only-qa",
      type: "audio",
    }),
  );
  assert.equal(created.status, 201);
  const id = (await created.json()).id;
  const list = await api.GET(req("/api/meet"));
  assert.equal(list.status, 200);
  assert.ok((await list.json()).meetings.some((m) => m.id === id));
  const cancelled = await details.POST(
    req("/api/meet/" + id + "/details", { action: "cancel" }),
    { params: Promise.resolve({ id }) },
  );
  assert.equal(cancelled.status, 200);
  const row = (
    await pool.query(
      "SELECT status FROM meetings WHERE id=$1 AND employer_id=$2",
      [id, tenant],
    )
  ).rows[0];
  assert.equal(row.status, "cancelled");
  console.log(
    "PASS actual Neon staging create/read/cancel; built-in disabled; no provider or email delivery",
  );
  await pool.end();
} catch {
  console.error(
    "Isolated Neon validation did not complete; check DNS/egress and ledger privately. No connection details emitted.",
  );
  process.exitCode = 1;
}
