// Isolated throwaway PostgreSQL-compatible server. Never reads DATABASE_URL.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID, createHash } from "node:crypto";
const db = await PGlite.create();
const source = readFileSync("scripts/migrate.mjs", "utf8");
const files = [...source.matchAll(/"(\d{3}_[^"]+\.sql)"/g)].map((m) => m[1]);
for (const file of files) {
  await db.exec(readFileSync("database/" + file, "utf8"));
  console.log("Applied isolated " + file);
}
const employer = randomUUID(),
  employee = randomUUID(),
  admin = randomUUID(),
  applicant = randomUUID(),
  nonmember = randomUUID(),
  foreign = randomUUID(),
  project = randomUUID();
await db.query(
  "INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash,subscription_required) VALUES($1,'Phase2 Test','company@example.test','Test','Owner','000','Nigeria','test-only',FALSE),($2,'Other company','other@example.test','Other','Owner','000','Nigeria','test-only',FALSE)",
  [employer, foreign],
);
const staff = [
  employee,
  nonmember,
  ...Array.from({ length: 998 }, () => randomUUID()),
];
await db.query(
  `INSERT INTO workforce_employees(id,employer_id,employee_number,first_name,last_name,email,job_title,department,location,employment_status) SELECT x.id,$1,'TEST-'||x.n,'Test',x.n::text,'test'||x.n||'@example.test','Engineer','Engineering','Lagos','active' FROM unnest($2::uuid[]) WITH ORDINALITY x(id,n)`,
  [employer, staff],
);
await db.query(
  "INSERT INTO employee_credentials(employee_id,employer_id,password_hash) VALUES($1,$3,'test-only'),($2,$3,'test-only')",
  [employee, nonmember, employer],
);
await db.query(
  "INSERT INTO support_agents(id,email,display_name,password_hash,totp_encrypted,is_super_admin) VALUES($1,'admin@example.test','Test Admin','test-only','test-only',TRUE)",
  [admin],
);
await db.query(
  "INSERT INTO applicant_accounts(id,first_name,last_name,email,phone,password_hash) VALUES($1,'Test','Candidate','candidate@example.test','000','test-only')",
  [applicant],
);
const hash = (s) => createHash("sha256").update(s).digest("hex");
for (const [role, token, id] of [
  ["employer", "phase2-test-employer", employer],
  ["employee", "phase2-test-employee", employee],
  ["employee", "phase2-test-nonmember", nonmember],
  ["support", "phase2-test-admin", admin],
  ["applicant", "phase2-test-applicant", applicant],
]) {
  const col = role === "support" ? "agent_id" : role + "_id";
  await db.query(
    `INSERT INTO ${role}_sessions(token_hash,${col},expires_at) VALUES($1,$2,NOW()+INTERVAL '1 day')`,
    [hash(token), id],
  );
}
await db.query(
  "INSERT INTO projects(id,employer_id,name,status) VALUES($1,$2,'Launch project','Active')",
  [project, employer],
);
await db.query(
  "INSERT INTO project_members(employer_id,project_id,employee_id,role) VALUES($1,$2,$3,'Contributor')",
  [employer, project, employee],
);
await db.query(
  "INSERT INTO project_tasks(employer_id,project_id,title,created_by,due_at) VALUES($1,$2,'Review launch tasks',$3,NOW()+INTERVAL '1 day')",
  [employer, project, "employer:" + employer],
);
await db.query("INSERT INTO employee_notifications(id,employer_id,employee_id,title,body) VALUES(gen_random_uuid(),$1,$2,'Lifecycle test notice','This should move to history after viewing.')",[employer,employee]);
await db.query("INSERT INTO workflow_alerts(employer_id,alert_key,title,details,expires_at) VALUES($1,'birthday:test:2000-01-01','Expired birthday fixture','Must never appear in the active inbox',NOW()-INTERVAL '1 day')",[employer]);
writeFileSync(
  "/tmp/phase2-fixture.json",
  JSON.stringify({ employer, employee, nonmember, admin, applicant, project }),
);
const server = new PGLiteSocketServer({
  db,
  port: 55432,
  host: "127.0.0.1",
  maxConnections: 100,
});
await server.start();
console.log("Isolated socket ready at 127.0.0.1:55432; 1000 mock staff.");
process.on("SIGTERM", async () => {
  await server.stop();
  await db.close();
  process.exit(0);
});
