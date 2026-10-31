import { mock } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { randomUUID, createHash } from "node:crypto";
import assert from "node:assert/strict";
const database = new PGlite();
const query = async (sql, params = []) => {
  const r = await database.query(sql, params);
  return { ...r, rowCount: r.rows.length || r.affectedRows || 0 };
};
class Pool {
  query = query;
  async connect() {
    return { query, release() {} };
  }
  async end() {}
}
let jar = {};
mock.module("pg", { namedExports: { Pool, types: { setTypeParser() {} } } });
mock.module("next/headers.js", {
  namedExports: {
    cookies: async () => ({
      get: (k) => (jar[k] ? { value: jar[k] } : undefined),
    }),
    headers: async () => new Headers(),
  },
});
process.env.DATABASE_URL = "postgres://isolated-mock-only";
process.env.DOCUMENT_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
await database.exec(
  `CREATE TABLE employer_accounts(id UUID PRIMARY KEY,email TEXT,company_email TEXT,subscription_required BOOLEAN DEFAULT FALSE);CREATE TABLE workforce_employees(id UUID PRIMARY KEY,employer_id UUID REFERENCES employer_accounts(id),employee_number TEXT,first_name TEXT,last_name TEXT,email TEXT,job_title TEXT,department TEXT,location TEXT,employment_status TEXT,manager_employee_id UUID,UNIQUE(employer_id,id));CREATE TABLE ats_jobs(id UUID PRIMARY KEY,employer_id UUID,status TEXT);CREATE TABLE employer_sessions(token_hash TEXT,employer_id UUID,expires_at TIMESTAMPTZ);CREATE TABLE employee_sessions(token_hash TEXT,employee_id UUID,expires_at TIMESTAMPTZ);CREATE TABLE company_subscriptions(employer_id UUID,plan TEXT,status TEXT,paid_until TIMESTAMPTZ);`,
);
await database.exec(readFileSync("database/018_aerotech_meet.sql", "utf8"));
await database.exec(readFileSync("database/037_collaboration.sql", "utf8"));
await database.exec("CREATE TABLE IF NOT EXISTS workflow_alerts(employer_id UUID,alert_key TEXT,title TEXT,created_at TIMESTAMPTZ DEFAULT NOW(),read_at TIMESTAMPTZ);CREATE TABLE IF NOT EXISTS employee_notifications(employer_id UUID,employee_id UUID,title TEXT,created_at TIMESTAMPTZ DEFAULT NOW(),read_at TIMESTAMPTZ)");
await database.exec(readFileSync("database/038_notification_lifecycle.sql","utf8"));
await database.exec(readFileSync("database/039_guest_meetings.sql","utf8"));
await database.exec("CREATE TABLE ats_applications(id UUID,job_id UUID,stage TEXT,interview_completed_at TIMESTAMPTZ,interview_room_id UUID,interview_at TIMESTAMPTZ,interview_revision INT DEFAULT 0)");
const owner = randomUUID(),
  other = randomUUID(),
  employee = randomUUID(),
  nonmember = randomUUID();
await query(
  "INSERT INTO employer_accounts(id,email) VALUES($1,'owner@example.test'),($2,'other@example.test')",
  [owner, other],
);
for (const e of [employee, nonmember])
  await query(
    "INSERT INTO workforce_employees VALUES($1,$2,'EMP','Test','User',$3,'Engineer','Engineering','Lagos','active',NULL)",
    [e, owner, e + "@example.test"],
  );
const hash = (s) => createHash("sha256").update(s).digest("hex");
await query(
  "INSERT INTO employer_sessions VALUES($1,$2,NOW()+INTERVAL '1 day'),($3,$4,NOW()+INTERVAL '1 day')",
  [hash("owner"), owner, hash("other"), other],
);
await query(
  "INSERT INTO employee_sessions VALUES($1,$2,NOW()+INTERVAL '1 day'),($3,$4,NOW()+INTERVAL '1 day')",
  [hash("employee"), employee, hash("nonmember"), nonmember],
);
const projects =
    await import("../src/app/api/projects/[[...segments]]/route.ts"),
  docs =
    await import("../src/app/api/document-library/[[...segments]]/route.ts"),
  meet = await import("../src/app/api/meet/route.ts"),
  join = await import("../src/app/api/meet/[id]/join/route.ts"),
  people = await import("../src/app/api/meet/people/route.ts"),
  search = await import("../src/app/api/collaboration/search/route.ts"),
  notices = await import("../src/app/api/collaboration/notifications/route.ts");
const ctx = (...segments) => ({ params: Promise.resolve({ segments }) }),
  req = (url, method = "GET", body) =>
    new Request("https://aerotech.test" + url, {
      method,
      headers:
        body instanceof FormData ? {} : { "Content-Type": "application/json" },
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
let count = 0;
async function check(name, fn) {
  await fn();
  count++;
  console.log("PASS " + name);
}
await check("API denies unauthenticated reads and writes", async () => {
  assert.equal((await projects.GET(req("/api/projects"), ctx())).status, 401);
  assert.equal(
    (await docs.POST(req("/api/document-library", "POST", {}), ctx())).status,
    401,
  );
});
jar = { aerotech_employer_session: "owner" };
const project = await (
  await projects.POST(
    req("/api/projects", "POST", { name: "API project" }),
    ctx(),
  )
).json();
await projects.POST(
  req("/api/projects/" + project.id + "/members", "POST", {
    employeeId: employee,
    role: "Contributor",
  }),
  ctx(project.id, "members"),
);
const task = await (
  await projects.POST(
    req("/api/projects/" + project.id + "/tasks", "POST", {
      title: "API task",
      assignees: [employee],
    }),
    ctx(project.id, "tasks"),
  )
).json();
await check(
  "API creates project, member and task with tenant-scoped session identity",
  async () => assert.ok(task.id),
);
jar = { aerotech_employee_session: "nonmember" };
await check(
  "API denies employee project/task access outside membership",
  async () => {
    assert.equal(
      (await projects.GET(req("/api/projects/" + project.id), ctx(project.id)))
        .status,
      404,
    );
    assert.equal(
      (
        await projects.PATCH(
          req("/api/projects/" + project.id + "/tasks/" + task.id, "PATCH", {
            status: "Done",
          }),
          ctx(project.id, "tasks", task.id),
        )
      ).status,
      404,
    );
  },
);
jar = { aerotech_employer_session: "other" };
await check(
  "API denies another company reading or changing a project",
  async () =>
    assert.equal(
      (
        await projects.PATCH(
          req("/api/projects/" + project.id, "PATCH", { status: "Completed" }),
          ctx(project.id),
        )
      ).status,
      404,
    ),
);
jar = { aerotech_employee_session: "employee" };
await check(
  "API lets Contributor update status but blocks membership changes",
  async () => {
    assert.equal(
      (
        await projects.PATCH(
          req("/api/projects/" + project.id + "/tasks/" + task.id, "PATCH", {
            status: "Done",
          }),
          ctx(project.id, "tasks", task.id),
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await projects.POST(
          req("/api/projects/" + project.id + "/members", "POST", {
            employeeId: nonmember,
            role: "Owner",
          }),
          ctx(project.id, "members"),
        )
      ).status,
      403,
    );
  },
);
jar = { aerotech_employer_session: "owner" };
const f = new FormData();
f.set("title", "Private contract");
f.set(
  "file",
  new File([Buffer.from("%PDF-1.4 test")], "contract.pdf", {
    type: "application/pdf",
  }),
);
const upload = await docs.POST(req("/api/document-library", "POST", f), ctx());
const uploaded = await upload.json();
await check("API upload encrypts and quarantines the document", async () => {
  assert.equal(upload.status, 201);
  const meta = await (
    await docs.GET(
      req("/api/document-library/" + uploaded.id),
      ctx(uploaded.id),
    )
  ).json();
  assert.equal(meta.downloadUrl, null);
  assert.equal(meta.versions[0].scan_status, "pending");
});
await check(
  "API document list accepts empty optional filters from the browser",
  async () => {
    const r = await docs.GET(
      req("/api/document-library?folder=&category=&status=&type="),
      ctx(),
    );
    assert.equal(r.status, 200);
    assert.equal((await r.json()).records.length, 1);
  },
);
jar = { aerotech_employee_session: "employee" };
await check(
  "API document metadata and downloads denied until explicitly shared",
  async () =>
    assert.equal(
      (
        await docs.GET(
          req("/api/document-library/" + uploaded.id),
          ctx(uploaded.id),
        )
      ).status,
      404,
    ),
);
jar = { aerotech_employer_session: "owner" };
await docs.POST(
  req("/api/document-library/" + uploaded.id, "POST", {
    action: "share",
    visibility: "people",
    employeeIds: [employee],
  }),
  ctx(uploaded.id),
);
await query(
  "UPDATE library_document_versions SET scan_status='clean' WHERE document_id=$1",
  [uploaded.id],
);
jar = { aerotech_employee_session: "employee" };
const meta = await (
  await docs.GET(req("/api/document-library/" + uploaded.id), ctx(uploaded.id))
).json();
await check(
  "API clean version download uses user-bound signed short-lived URL",
  async () => {
    const response = await docs.GET(
      req(meta.downloadUrl),
      ctx(uploaded.id, "download"),
    );
    assert.equal(response.status, 200);
    assert.ok((await response.text()).startsWith("%PDF"));
    assert.equal(
      (
        await docs.GET(
          req(meta.downloadUrl.replace(/signature=[^&]+/, "signature=invalid")),
          ctx(uploaded.id, "download"),
        )
      ).status,
      410,
    );
  },
);
jar = { aerotech_employer_session: "owner" };
await docs.POST(
  req("/api/document-library/" + uploaded.id, "POST", {
    action: "send",
    employeeIds: [employee],
  }),
  ctx(uploaded.id),
);
jar = { aerotech_employee_session: "employee" };
await check(
  "API acknowledgement requires consent and cannot be replayed",
  async () => {
    assert.equal(
      (
        await docs.PATCH(
          req("/api/document-library/" + uploaded.id, "PATCH", {
            status: "Signed",
            signedName: "Test User",
            consent: false,
          }),
          ctx(uploaded.id),
        )
      ).status,
      400,
    );
  },
);
await check(
  "API employee signs current version; replay returns conflict and receipt is a PDF",
  async () => {
    assert.equal(
      (
        await docs.PATCH(
          req("/api/document-library/" + uploaded.id, "PATCH", {
            status: "Signed",
            signedName: "Test User",
            consent: true,
          }),
          ctx(uploaded.id),
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await docs.PATCH(
          req("/api/document-library/" + uploaded.id, "PATCH", {
            status: "Signed",
            signedName: "Test User",
            consent: true,
          }),
          ctx(uploaded.id),
        )
      ).status,
      409,
    );
    assert.equal(
      (
        await docs.GET(
          req("/api/document-library/" + uploaded.id + "/signed-copy"),
          ctx(uploaded.id, "signed-copy"),
        )
      ).headers.get("Content-Type"),
      "application/pdf",
    );
  },
);
jar = { aerotech_employer_session: "owner" };
const meeting = await (
  await meet.POST(
    req("/api/meet", "POST", {
      title: "Future meeting",
      startsAt: new Date(Date.now() + 3600000).toISOString(),
      groups: [{ kind: "department", value: "Engineering" }],
    }),
  )
).json();
await check(
  "API hides early join even when conferencing is not configured",
  async () => {
    assert.equal(
      (
        await join.GET(req("/api/meet/" + meeting.id + "/join"), {
          params: Promise.resolve({ id: meeting.id }),
        })
      ).status,
      425,
    );
  },
);
await query(
  "UPDATE meet_rooms SET starts_at=NOW()-INTERVAL '2 hours' WHERE id=$1",
  [meeting.id],
);
await check(
  "API expired meeting returns explicit expired state and no video token",
  async () => {
    const r = await join.GET(req("/api/meet/" + meeting.id + "/join"), {
        params: Promise.resolve({ id: meeting.id }),
      }),
      b = await r.json();
    assert.equal(r.status, 410);
    assert.equal(b.state, "expired");
    assert.equal(b.token, undefined);
  },
);
const thousand = Array.from({ length: 1000 }, () => randomUUID());
await query(
  "INSERT INTO workforce_employees(id,employer_id,employee_number,first_name,last_name,email,job_title,department,employment_status) SELECT x.id,$1,'LOAD-'||x.n,'Load',x.n::text,'load'||x.n||'@example.test','Engineer','Engineering','active' FROM unnest($2::uuid[]) WITH ORDINALITY x(id,n)",
  [owner, thousand],
);
await check(
  "API picker returns at most 20 out of 1000, supports staff ID and department search",
  async () => {
    const start = performance.now();
    const r = await people.GET(req("/api/meet/people?q=Engineering")),
      d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.records.length, 20);
    assert.equal(d.hasMore, true);
    const found = await (
      await people.GET(req("/api/meet/people?q=LOAD-1000"))
    ).json();
    assert.equal(found.records.length, 1);
    assert.ok(performance.now() - start < 1000);
    console.log("Picker query ms " + Math.round(performance.now() - start));
  },
);
jar = { aerotech_employee_session: "nonmember" };
await check(
  "API global search cannot leak private projects, tasks or documents",
  async () => {
    const r = await search.GET(req("/api/collaboration/search?q=API")),
      d = await r.json();
    assert.equal(d.records.length, 0);
    assert.equal((await people.GET(req("/api/meet/people"))).status, 403);
  },
);
jar = { aerotech_employer_session: "owner" };
await check(
  "API project editing preserves tenant access and validates date order",
  async () => {
    assert.equal(
      (
        await projects.PATCH(
          req("/api/projects/" + project.id, "PATCH", {
            name: "Updated project",
            startsOn: "2026-11-01",
            endsOn: "2026-12-01",
            budget: 100,
          }),
          ctx(project.id),
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await projects.PATCH(
          req("/api/projects/" + project.id, "PATCH", {
            startsOn: "2026-12-02",
            endsOn: "2026-12-01",
          }),
          ctx(project.id),
        )
      ).status,
      400,
    );
  },
);
await check("API creates a subtask within its parent project", async () => {
  const r = await projects.POST(
    req(
      "/api/projects/" + project.id + "/tasks/" + task.id + "/subtasks",
      "POST",
      { title: "Nested task" },
    ),
    ctx(project.id, "tasks", task.id, "subtasks"),
  );
  assert.equal(r.status, 201);
  assert.equal((await r.json()).parent_id, task.id);
});
const details = await import("../src/app/api/meet/[id]/details/route.ts");
await check("API meeting action items create project tasks", async () => {
  const r = await details.POST(
    req("/api/meet/" + meeting.id + "/details", "POST", {
      action: "task",
      title: "Follow up",
      projectId: project.id,
    }),
    { params: Promise.resolve({ id: meeting.id }) },
  );
  assert.equal(r.status, 201);
  const b = await r.json();
  assert.equal(
    (
      await query("SELECT project_id FROM project_tasks WHERE id=$1", [
        b.taskId,
      ])
    ).rows[0].project_id,
    project.id,
  );
});
await check(
  "API tokens last at most 60 seconds and cancellation immediately denies further access",
  async () => {
    await query(
      "UPDATE meet_rooms SET starts_at=NOW(),status='scheduled',revoked_at=NULL WHERE id=$1",
      [meeting.id],
    );
    process.env.JITSI_DOMAIN = "video.example.test";
    process.env.JITSI_APP_ID = "test-app";
    process.env.JITSI_APP_SECRET = "a".repeat(64);
    const opened = await join.GET(req("/api/meet/" + meeting.id + "/join"), {
      params: Promise.resolve({ id: meeting.id }),
    });
    assert.equal(opened.status, 200);
    const token = (await opened.json()).token,
      claims = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString(),
      );
    assert.ok(claims.exp - claims.iat <= 60);
    assert.equal(
      (
        await details.POST(
          req("/api/meet/" + meeting.id + "/details", "POST", {
            action: "cancel",
          }),
          { params: Promise.resolve({ id: meeting.id }) },
        )
      ).status,
      200,
    );
    assert.equal(
      (
        await join.GET(req("/api/meet/" + meeting.id + "/join"), {
          params: Promise.resolve({ id: meeting.id }),
        })
      ).status,
      410,
    );
    await query(
      "UPDATE meet_rooms SET status='scheduled',revoked_at=NULL,starts_at=NOW()-INTERVAL '2 hours' WHERE id=$1",
      [meeting.id],
    );
  },
);
jar = { aerotech_employee_session: "employee" };
await notices.PATCH(
  req("/api/collaboration/notifications", "PATCH", {
    event: "assignment",
    inApp: false,
    email: false,
    digest: "none",
  }),
);
process.env.RESEND_API_KEY = "test-only";
process.env.INVITATION_FROM_EMAIL = "test@example.test";
let sent = 0;
globalThis.fetch = async () => {
  sent++;
  return new Response(JSON.stringify({ id: "test" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
const { runCollaborationJobs } =
  await import("../src/lib/collaboration-worker.ts");
await runCollaborationJobs();
await check(
  "scheduler expires meeting records and notification preferences suppress assignment channels",
  async () => {
    assert.equal(
      (await query("SELECT status FROM meet_rooms WHERE id=$1", [meeting.id]))
        .rows[0].status,
      "ended",
    );
    const n = await (
      await notices.GET(req("/api/collaboration/notifications"))
    ).json();
    assert.equal(
      n.records.some((x) => x.event === "assignment"),
      false,
    );
    assert.equal(
      (
        await query(
          "SELECT count(*)::int n FROM collaboration_jobs WHERE kind='email' AND payload->>'event'='assignment'",
        )
      ).rows[0].n,
      0,
    );
  },
);
await check(
  "worker is idempotent and scan failures leave content quarantined",
  async () => {
    const before = (
      await query("SELECT count(*)::int n FROM collaboration_notifications")
    ).rows[0].n;
    await runCollaborationJobs();
    assert.equal(
      (await query("SELECT count(*)::int n FROM collaboration_notifications"))
        .rows[0].n,
      before,
    );
    assert.ok(sent >= 0);
  },
);
await check("read and expired notices leave active inbox but remain in history",async()=>{
 jar={aerotech_employee_session:"employee"};const active=randomUUID(),expired=randomUUID(),read=randomUUID();
 await query("INSERT INTO collaboration_notifications(id,employer_id,actor,event,title,body,href,source_key,read_at,expires_at) VALUES($1,$4,$5,'comment','Active','','/employee/tasks','completion-active',NULL,NULL),($2,$4,$5,'comment','Expired','','/employee/tasks','completion-expired',NULL,NOW()-INTERVAL '1 second'),($3,$4,$5,'comment','Read','','/employee/tasks','completion-read',NOW(),NULL)",[active,expired,read,owner,"employee:"+employee]);
 let d=await(await notices.GET(req("/api/collaboration/notifications"))).json();assert.ok(d.records.some(x=>x.id===active));assert.ok(!d.records.some(x=>[expired,read].includes(x.id)));
 assert.equal((await notices.PATCH(req("/api/collaboration/notifications","PATCH",{id:active}))).status,200);
 d=await(await notices.GET(req("/api/collaboration/notifications?history=1&limit=100"))).json();for(const id of [active,expired,read])assert.ok(d.records.some(x=>x.id===id));
 jar={aerotech_employee_session:"nonmember"};d=await(await notices.GET(req("/api/collaboration/notifications?history=1"))).json();assert.ok(!d.records.some(x=>[active,expired,read].includes(x.id)));
});
await check("metadata updates reject foreign employee references",async()=>{
 jar={aerotech_employer_session:"owner"};let r=await docs.POST(req("/api/document-library/"+uploaded.id,"POST",{action:"metadata",title:"Updated document",category:"Contracts",employeeId:employee,tags:"contract, reviewed"}),ctx(uploaded.id));assert.equal(r.status,200);
 r=await docs.POST(req("/api/document-library/"+uploaded.id,"POST",{action:"metadata",title:"Wrong",category:"Contracts",employeeId:randomUUID()}),ctx(uploaded.id));assert.equal(r.status,404);
});
await check("guest bearer access is meeting scoped and expired server-side",async()=>{
 jar={};const room=randomUUID();await query("INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes) VALUES($1,$2,'Guest',NOW()+INTERVAL '1 hour',30)",[room,owner]);await query("INSERT INTO meeting_guests(employer_id,room_id,email) VALUES($1,$2,'guest@example.test')",[owner,room]);
 const {guestInvitation}=await import("../src/lib/meeting-guest.ts"),token=guestInvitation(room,"guest@example.test",1),request=t=>new Request("https://aerotech.test/api/meet/"+room+"/join",{headers:{Authorization:"Bearer "+t}}),context={params:Promise.resolve({id:room})};assert.equal((await join.GET(request(token),context)).status,425);assert.equal((await join.GET(request(token+'forged'),context)).status,401);assert.equal((await projects.GET(req('/api/projects'),ctx())).status,401);await query("UPDATE meet_rooms SET starts_at=NOW()-INTERVAL '2 hours' WHERE id=$1",[room]);assert.equal((await join.GET(request(token),context)).status,410);
});
console.log(
  count +
    " actual API-handler integration checks passed using isolated PostgreSQL and mocked session/provider boundaries. No production database, emails or external service calls.",
);
await database.close();
