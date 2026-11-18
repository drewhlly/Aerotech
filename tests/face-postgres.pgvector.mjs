// Real pgvector integration, only against a disposable local CI database.
import { mock } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import pg from "pg";
const connection = process.env.FACE_TEST_DATABASE_URL;
if (!connection) throw Error("FACE_TEST_DATABASE_URL is required");
const u = new URL(connection);
if (
  !["localhost", "127.0.0.1"].includes(u.hostname) ||
  u.pathname !== "/aerotech_face_test"
)
  throw Error(
    "Only the disposable localhost aerotech_face_test database is allowed",
  );
for (const file of ["scripts/migrate.mjs", "scripts/migrate-face.mjs"]) {
  const r = spawnSync(process.execPath, [file], {
    env: { ...process.env, DATABASE_URL: connection },
    encoding: "utf8",
  });
  if (r.status !== 0) throw Error(r.stderr || r.stdout);
}
pg.types.setTypeParser(1082, (value) => value);
const pool = new pg.Pool({ connectionString: connection, max: 4 });
const company = randomUUID(),
  foreign = randomUUID(),
  id = randomUUID(),
  other = randomUUID(),
  manager = randomUUID();
let employee = { id, employer_id: company },
  employer = null;
mock.module(new URL("../src/lib/employer-session.ts", import.meta.url).href, {
  namedExports: {
    db: () => new pg.Pool({ connectionString: connection, max: 4 }),
    currentEmployer: async () => employer,
  },
});
mock.module(new URL("../src/lib/employee-auth.ts", import.meta.url).href, {
  namedExports: { currentEmployee: async () => employee },
});
mock.module("next/headers.js", {
  namedExports: {
    cookies: async () => ({ get: () => ({ value: "isolated-test-session" }) }),
  },
});
process.env.FACE_ATTENDANCE_ENABLED = "true";
const api = await import("../src/lib/face-service.ts");
const policy = await import("../src/lib/face-policy.ts");
const request = (body) =>
  new Request("http://localhost/api/face", {
    method: "POST",
    headers: { origin: "http://localhost", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
async function issue(purpose) {
  const r = await api.issueFaceChallenge(request({ purpose }));
  assert.equal(r.status, 200);
  const d = await r.json();
  await pool.query(
    "UPDATE face_challenges SET created_at=NOW()-INTERVAL '3 seconds' WHERE id=$1",
    [d.id],
  );
  return d;
}
const motion = (action) =>
  [0, 400, 800, 1200, 1600, 2200].map((at, i) => ({
    at,
    eye: action === "blink" && (i === 2 || i === 3) ? 0.14 : 0.3,
    yaw:
      action === "left" && i === 2
        ? -0.3
        : action === "right" && i === 2
          ? 0.3
          : 0,
    smile: action === "smile" && i === 2 ? 0.95 : 0.1,
  }));
const sample = (v) => Array(128).fill(v);
async function resetLimit() {
  await pool.query("DELETE FROM face_attempt_limits WHERE employee_id=$1", [
    id,
  ]);
}
try {
  for (const c of [company, foreign])
    await pool.query(
      "INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,'Synthetic',$2,'Test','HR','000','Nigeria','not-a-real-password')",
      [c, c + "@example.test"],
    );
  for (const [emp, co] of [
    [id, company],
    [other, foreign],
    [manager, company],
  ])
    await pool.query(
      "INSERT INTO workforce_employees(id,employer_id,employee_number,first_name,last_name,email,job_title,department,location,employment_status) VALUES($1,$2,$1::text,'Synthetic','Employee',$3,'Tester','QA','Lagos','active')",
      [emp, co, emp + "@example.test"],
    );
  await pool.query(
    "UPDATE workforce_employees SET manager_employee_id=$1 WHERE id=$2",
    [manager, id],
  );
  employee = null;
  await assert.rejects(
    () => api.faceStatus(),
    (e) => e.status === 401,
  );
  employee = { id, employer_id: company };
  let challenge = await issue("enroll");
  const enrolled = await api.enrollFace(
    request({
      challengeId: challenge.id,
      motion: motion(challenge.action),
      consent: true,
      consentVersion: policy.FACE_CONSENT_VERSION,
      embeddings: [sample(0.03), sample(0.04), sample(0.05)],
    }),
  );
  assert.equal(enrolled.status, 201);
  assert.equal(
    (
      await pool.query(
        "SELECT count(*)::int n FROM face_templates WHERE employee_id=$1 AND is_active",
        [id],
      )
    ).rows[0].n,
    0,
  );
  const status = await (await api.faceStatus()).json();
  assert.ok(!JSON.stringify(status).includes("embedding"));
  assert.equal(status.enrollment.samples, 3);
  employer = foreign;
  await assert.rejects(
    () =>
      api.reviewFace(
        request({
          action: "approve_enrollment",
          employeeId: id,
          note: "Supervised identity checked",
        }),
      ),
    (e) => e.status === 404,
  );
  employer = company;
  await api.reviewFace(
    request({
      action: "approve_enrollment",
      employeeId: id,
      note: "Supervised identity checked",
    }),
  );
  employer = null;
  challenge = await issue("clock_in");
  const uncertain = await api.submitFaceAttendance(
    request({
      eventType: "clock_in",
      embedding: sample(0.05 + 0.47 / Math.sqrt(128)),
      challengeId: challenge.id,
      motion: motion(challenge.action),
    }),
  );
  assert.equal(uncertain.status, 201);
  const uncertainRequest = await uncertain.json();
  assert.match(
    (
      await pool.query(
        "SELECT reason FROM face_attendance_requests WHERE id=$1",
        [uncertainRequest.id],
      )
    ).rows[0].reason,
    /Uncertain/,
  );
  employer = company;
  await api.reviewFace(
    request({
      action: "reject",
      employeeId: id,
      requestId: uncertainRequest.id,
      note: "Uncertain identity requires another attempt",
    }),
  );
  employer = null;
  challenge = await issue("clock_in");
  const body = {
    eventType: "clock_in",
    method: "face",
    embedding: sample(0.03),
    challengeId: challenge.id,
    motion: motion(challenge.action),
    eventTime: "1990-01-01",
  };
  const submitted = await api.submitFaceAttendance(request(body));
  assert.equal(submitted.status, 201);
  const pending = await submitted.json();
  assert.equal(pending.status, "needs_review");
  assert.ok(new Date(pending.event_time).getFullYear() > 2020);
  assert.equal(
    (
      await pool.query(
        "SELECT count(*)::int n FROM hr_attendance_events WHERE employee_id=$1",
        [id],
      )
    ).rows[0].n,
    0,
  );
  await assert.rejects(
    () => api.submitFaceAttendance(request(body)),
    (e) => e.status === 409,
  );
  employer = company;
  await api.reviewFace(
    request({
      action: "approve",
      employeeId: id,
      requestId: pending.id,
      note: "Confirmed shift start with supervisor",
    }),
  );
  employer = null;
  const accepted = (
    await pool.query(
      "SELECT * FROM hr_attendance_events WHERE employee_id=$1",
      [id],
    )
  ).rows[0];
  assert.equal(accepted.event_time.toISOString(), pending.event_time);
  assert.equal(accepted.status, "verified");
  for (let i = 0; i < 2; i++)
    await pool.query(
      "INSERT INTO face_templates(id,employee_id,employer_id,embedding) VALUES($1,$2,$3,$4::vector)",
      [randomUUID(), id, company, JSON.stringify(sample(0.04))],
    );
  await assert.rejects(
    () =>
      pool.query(
        "INSERT INTO face_templates(id,employee_id,employer_id,embedding) VALUES($1,$2,$3,$4::vector)",
        [randomUUID(), id, company, JSON.stringify(sample(0.04))],
      ),
    /limit/,
  );
  const duplicate = await api
    .submitFaceAttendance(
      request({
        method: "manual",
        eventType: "clock_in",
        reason: "Camera temporarily unavailable",
      }),
    )
    .catch((e) => e);
  assert.equal(duplicate.status, 409);
  const checkout = await api.submitFaceAttendance(
    request({
      method: "manual",
      eventType: "clock_out",
      reason: "Camera temporarily unavailable",
    }),
  );
  assert.equal(checkout.status, 201);
  await resetLimit();
  for (let i = 0; i < 3; i++) {
    challenge = await issue("clock_out");
    const wrong = await api.submitFaceAttendance(
      request({
        eventType: "clock_out",
        embedding: sample(1),
        challengeId: challenge.id,
        motion: motion(challenge.action),
      }),
    );
    assert.equal(wrong.status, 422);
  }
  await assert.rejects(
    () => api.issueFaceChallenge(request({ purpose: "clock_in" })),
    (e) => e.status === 429,
  );
  await resetLimit();
  for (let i = 0; i < 3; i++) await issue("clock_out");
  await assert.rejects(
    () => api.issueFaceChallenge(request({ purpose: "clock_out" })),
    (e) => e.status === 429,
  );
  employee = { id: other, employer_id: foreign };
  const isolated = await (await api.faceStatus()).json();
  assert.equal(isolated.enrolled, false);
  assert.equal(isolated.requests.length, 0);
  employee = { id, employer_id: company };
  await api.deleteOwnFace(
    new Request("http://localhost/api/face", {
      method: "DELETE",
      headers: { origin: "http://localhost" },
      body: "{}",
    }),
  );
  assert.equal(
    (
      await pool.query(
        "SELECT count(*)::int n FROM face_templates WHERE employee_id=$1",
        [id],
      )
    ).rows[0].n,
    0,
  );
  assert.ok(
    (
      await pool.query(
        "SELECT count(*)::int n FROM face_attendance_audit WHERE employee_id=$1",
        [id],
      )
    ).rows[0].n >= 4,
  );
  console.log(
    "PASS actual pgvector enrollment/matching, explicit review, replay denial, server timestamps, duplicates, roles/tenants, 3-attempt limit and deletion.",
  );
} finally {
  await pool
    .query("DELETE FROM employer_accounts WHERE id=ANY($1::uuid[])", [
      [company, foreign],
    ])
    .catch(() => {});
  await pool.end();
}
