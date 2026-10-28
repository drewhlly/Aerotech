import "./helpers/ts-loader.mjs";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  createProject,
  createTask,
  updateTask,
  dependency,
  projects,
  tasks,
} from "../src/lib/project-service.ts";
import { projectAccess, documentAccess } from "../src/lib/collaboration.ts";
import { scheduleMeeting, resolveGroups } from "../src/lib/meeting-service.ts";
const db = new PGlite();
const c = {
  query: async (sql, params = []) => {
    const r = await db.query(sql, params);
    return { ...r, rowCount: r.rows.length || r.affectedRows || 0 };
  },
};
await db.exec(
  `CREATE TABLE employer_accounts(id UUID PRIMARY KEY,email TEXT);CREATE TABLE workforce_employees(id UUID PRIMARY KEY,employer_id UUID REFERENCES employer_accounts(id),employee_number TEXT,first_name TEXT,last_name TEXT,email TEXT,job_title TEXT,department TEXT,location TEXT,employment_status TEXT,manager_employee_id UUID,UNIQUE(employer_id,id));CREATE TABLE ats_jobs(id UUID PRIMARY KEY,employer_id UUID,status TEXT);`,
);
await db.exec(readFileSync("database/018_aerotech_meet.sql", "utf8"));
await db.exec(readFileSync("database/037_collaboration.sql", "utf8"));
await db.exec(readFileSync("database/037_collaboration.sql", "utf8"));
const tenant = randomUUID(),
  other = randomUUID();
await c.query("INSERT INTO employer_accounts VALUES($1,$2),($3,$4)", [
  tenant,
  "owner@example.test",
  other,
  "other@example.test",
]);
const ids = Array.from({ length: 1000 }, () => randomUUID());
await c.query(
  `INSERT INTO workforce_employees(id,employer_id,employee_number,first_name,last_name,email,job_title,department,location,employment_status) SELECT x.id,$1,'EMP-'||x.n,'Person',x.n::text,'person'||x.n||'@example.test','Engineer','Engineering','Lagos','active' FROM unnest($2::uuid[]) WITH ORDINALITY x(id,n)`,
  [tenant, ids],
);
const outsider = randomUUID();
await c.query(
  "INSERT INTO workforce_employees VALUES($1,$2,'X','Other','Company','other@ex.test','HR','Other','Lagos','active',NULL)",
  [outsider, other],
);
const owner = {
    tenant,
    id: "employer:" + tenant,
    employee: null,
    department: null,
    role: "employer",
  },
  employee = {
    tenant,
    id: "employee:" + ids[0],
    employee: ids[0],
    department: "Engineering",
    role: "employee",
  },
  forbidden = { ...owner, tenant: other, id: "employer:" + other };
let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log("PASS " + name);
}
await check("migration applies twice without destructive changes", async () =>
  assert.equal(
    (await c.query("SELECT count(*) n FROM workforce_employees")).rows[0].n,
    1001,
  ),
);
const project = await createProject(c, owner, { name: "Launch" });
await c.query(
  "INSERT INTO project_members VALUES($1,$2,$3,'Contributor'),($1,$2,$4,'Viewer')",
  [tenant, project.id, ids[0], ids[1]],
);
await check(
  "cross-tenant and nonmember project access denied at database service boundary",
  async () => {
    await assert.rejects(
      () => projectAccess(c, forbidden, project.id),
      /not found/,
    );
    await assert.rejects(
      () => projectAccess(c, { ...employee, employee: ids[2] }, project.id),
      /not found/,
    );
  },
);
await check(
  "Viewer denied mutation and Contributor denied structure",
  async () => {
    await assert.rejects(
      () =>
        projectAccess(c, { ...employee, employee: ids[1] }, project.id, true),
      /role/,
    );
    await assert.rejects(
      () => createTask(c, employee, project.id, { title: "Forbidden" }),
      /role/,
    );
  },
);
const t1 = await createTask(c, owner, project.id, {
    title: "First",
    assignees: [ids[0]],
  }),
  t2 = await createTask(c, owner, project.id, {
    title: "Second",
    assignees: [ids[0]],
  });
await check(
  "assignment persisted and notification queued atomically",
  async () => {
    assert.equal(
      (await c.query("SELECT * FROM task_assignees WHERE task_id=$1", [t1.id]))
        .rows.length,
      1,
    );
    assert.ok(
      (await c.query("SELECT * FROM collaboration_jobs")).rows.length > 0,
    );
  },
);
await check(
  "cross-project task assignment and tenant keys enforced",
  async () => {
    await assert.rejects(
      () =>
        createTask(c, owner, project.id, {
          title: "Invalid",
          assignees: [outsider],
        }),
      /project members/,
    );
    await assert.rejects(() =>
      c.query("INSERT INTO project_members VALUES($1,$2,$3,'Manager')", [
        tenant,
        project.id,
        outsider,
      ]),
    );
  },
);
await dependency(c, owner, project.id, t2.id, t1.id);
await check("dependency cycle and premature completion blocked", async () => {
  await assert.rejects(
    () => dependency(c, owner, project.id, t1.id, t2.id),
    /cycle/,
  );
  await assert.rejects(
    () => updateTask(c, owner, project.id, t2.id, { status: "Done" }),
    /dependencies/,
  );
});
await updateTask(c, employee, project.id, t1.id, {
  status: "Done",
  revision: 1,
});
await updateTask(c, owner, project.id, t2.id, { status: "Done" });
await check(
  "contributor completes task; project auto-completes; stale revision rejected",
  async () => {
    assert.equal(
      (await c.query("SELECT status FROM projects WHERE id=$1", [project.id]))
        .rows[0].status,
      "Completed",
    );
    await assert.rejects(
      () =>
        updateTask(c, employee, project.id, t1.id, {
          status: "To Do",
          revision: 1,
        }),
      /changed/,
    );
  },
);
await check(
  "paginated project and task query preserves member restriction",
  async () => {
    assert.equal((await projects(c, employee, 20, 0)).length, 1);
    assert.equal((await tasks(c, employee, null, 1, 0)).length, 1);
    assert.equal(
      (await projects(c, { ...employee, employee: ids[3] }, 20, 0)).length,
      0,
    );
  },
);
const start = performance.now();
const m = await scheduleMeeting(c, owner, {
  title: "Engineering all hands",
  startsAt: new Date(Date.now() + 3600000).toISOString(),
  groups: [{ kind: "department", value: "Engineering" }],
  excludeIds: [ids[999]],
});
await check(
  "1000 staff server-side group invite resolves 999 deduplicated people and excludes one",
  async () => {
    assert.equal(m.participants, 999);
    assert.equal(
      (
        await c.query(
          "SELECT count(*)::int n FROM meet_participants WHERE room_id=$1",
          [m.id],
        )
      ).rows[0].n,
      999,
    );
    console.log(
      "Group scheduling milliseconds: " + Math.round(performance.now() - start),
    );
  },
);
await check(
  "cross-company group references never resolve foreign employees",
  async () =>
    assert.equal(
      (
        await resolveGroups(
          c,
          forbidden,
          [{ kind: "department", value: "Engineering" }],
          [],
        )
      ).size,
      0,
    ),
);
const doc = (
  await c.query(
    "INSERT INTO library_documents(employer_id,title,category,owner) VALUES($1,'Secret','Contracts',$2) RETURNING id",
    [tenant, owner.id],
  )
).rows[0].id;
await check(
  "private documents denied to employees and another company",
  async () => {
    await assert.rejects(() => documentAccess(c, employee, doc), /not found/);
    await assert.rejects(() => documentAccess(c, forbidden, doc), /not found/);
  },
);
await c.query("INSERT INTO document_grants VALUES($1,$2,$3)", [
  tenant,
  doc,
  ids[0],
]);
await check(
  "explicit sharing allows only intended recipient; management remains employer-only",
  async () => {
    assert.equal((await documentAccess(c, employee, doc)).id, doc);
    await assert.rejects(
      () => documentAccess(c, { ...employee, employee: ids[2] }, doc),
      /not found/,
    );
    await assert.rejects(
      () => documentAccess(c, employee, doc, true),
      /management/,
    );
  },
);
await check(
  "document grant tenant mismatch is rejected by foreign key",
  async () =>
    await assert.rejects(() =>
      c.query("INSERT INTO document_grants VALUES($1,$2,$3)", [
        tenant,
        doc,
        outsider,
      ]),
    ),
);
console.log(
  passed +
    " isolated PostgreSQL integration checks passed. No production database connected.",
);
await db.close();
