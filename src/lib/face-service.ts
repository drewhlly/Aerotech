import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { db, currentEmployer } from "./employer-session";
import { currentEmployee } from "./employee-auth";
import { distanceMeters } from "./attendance-geofence";
import {
  FACE_CONSENT_VERSION,
  FaceError,
  attendanceOrder,
  classifyDistance,
  faceSettings,
  validEmbedding,
  validateMotion,
  type FacePurpose,
  type FaceAction,
} from "./face-policy";
const uuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v);
export const faceJson = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export function faceFailure(e: unknown) {
  return faceJson(
    {
      error:
        e instanceof FaceError
          ? e.message
          : "Face attendance unavailable. Use location attendance or contact HR.",
    },
    e instanceof FaceError ? e.status : 503,
  );
}
export async function faceBody(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    throw new FaceError("Invalid request origin", 403);
  if (Number(request.headers.get("content-length")) > 40000)
    throw new FaceError("Request too large", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new FaceError("Request body required");
  let raw = "",
    size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 40000) {
      await reader.cancel();
      throw new FaceError("Request too large", 413);
    }
    raw += decoder.decode(value, { stream: true });
  }
  raw += decoder.decode();
  try {
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw Error();
    if ("image" in body || "video" in body || "photo" in body)
      throw new FaceError(
        "Only descriptors are accepted. Never upload images or video.",
      );
    return body as Record<string, unknown>;
  } catch (e) {
    if (e instanceof FaceError) throw e;
    throw new FaceError("Invalid request body");
  }
}
export async function employeeFace(requireService = true) {
  const e = await currentEmployee(requireService);
  if (!e) throw new FaceError("Employee sign-in required", 401);
  return e;
}
async function sessionHash() {
  const token = (await cookies()).get("aerotech_employee_session")?.value;
  if (!token) throw new FaceError("Employee sign-in required", 401);
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)),
    ),
  )
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export async function faceTransaction<T>(fn: (c: PoolClient) => Promise<T>) {
  const p = db();
  let c: PoolClient | undefined;
  try {
    c = await p.connect();
    await c.query("BEGIN");
    const result = await fn(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c?.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    c?.release();
    await p.end();
  }
}
async function lockEmployee(
  c: PoolClient,
  e: { id: string; employer_id: string },
) {
  const r = await c.query(
    "SELECT id,attendance_site_id FROM workforce_employees WHERE id=$1 AND employer_id=$2 FOR UPDATE",
    [e.id, e.employer_id],
  );
  if (!r.rowCount) throw new FaceError("Employee unavailable", 403);
  return r.rows[0];
}
async function audit(
  c: PoolClient,
  employer: string,
  employee: string,
  actor: string,
  action: string,
  reason: string,
  requestId?: string,
) {
  await c.query(
    "INSERT INTO face_attendance_audit(id,employer_id,employee_id,actor,action,reason,request_id) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [
      crypto.randomUUID(),
      employer,
      employee,
      actor,
      action,
      reason,
      requestId || null,
    ],
  );
}
function enabled() {
  if (!faceSettings().enabled)
    throw new FaceError(
      "Face attendance is not enabled. Use location attendance or a manual request.",
      503,
    );
}
async function attempts(c: PoolClient, employee: string) {
  await c.query(
    "INSERT INTO face_attempt_limits(employee_id) VALUES($1) ON CONFLICT DO NOTHING",
    [employee],
  );
  await c.query(
    "UPDATE face_attempt_limits SET issued=0,failures=0,window_start=NOW(),locked_until=NULL WHERE employee_id=$1 AND window_start<NOW()-INTERVAL '5 minutes' AND (locked_until IS NULL OR locked_until<=NOW())",
    [employee],
  );
  const r = await c.query(
    "SELECT *,NOW() AS server_now FROM face_attempt_limits WHERE employee_id=$1 FOR UPDATE",
    [employee],
  );
  const v = r.rows[0];
  if (v.locked_until && new Date(v.locked_until) > new Date(v.server_now))
    throw new FaceError(
      "Too many attempts. Try again in five minutes or contact HR.",
      429,
    );
  return v;
}
async function failAttempt(c: PoolClient, employee: string) {
  await c.query(
    "UPDATE face_attempt_limits SET failures=failures+1,locked_until=CASE WHEN failures+1>=3 THEN NOW()+INTERVAL '5 minutes' ELSE locked_until END WHERE employee_id=$1",
    [employee],
  );
}
export async function issueFaceChallenge(request: Request) {
  const e = await employeeFace();
  enabled();
  const b = await faceBody(request);
  if (!["enroll", "clock_in", "clock_out"].includes(String(b.purpose)))
    throw new FaceError("Invalid challenge purpose");
  const hash = await sessionHash();
  return faceTransaction(async (c) => {
    await lockEmployee(c, e);
    const limit = await attempts(c, e.id);
    if (limit.issued >= 3)
      throw new FaceError(
        "Three attempts used. Try again in five minutes or contact HR.",
        429,
      );
    await c.query(
      "UPDATE face_attempt_limits SET issued=issued+1 WHERE employee_id=$1",
      [e.id],
    );
    const action = (["blink", "left", "right", "smile"] as FaceAction[])[
      crypto.getRandomValues(new Uint32Array(1))[0] % 4
    ];
    const r = await c.query(
      "INSERT INTO face_challenges(id,employee_id,employer_id,session_hash,purpose,action,expires_at) VALUES($1,$2,$3,$4,$5,$6,NOW()+INTERVAL '45 seconds') RETURNING id,action,expires_at",
      [crypto.randomUUID(), e.id, e.employer_id, hash, b.purpose, action],
    );
    return faceJson({ ...r.rows[0], reviewRequired: true });
  });
}
async function consumeChallenge(
  c: PoolClient,
  e: { id: string; employer_id: string },
  b: Record<string, unknown>,
  purpose: FacePurpose,
  hash: string,
) {
  if (!uuid(b.challengeId)) throw new FaceError("Start a new camera challenge");
  const r = await c.query(
    "SELECT *,clock_timestamp() AS server_now FROM face_challenges WHERE id=$1 AND employee_id=$2 AND employer_id=$3 AND session_hash=$4 AND purpose=$5 FOR UPDATE",
    [b.challengeId, e.id, e.employer_id, hash, purpose],
  );
  const challenge = r.rows[0];
  if (!challenge || challenge.consumed_at)
    throw new FaceError("Challenge is invalid or already used", 409);
  await c.query(
    "UPDATE face_challenges SET consumed_at=clock_timestamp() WHERE id=$1",
    [b.challengeId],
  );
  const elapsed =
    new Date(challenge.server_now).getTime() -
    new Date(challenge.created_at).getTime();
  if (
    new Date(challenge.server_now) > new Date(challenge.expires_at) ||
    !validateMotion(challenge.action, b.motion, elapsed)
  ) {
    await failAttempt(c, e.id);
    return false;
  }
  return true;
}
export async function faceStatus() {
  const e = await employeeFace();
  const settings = faceSettings();
  if (!settings.enabled)
    return faceJson({
      enabled: false,
      enrolled: false,
      reviewRequired: true,
      geofence: settings.geofence,
    });
  return faceTransaction(async (c) => {
    const r = await c.query(
      "SELECT state,consent_at,consent_version,(SELECT count(*)::int FROM face_templates WHERE employee_id=$1) AS samples FROM face_enrollments WHERE employee_id=$1 AND employer_id=$2",
      [e.id, e.employer_id],
    );
    const requests = await c.query(
      "SELECT id,event_type,event_time,work_date,method,status,reason,review_note FROM face_attendance_requests WHERE employee_id=$1 AND employer_id=$2 ORDER BY event_time DESC LIMIT 30",
      [e.id, e.employer_id],
    );
    return faceJson({
      enabled: true,
      enrolled: r.rows[0]?.state === "active",
      enrollment: r.rows[0] || null,
      requests: requests.rows,
      reviewRequired: true,
      geofence: settings.geofence,
    });
  });
}
export async function enrollFace(request: Request) {
  const e = await employeeFace();
  enabled();
  const b = await faceBody(request),
    hash = await sessionHash();
  if (b.consent !== true || b.consentVersion !== FACE_CONSENT_VERSION)
    throw new FaceError("Accept the current face attendance consent notice");
  if (
    !Array.isArray(b.embeddings) ||
    b.embeddings.length < 3 ||
    b.embeddings.length > 5 ||
    !b.embeddings.every(validEmbedding)
  )
    throw new FaceError("Provide three to five valid face samples");
  const samples = b.embeddings as number[][];
  for (let i = 0; i < samples.length; i++)
    for (let j = i + 1; j < samples.length; j++) {
      const d = Math.sqrt(
        samples[i].reduce((s, v, k) => s + (v - samples[j][k]) ** 2, 0),
      );
      if (d < 0.01 || d > 0.55)
        throw new FaceError(
          "Samples must be distinct views of the same person. Try again.",
        );
    }
  return faceTransaction(async (c) => {
    await lockEmployee(c, e);
    await attempts(c, e.id);
    if (!(await consumeChallenge(c, e, b, "enroll", hash)))
      return faceJson(
        { error: "Challenge expired or incomplete. Start again." },
        400,
      );
    const previous = await c.query(
      "SELECT 1 FROM face_enrollments WHERE employee_id=$1",
      [e.id],
    );
    if (previous.rowCount)
      throw new FaceError(
        "Enrollment already exists. Delete it before enrolling again.",
        409,
      );
    await c.query(
      "INSERT INTO face_enrollments(employee_id,employer_id,consent_version) VALUES($1,$2,$3)",
      [e.id, e.employer_id, FACE_CONSENT_VERSION],
    );
    for (const sample of samples)
      await c.query(
        "INSERT INTO face_templates(id,employee_id,employer_id,embedding) VALUES($1,$2,$3,$4::vector)",
        [crypto.randomUUID(), e.id, e.employer_id, JSON.stringify(sample)],
      );
    await audit(
      c,
      e.employer_id,
      e.id,
      "employee:" + e.id,
      "enrolled",
      "Explicit consent " +
        FACE_CONSENT_VERSION +
        "; pending supervised identity approval",
    );
    return faceJson(
      {
        ok: true,
        status: "needs_review",
        message:
          "Face samples saved. HR must confirm your identity before face attendance is available.",
      },
      201,
    );
  });
}
export async function deleteOwnFace(request: Request) {
  const e = await employeeFace(false);
  await faceBody(request);
  return faceTransaction(async (c) => {
    await lockEmployee(c, e);
    await c.query(
      "DELETE FROM face_enrollments WHERE employee_id=$1 AND employer_id=$2",
      [e.id, e.employer_id],
    );
    await c.query(
      "DELETE FROM face_challenges WHERE employee_id=$1 AND employer_id=$2",
      [e.id, e.employer_id],
    );
    await c.query(
      "DELETE FROM employee_face_references WHERE employee_id=$1 AND employer_id=$2",
      [e.id, e.employer_id],
    );
    await audit(
      c,
      e.employer_id,
      e.id,
      "employee:" + e.id,
      "face_deleted",
      "Employee withdrew face enrollment; descriptors and any legacy reference removed",
    );
    return faceJson({ ok: true });
  });
}
function metadata(b: Record<string, unknown>) {
  if (b.latitude != null || b.longitude != null) {
    if (
      typeof b.latitude !== "number" ||
      typeof b.longitude !== "number" ||
      !Number.isFinite(b.latitude) ||
      !Number.isFinite(b.longitude) ||
      Math.abs(b.latitude) > 90 ||
      Math.abs(b.longitude) > 180
    )
      throw new FaceError("Invalid location");
  }
  return { latitude: b.latitude ?? null, longitude: b.longitude ?? null };
}
export async function submitFaceAttendance(request: Request) {
  const e = await employeeFace();
  enabled();
  const b = await faceBody(request);
  if (b.eventType !== "clock_in" && b.eventType !== "clock_out")
    throw new FaceError("Invalid attendance action");
  const manual = b.method === "manual";
  if (!manual && !validEmbedding(b.embedding))
    throw new FaceError("A valid 128-number face descriptor is required");
  if (
    manual &&
    (typeof b.reason !== "string" ||
      b.reason.trim().length < 10 ||
      b.reason.length > 1000)
  )
    throw new FaceError("Explain the manual request in 10–1,000 characters");
  const hash = await sessionHash(),
    geo = metadata(b),
    settings = faceSettings();
  return faceTransaction(async (c) => {
    const staff = await lockEmployee(c, e);
    if (manual) {
      const count = await c.query(
        "SELECT count(*)::int AS n FROM face_attendance_requests WHERE employee_id=$1 AND employer_id=$2 AND method='manual' AND event_time>NOW()-INTERVAL '5 minutes'",
        [e.id, e.employer_id],
      );
      if (count.rows[0].n >= 3)
        throw new FaceError(
          "Too many manual requests. Try again in five minutes.",
          429,
        );
    } else await attempts(c, e.id);
    let distance: number | null = null;
    let reason = manual
      ? String(b.reason).trim()
      : "Browser-only liveness requires manager review";
    if (!manual) {
      if (!(await consumeChallenge(c, e, b, b.eventType as FacePurpose, hash)))
        return faceJson(
          { error: "Challenge expired or incomplete. Start again." },
          400,
        );
      const result = await c.query(
        "SELECT MIN(embedding <-> $3::vector)::float8 AS distance FROM face_templates f JOIN face_enrollments n ON n.employee_id=f.employee_id AND n.employer_id=f.employer_id WHERE f.employee_id=$1 AND f.employer_id=$2 AND f.is_active=TRUE AND n.state='active'",
        [e.id, e.employer_id, JSON.stringify(b.embedding)],
      );
      distance =
        result.rows[0]?.distance == null
          ? null
          : Number(result.rows[0].distance);
      await c.query(
        "UPDATE face_challenges SET match_distance=$1 WHERE id=$2",
        [distance, b.challengeId],
      );
      if (
        distance === null ||
        classifyDistance(
          distance,
          settings.threshold,
          settings.reviewThreshold,
        ) === "reject"
      ) {
        await failAttempt(c, e.id);
        return faceJson(
          {
            error:
              "Face did not match an approved enrollment. Try better lighting or request manual attendance.",
          },
          422,
        );
      }
      if (
        classifyDistance(
          distance,
          settings.threshold,
          settings.reviewThreshold,
        ) === "uncertain"
      )
        reason = "Uncertain face match; " + reason;
    }
    if (settings.geofence) {
      let site;
      if (staff.attendance_site_id) {
        const r = await c.query(
          "SELECT latitude,longitude,radius_m FROM attendance_sites WHERE id=$1 AND employer_id=$2 AND active=TRUE",
          [staff.attendance_site_id, e.employer_id],
        );
        site = r.rows[0];
      }
      site ??= {
        latitude: settings.latitude,
        longitude: settings.longitude,
        radius_m: settings.radius,
      };
      if (
        !Number.isFinite(Number(site.latitude)) ||
        !Number.isFinite(Number(site.longitude))
      )
        throw new FaceError(
          "Office geofence is not configured. Contact HR.",
          503,
        );
      if (geo.latitude === null || geo.longitude === null)
        reason += "; location not supplied";
      else if (
        distanceMeters(
          Number(geo.latitude),
          Number(geo.longitude),
          Number(site.latitude),
          Number(site.longitude),
        ) > site.radius_m
      )
        reason += "; outside office geofence";
    }
    const now = (await c.query("SELECT clock_timestamp() AS now")).rows[0].now;
    const events = await c.query(
      "SELECT event_type,event_time,work_date::text FROM hr_attendance_events WHERE employee_id=$1 AND employer_id=$2 UNION ALL SELECT event_type,event_time,work_date::text FROM face_attendance_requests WHERE employee_id=$1 AND employer_id=$2 AND status='needs_review'",
      [e.id, e.employer_id],
    );
    let day: string;
    try {
      day = attendanceOrder(
        b.eventType as "clock_in" | "clock_out",
        events.rows,
        new Date(now),
      );
    } catch (err) {
      if (err instanceof FaceError && err.message.startsWith("Missed")) {
        await audit(
          c,
          e.employer_id,
          e.id,
          "employee:" + e.id,
          "missed_checkout",
          err.message,
        );
        return faceJson({ error: err.message }, 409);
      }
      throw err;
    }
    const r = await c.query(
      "INSERT INTO face_attendance_requests(id,employer_id,employee_id,work_date,event_type,event_time,method,match_distance,liveness_passed,liveness_source,device_info,latitude,longitude,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id,event_time,status",
      [
        crypto.randomUUID(),
        e.employer_id,
        e.id,
        day,
        b.eventType,
        now,
        manual ? "manual" : "face",
        distance,
        !manual,
        manual ? "not_performed" : "browser_unattested",
        JSON.stringify({
          userAgent: (request.headers.get("user-agent") || "unknown").slice(
            0,
            240,
          ),
        }),
        geo.latitude,
        geo.longitude,
        reason,
      ],
    );
    await audit(
      c,
      e.employer_id,
      e.id,
      "employee:" + e.id,
      "attendance_requested",
      reason,
      r.rows[0].id,
    );
    return faceJson(
      {
        ...r.rows[0],
        ok: true,
        message:
          "Attendance request submitted for manager review. It is not accepted attendance until approved.",
      },
      201,
    );
  });
}

type Actor = { employer: string; id: string; manager: string | null };
async function actor(requireService = true): Promise<Actor> {
  const employer = await currentEmployer(requireService);
  if (employer) return { employer, id: "employer:" + employer, manager: null };
  const employee = await currentEmployee(requireService);
  if (employee) {
    const p = db();
    try {
      const reports = await p.query(
        "SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND manager_employee_id=$2 AND id<>$2 LIMIT 1",
        [employee.employer_id, employee.id],
      );
      if (!reports.rowCount)
        throw new FaceError(
          "Only assigned managers may review attendance",
          403,
        );
    } finally {
      await p.end();
    }
    return {
      employer: employee.employer_id,
      id: "employee:" + employee.id,
      manager: employee.id,
    };
  }
  throw new FaceError("Manager or employer sign-in required", 401);
}
async function permitted(c: PoolClient, a: Actor, id: unknown) {
  if (!uuid(id)) throw new FaceError("Invalid employee");
  const r = await c.query(
    "SELECT id FROM workforce_employees WHERE employer_id=$1 AND id=$2 AND ($3::uuid IS NULL OR (manager_employee_id=$3 AND id<>$3)) FOR UPDATE",
    [a.employer, id, a.manager],
  );
  if (!r.rowCount)
    throw new FaceError(
      "Employee not found or outside your direct reports",
      404,
    );
  return String(id);
}
export async function reviewFaceStatus() {
  const a = await actor();
  return faceTransaction(async (c) => {
    const employees = await c.query(
      "SELECT e.id,e.first_name,e.last_name,COALESCE(f.state,'not_enrolled') AS enrollment_status,f.consent_at,(SELECT count(*)::int FROM face_templates t WHERE t.employee_id=e.id AND t.employer_id=e.employer_id) AS samples FROM workforce_employees e LEFT JOIN face_enrollments f ON f.employee_id=e.id AND f.employer_id=e.employer_id WHERE e.employer_id=$1 AND ($2::uuid IS NULL OR(e.manager_employee_id=$2 AND e.id<>$2)) ORDER BY e.first_name LIMIT 500",
      [a.employer, a.manager],
    );
    const requests = await c.query(
      "SELECT r.id,r.employee_id,e.first_name,e.last_name,r.event_time,r.event_type,r.method,r.match_distance,r.liveness_passed,r.liveness_source,r.reason,r.status FROM face_attendance_requests r JOIN workforce_employees e ON e.id=r.employee_id AND e.employer_id=r.employer_id WHERE r.employer_id=$1 AND r.status='needs_review' AND ($2::uuid IS NULL OR(e.manager_employee_id=$2 AND e.id<>$2)) ORDER BY r.event_time LIMIT 200",
      [a.employer, a.manager],
    );
    const missed = await c.query(
      "SELECT ci.id,ci.employee_id,e.first_name,e.last_name,ci.event_time FROM hr_attendance_events ci JOIN workforce_employees e ON e.id=ci.employee_id AND e.employer_id=ci.employer_id WHERE ci.employer_id=$1 AND ci.event_type='clock_in' AND ci.event_time<NOW()-INTERVAL '24 hours' AND NOT EXISTS(SELECT 1 FROM hr_attendance_events co WHERE co.employee_id=ci.employee_id AND co.employer_id=ci.employer_id AND co.work_date=ci.work_date AND co.event_type='clock_out') AND ($2::uuid IS NULL OR(e.manager_employee_id=$2 AND e.id<>$2)) ORDER BY ci.event_time LIMIT 100",
      [a.employer, a.manager],
    );
    return faceJson({
      employees: employees.rows,
      requests: requests.rows,
      missed: missed.rows,
    });
  });
}
export async function reviewFace(request: Request) {
  const b = await faceBody(request),
    a = await actor(b.action !== "reset");
  if (b.action !== "reset") enabled();
  if (
    typeof b.note !== "string" ||
    b.note.trim().length < 10 ||
    b.note.length > 1000
  )
    throw new FaceError(
      "Provide a review or reset reason of 10–1,000 characters",
    );
  return faceTransaction(async (c) => {
    const id = await permitted(c, a, b.employeeId);
    if (b.action === "reset") {
      await c.query(
        "DELETE FROM face_enrollments WHERE employee_id=$1 AND employer_id=$2",
        [id, a.employer],
      );
      await c.query(
        "DELETE FROM face_challenges WHERE employee_id=$1 AND employer_id=$2",
        [id, a.employer],
      );
      await c.query(
        "DELETE FROM employee_face_references WHERE employee_id=$1 AND employer_id=$2",
        [id, a.employer],
      );
    } else if (b.action === "approve_enrollment") {
      const r = await c.query(
        "UPDATE face_enrollments SET state='active',approved_by=$3,approved_at=NOW() WHERE employee_id=$1 AND employer_id=$2 AND state='pending' AND (SELECT count(*) FROM face_templates WHERE employee_id=$1 AND employer_id=$2) BETWEEN 3 AND 5 RETURNING employee_id",
        [id, a.employer, a.id],
      );
      if (!r.rowCount) throw new FaceError("Pending enrollment not found", 409);
      await c.query(
        "UPDATE face_templates SET is_active=TRUE WHERE employee_id=$1 AND employer_id=$2",
        [id, a.employer],
      );
      const legacy = await c.query(
        "DELETE FROM employee_face_references WHERE employee_id=$1 AND employer_id=$2 RETURNING employee_id",
        [id, a.employer],
      );
      if (legacy.rowCount)
        await audit(
          c,
          a.employer,
          id,
          a.id,
          "legacy_photo_replaced",
          "Supervised descriptor enrollment replaced the legacy reference photo",
        );
    } else if (b.action === "request_enrollment") {
      await c.query(
        "INSERT INTO employee_notifications(id,employer_id,employee_id,title,body) VALUES($1,$2,$3,'Face enrollment requested','Your manager invites you to /employee/face-enroll. Enrollment is optional; read the consent notice or use manual attendance.')",
        [crypto.randomUUID(), a.employer, id],
      );
    } else if (b.action === "approve" || b.action === "reject") {
      if (!uuid(b.requestId)) throw new FaceError("Invalid request");
      const r = await c.query(
        "SELECT * FROM face_attendance_requests WHERE id=$1 AND employee_id=$2 AND employer_id=$3 AND status='needs_review' FOR UPDATE",
        [b.requestId, id, a.employer],
      );
      const q = r.rows[0];
      if (!q) throw new FaceError("Request already reviewed or not found", 409);
      let eventId: string | null = null;
      if (b.action === "approve") {
        const events = await c.query(
          "SELECT event_type,event_time,work_date::text FROM hr_attendance_events WHERE employee_id=$1 AND employer_id=$2",
          [id, a.employer],
        );
        const day = attendanceOrder(
          q.event_type,
          events.rows,
          new Date(q.event_time),
        );
        if (day !== String(q.work_date).slice(0, 10))
          throw new FaceError(
            "Workday conflict. Correct the existing shift first.",
            409,
          );
        eventId = crypto.randomUUID();
        await c.query(
          "INSERT INTO hr_attendance_events(id,employer_id,employee_id,work_date,event_type,event_time,source,method,match_distance,liveness_passed,device_info,latitude,longitude,status) VALUES($1,$2,$3,$4,$5,$6,'manager_approved_face_request',$7,$8,$9,$10,$11,$12,'verified')",
          [
            eventId,
            a.employer,
            id,
            q.work_date,
            q.event_type,
            q.event_time,
            q.method,
            q.match_distance,
            q.liveness_passed,
            q.device_info,
            q.latitude,
            q.longitude,
          ],
        );
      }
      await c.query(
        "UPDATE face_attendance_requests SET status=$1,reviewed_by=$2,reviewed_at=NOW(),review_note=$3,attendance_event_id=$4 WHERE id=$5",
        [
          b.action === "approve" ? "approved" : "rejected",
          a.id,
          b.note,
          eventId,
          b.requestId,
        ],
      );
    } else throw new FaceError("Invalid review action");
    await audit(
      c,
      a.employer,
      id,
      a.id,
      String(b.action),
      String(b.note),
      uuid(b.requestId) ? b.requestId : undefined,
    );
    return faceJson({ ok: true });
  });
}
