import { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { installDailyFixture } from "./helpers/daily-fixture.mjs";
const database = new PGlite(),
  query = async (sql, args = []) => {
    const r = await database.query(sql, args);
    return { ...r, rowCount: r.rows.length || r.affectedRows || 0 };
  };
class Pool {
  query = query;
  async connect() {
    return { query, release() {} };
  }
  async end() {}
}
const tenant = randomUUID(),
  foreign = randomUUID(),
  employee = randomUUID(),
  otherEmployee = randomUUID(),
  applicant = randomUUID();
let mode = "employer",
  company = tenant;
mock.module("../src/lib/employer-session.ts", {
  namedExports: {
    db: () => new Pool(),
    currentEmployer: async () => (mode === "employer" ? company : null),
  },
});
mock.module("../src/lib/employee-auth.ts", {
  namedExports: {
    currentEmployee: async () =>
      mode === "employee"
        ? {
            id: employee,
            employer_id: tenant,
            first_name: "Test",
            last_name: "Employee",
          }
        : mode === "otherEmployee"
          ? {
              id: otherEmployee,
              employer_id: foreign,
              first_name: "Other",
              last_name: "Employee",
            }
          : null,
  },
});
mock.module("../src/lib/applicant-session.ts", {
  namedExports: {
    currentApplicant: async () => (mode === "applicant" ? applicant : null),
  },
});
for (const f of readFileSync("scripts/migrate.mjs", "utf8").matchAll(
  /"(\d{3}_[^"]+\.sql)"/g,
))
  await database.exec(readFileSync("database/" + f[1], "utf8"));
for (const id of [tenant, foreign])
  await query(
    "INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,'Synthetic',$2,'Test','Host','000','Nigeria','fixture')",
    [id, id + "@example.invalid"],
  );
for (const [id, t] of [
  [employee, tenant],
  [otherEmployee, foreign],
])
  await query(
    "INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,job_title,department,employment_status) VALUES($1,$2,'Test','Employee',$3,'Tester','QA','active')",
    [id, t, id + "@example.invalid"],
  );
await query(
  "INSERT INTO applicant_accounts(id,first_name,last_name,email,phone,password_hash) VALUES($1,'Test','Applicant','invited@example.invalid','000','fixture')",
  [applicant],
);
const fixture = installDailyFixture();
process.env.DOCUMENT_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
const meetings = await import("../src/app/api/meet/route.ts"),
  join = await import("../src/app/api/meet/[id]/join/route.ts"),
  lobby = await import("../src/app/api/meet/[id]/lobby/route.ts"),
  details = await import("../src/app/api/meet/[id]/details/route.ts"),
  calendar = await import("../src/app/api/meet/[id]/calendar/route.ts");
const req = (path, body, proof = "") =>
    new Request("https://aerotech.test" + path, {
      method: body ? "POST" : "GET",
      headers: {
        Origin: "https://aerotech.test",
        "Content-Type": "application/json",
        ...(proof ? { Authorization: "Bearer " + proof } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  ctx = (id) => ({ params: Promise.resolve({ id }) });
try {
  let r = await meetings.POST(
    req("/api/meet", {
      title: "Private call",
      instant: true,
      type: "audio",
      durationMinutes: 30,
      timezone: "Africa/Lagos",
      employeeIds: [employee],
      guestEmails: ["invited@example.invalid"],
    }),
  );
  assert.equal(r.status, 201, await r.clone().text());
  const room = (await r.json()).id;
  assert.equal(
    (
      await query(
        "SELECT count(*)::int n FROM meeting_participants WHERE meeting_id=$1",
        [room],
      )
    ).rows[0].n,
    3,
  );
  mode = "employee";
  assert.equal(
    (
      await meetings.POST(
        req("/api/meet", { title: "Forbidden", instant: true }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await join.POST(
        req("/api/meet/" + room + "/join", { name: "Employee" }),
        ctx(room),
      )
    ).status,
    202,
  );
  assert.equal(fixture.calls.length, 0, "waiting users receive no room/token");
  assert.equal(
    (
      await lobby.POST(
        req("/api/meet/" + room + "/lobby", {
          participantId: employee,
          admit: true,
        }),
        ctx(room),
      )
    ).status,
    403,
  );
  mode = "otherEmployee";
  assert.equal(
    (await join.GET(req("/api/meet/" + room + "/join"), ctx(room))).status,
    404,
  );
  mode = "employer";
  company = foreign;
  assert.equal(
    (await join.GET(req("/api/meet/" + room + "/join"), ctx(room))).status,
    404,
  );
  company = tenant;
  const waiting = await (
    await lobby.GET(req("/api/meet/" + room + "/lobby"), ctx(room))
  ).json();
  assert.equal(waiting.waiting.length, 1);
  assert.equal(
    (
      await lobby.POST(
        req("/api/meet/" + room + "/lobby", {
          participantId: waiting.waiting[0].id,
          admit: true,
        }),
        ctx(room),
      )
    ).status,
    200,
  );
  mode = "employee";
  r = await join.POST(
    req("/api/meet/" + room + "/join", { name: "Employee" }),
    ctx(room),
  );
  assert.equal(r.status, 200, await r.clone().text());
  const session = await r.json();
  assert.ok(session.token);
  assert.equal(session.type, "audio");
  const claims = JSON.parse(
    Buffer.from(session.token.split(".")[1], "base64url"),
  );
  assert.equal(claims.is_owner, false);
  assert.deepEqual(claims.permissions.canSend, ["audio"]);
  assert.ok(claims.exp - claims.iat <= 300);
  assert.equal(
    (
      await join.POST(
        req("/api/meet/" + room + "/join", { name: "Employee" }),
        ctx(room),
      )
    ).status,
    429,
  );
  mode = "applicant";
  assert.equal(
    (await join.GET(req("/api/meet/" + room + "/join"), ctx(room))).status,
    403,
    "email login alone is not an invitation proof",
  );
  const person = (
    await query(
      "SELECT id FROM meeting_participants WHERE meeting_id=$1 AND principal_type='email'",
      [room],
    )
  ).rows[0];
  const { meetingInvitation } =
    await import("../src/lib/meeting-invitations.ts");
  const proof = await meetingInvitation(person.id, 1);
  assert.equal(
    (
      await join.GET(
        req("/api/meet/" + room + "/join", undefined, proof),
        ctx(room),
      )
    ).status,
    200,
  );
  assert.equal(
    (await (await meetings.GET(req("/api/meet"))).json()).meetings.length,
    1,
  );
  assert.equal(
    (
      await join.POST(
        req("/api/meet/" + room + "/join", { name: "Applicant" }),
        ctx(room),
      )
    ).status,
    202,
  );
  mode = "employer";
  const queue = await (
    await lobby.GET(req("/api/meet/" + room + "/lobby"), ctx(room))
  ).json();
  await lobby.POST(
    req("/api/meet/" + room + "/lobby", {
      participantId: queue.waiting[0].id,
      admit: true,
    }),
    ctx(room),
  );
  const file = await calendar.GET(
    req("/api/meet/" + room + "/calendar"),
    ctx(room),
  );
  assert.equal(file.status, 200);
  assert.ok((await file.text()).includes("BEGIN:VCALENDAR"));
  r = await details.POST(
    req("/api/meet/" + room + "/details", {
      action: "reschedule",
      startsAt: new Date(Date.now() + 3600000).toISOString(),
      durationMinutes: 30,
      timezone: "UTC",
      type: "video",
    }),
    ctx(room),
  );
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal(
    (await query("SELECT join_generation FROM meet_rooms WHERE id=$1", [room]))
      .rows[0].join_generation,
    2,
  );
  mode = "employee";
  assert.equal(
    (await join.GET(req("/api/meet/" + room + "/join"), ctx(room))).status,
    425,
  );
  await query("UPDATE meet_rooms SET starts_at=NOW() WHERE id=$1", [room]);
  assert.equal(
    (
      await join.POST(
        req("/api/meet/" + room + "/join", { name: "Employee" }),
        ctx(room),
      )
    ).status,
    202,
    "reschedule resets admission",
  );
  mode = "employer";
  await details.POST(
    req("/api/meet/" + room + "/details", { action: "cancel" }),
    ctx(room),
  );
  assert.equal(
    (await join.GET(req("/api/meet/" + room + "/join"), ctx(room))).status,
    410,
  );
  for (let n = 0; n < 4; n++)
    assert.equal(
      (
        await meetings.POST(
          req("/api/meet", {
            title: "Rate test",
            instant: true,
            employeeIds: [],
          }),
        )
      ).status,
      201,
    );
  assert.equal(
    (
      await meetings.POST(
        req("/api/meet", {
          title: "Rate test",
          instant: true,
          employeeIds: [],
        }),
      )
    ).status,
    429,
  );
  const noOrigin=await join.POST(new Request('https://aerotech.test/api/meet/'+room+'/join',{method:'POST',headers:{Origin:'https://foreign.test'},body:'{}'}),ctx(room));assert.equal(noOrigin.status,403);
  const openRoom=(await query("SELECT id FROM meet_rooms WHERE status='scheduled' AND employer_id=$1 LIMIT 1",[tenant])).rows[0].id;
  process.env.MEETING_MONTHLY_BUDGET_MINUTES='1';assert.equal((await join.POST(req('/api/meet/'+openRoom+'/join',{name:'Host'}),ctx(openRoom))).status,429);delete process.env.MEETING_MONTHLY_BUDGET_MINUTES;
  process.env.RESEND_API_KEY='disposable-only';process.env.INVITATION_FROM_EMAIL='noreply@example.invalid';process.env.APP_BASE_URL='https://aerotech.test';
  const {runCollaborationJobs}=await import('../src/lib/collaboration-worker.ts');const work=await runCollaborationJobs();assert.equal(work.failed,0);const sent=fixture.calls.filter(c=>c.url==='https://api.resend.com/emails');assert.ok(sent.length>0);for(const call of sent){const mail=JSON.parse(call.options.body);assert.equal(mail.attachments[0].filename,'aerotech-meeting.ics');assert.ok(Buffer.from(mail.attachments[0].content,'base64').toString().includes('BEGIN:VCALENDAR'));assert.ok(!mail.text.includes('daily.co'));}
  const delivered=sent.length;await runCollaborationJobs();assert.equal(fixture.calls.filter(c=>c.url==='https://api.resend.com/emails').length,delivered,'email retries are idempotent');assert.ok((await query("SELECT count(*)::int n FROM collaboration_notifications WHERE actor=$1",['employer:'+tenant])).rows[0].n>0);
  console.log(
    "PASS Daily meeting roles, 1:1 invitations, mailbox proof, lobby admission, token role/TTL, calendar, reschedule revocation, cancellation, tenant isolation and creation limit.",
  );
} finally {
  fixture.restore();
  await database.close();
}
