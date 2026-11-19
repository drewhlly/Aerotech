import { currentApplicant } from "./applicant-session";
import { currentEmployee } from "./employee-auth";
import { currentEmployer } from "./employer-session";
import { AccessError, id, text, type Actor } from "./collaboration";
import type { PoolClient } from "pg";
import { validMeetingInvitation } from "./meeting-invitations";
import { meetingConfig, reservationMonths } from "./meeting-policy";
import { joinWindow } from "./collaboration-policy";
import { meetingProvider, dailyOrigin } from "./meeting-provider";
export type MeetingActor = {
  kind: "employer" | "employee" | "applicant";
  userId: string;
  tenant: string | null;
  name: string;
};
export async function meetingActor(): Promise<MeetingActor> {
  const e = await currentEmployee();
  if (e)
    return {
      kind: "employee",
      userId: e.id,
      tenant: e.employer_id,
      name: e.first_name + " " + e.last_name,
    };
  const p = await currentApplicant();
  if (p)
    return { kind: "applicant", userId: p, tenant: null, name: "Applicant" };
  const o = await currentEmployer();
  if (o)
    return { kind: "employer", userId: o, tenant: o, name: "Employer host" };
  throw new AccessError("Sign in to your invited Aerotech portal.", 401);
}
export async function meetingBody(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new AccessError("Refresh the page and try again.", 403);
  if (Number(request.headers.get("content-length") || 0) > 40000)
    throw new AccessError("Request too large", 413);
  const reader = request.body?.getReader();
  let raw = "";
  const decoder = new TextDecoder();
  let bytes = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 40000) {
        await reader.cancel();
        throw new AccessError("Request too large", 413);
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  }
  let b: unknown;
  try {
    b = JSON.parse(raw || "{}");
  } catch {
    throw new AccessError("Invalid JSON request.", 400);
  }
  if (!b || typeof b !== "object" || Array.isArray(b))
    throw new AccessError("Invalid request", 400);
  return b as Record<string, unknown>;
}
export async function accessibleMeeting(
  c: PoolClient,
  a: MeetingActor,
  room: string,
  proof = "",
) {
  id(room);
  const r = await c.query("SELECT * FROM meet_rooms WHERE id=$1 FOR UPDATE", [
    room,
  ]);
  const m = r.rows[0];
  if (!m || (a.kind !== "applicant" && m.employer_id !== a.tenant))
    throw new AccessError("Meeting not found or invitation unavailable.", 404);
  // Legacy interview writers are still supported. Only the exact application's owner qualifies.
  if (a.kind === "applicant") {
    await c.query(
      "INSERT INTO meeting_participants(meeting_id,employer_id,user_id,principal_type) SELECT $1,$2,$3,'applicant' WHERE EXISTS(SELECT 1 FROM ats_applications x JOIN ats_jobs j ON j.id=x.job_id WHERE x.applicant_id=$3 AND x.interview_room_id=$1 AND j.employer_id=$2 AND x.stage='interview') ON CONFLICT DO NOTHING",
      [room, m.employer_id, a.userId],
    );
    const candidate = await c.query(
      "SELECT email,first_name,last_name FROM applicant_accounts WHERE id=$1",
      [a.userId],
    );
    const p = candidate.rows[0];
    if (p) {
      a.name = p.first_name + " " + p.last_name;
      const invitation = (
        await c.query(
          "SELECT id FROM meeting_participants WHERE meeting_id=$1 AND principal_type='email' AND lower(invited_email)=lower($2)",
          [room, p.email],
        )
      ).rows[0];
      if (
        invitation &&
        (await validMeetingInvitation(invitation.id, m.join_generation, proof))
      )
        await c.query(
          "UPDATE meeting_participants SET user_id=$1,principal_type='applicant' WHERE id=$2 AND NOT EXISTS(SELECT 1 FROM meeting_participants WHERE meeting_id=$3 AND principal_type='applicant' AND user_id=$1)",
          [a.userId, invitation.id, room],
        );
    }
  }
  const p = (
    await c.query(
      "SELECT * FROM meeting_participants WHERE meeting_id=$1 AND principal_type=$2 AND user_id=$3",
      [room, a.kind, a.userId],
    )
  ).rows[0];
  if (!p || (a.kind === "employee" && p.role === "host"))
    throw new AccessError("You are not invited to this meeting.", 403);
  return {
    meeting: m,
    participant: p,
    host: a.kind === "employer" && m.host_id === a.userId && p.role === "host",
  };
}
export function requireMeetingHost(host: boolean) {
  if (!host) throw new AccessError("Only the meeting host can do this.", 403);
}
export function requireOpen(m: Parameters<typeof joinWindow>[0]) {
  const w = joinWindow(m);
  if (w.state !== "open")
    throw new AccessError(
      w.state === "expired"
        ? "This meeting has ended, was cancelled, or its link expired."
        : "This meeting opens 15 minutes before the start.",
      w.state === "expired" ? 410 : 425,
    );
  return w;
}
type MeetingData = {
  id: string;
  starts_at: string | Date;
  duration_minutes: number;
  status: string;
  revoked_at: unknown;
  join_generation: number;
  provider_room_name: string | null;
  provider_generation: number | null;
  type: "video" | "audio";
};
export async function provisionMeeting(c: PoolClient, m: MeetingData) {
  // metadata from a locked database row
  const cfg = meetingConfig(),
    w = requireOpen(m as Parameters<typeof joinWindow>[0]);
  if (m.provider_room_name && m.provider_generation === m.join_generation)
    return {
      name: String(m.provider_room_name),
      url: dailyOrigin() + "/" + m.provider_room_name,
    };
  const count = Number(
    (
      await c.query(
        "SELECT count(*)::int AS n FROM meeting_participants WHERE meeting_id=$1",
        [m.id],
      )
    ).rows[0].n,
  );
  if (count > cfg.maxParticipants)
    throw new AccessError(
      "This meeting exceeds the configured participant limit. Ask the host to reduce invitations.",
      422,
    );
  const start = new Date(new Date(m.starts_at).getTime() - 15 * 60000),
    end = new Date(w.expiresAt),
    members = Math.max(2, count);
  // Serialize across all tenants sharing this Daily account; reservations are never refunded.
  await c.query(
    "SELECT pg_advisory_xact_lock(hashtext('aerotech-meeting-budget'))",
  );
  for (const r of reservationMonths(start, end, members)) {
    const used = Number(
      (
        await c.query(
          "SELECT COALESCE(sum(participant_minutes),0)::int AS n FROM meeting_usage_reservations WHERE month=$1",
          [r.month],
        )
      ).rows[0].n,
    );
    if (used + r.minutes > cfg.budget)
      throw new AccessError(
        "The configured meeting allowance is reserved for this month. Contact support or choose another month.",
        429,
      );
    await c.query(
      "INSERT INTO meeting_usage_reservations(meeting_id,generation,month,participant_minutes) VALUES($1,$2,$3,$4)",
      [m.id, m.join_generation, r.month, r.minutes],
    );
  }
  const name =
    "aero-" +
    crypto.randomUUID().replaceAll("-", "") +
    "-g" +
    m.join_generation;
  const room = await meetingProvider().createRoom({
    name,
    startsAt: start.getTime(),
    endsAt: end.getTime(),
    maxParticipants: members,
    type: m.type,
  });
  await c.query(
    "UPDATE meet_rooms SET provider_room_name=$1,provider_generation=$2 WHERE id=$3",
    [name, m.join_generation, m.id],
  );
  await c.query(
    "INSERT INTO meeting_provider_rooms(meeting_id,generation,room_name) VALUES($1,$2,$3)",
    [m.id, m.join_generation, name],
  );
  return room;
}
export function collaborationActor(a: MeetingActor, tenant: string): Actor {
  return {
    tenant,
    id: a.kind + ":" + a.userId,
    employee: a.kind === "employee" ? a.userId : null,
    department: null,
    role: a.kind === "employee" ? "employee" : "employer",
  };
}
export function confirmedName(v: unknown, fallback: string) {
  return v === undefined ? fallback : text(v, 80, true);
}
