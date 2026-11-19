import { hybridInput } from "./meeting-hybrid-policy";
import { requireBuiltIn } from "./meeting-entitlements";
import { limitMeetingCreation } from "./meeting-rate";
import type { PoolClient } from "pg";
import {
  AccessError,
  id,
  ids,
  text,
  audit,
  enqueue,
  type Actor,
} from "./collaboration";
import { retireInterview } from "./recruitment-interviews";
import { scheduleInput, meetingConfig } from "./meeting-policy";
import { meetingProvider, meetingProviderReady } from "./meeting-provider";
import { db } from "./employer-session";
import { randomUUID } from "node:crypto";
export async function meetingAccess(
  c: PoolClient,
  a: Actor,
  room: string,
  write = false,
) {
  id(room);
  const r = await c.query(
    `SELECT m.* FROM meet_rooms m WHERE m.employer_id=$1 AND m.id=$2 AND ($3::uuid IS NULL OR EXISTS(SELECT 1 FROM meet_participants p WHERE p.room_id=m.id AND p.employee_id=$3)) FOR UPDATE`,
    [a.tenant, room, a.employee],
  );
  if (!r.rows[0]) throw new AccessError("Meeting not found", 404);
  if (write && a.employee)
    throw new AccessError("Meeting organiser access required");
  return r.rows[0];
}
export type GroupRef = {
  kind: string;
  value: string;
  required?: boolean;
  exclusions?: string[];
};
export async function resolveGroups(
  c: PoolClient,
  a: Actor,
  groups: GroupRef[],
  exclude: string[],
) {
  if (groups.length > 30) throw new AccessError("Choose up to 30 groups", 400);
  const selected = new Map<string, boolean>();
  for (const g of groups) {
    let r;
    const value = text(g.value, 200, true);
    if (g.kind === "department" || g.kind === "location" || g.kind === "role")
      r = await c.query(
        `SELECT id FROM workforce_employees WHERE employer_id=$1 AND ${g.kind === "role" ? "job_title" : g.kind}=$2 AND employment_status IN ('active','probation','on_leave')`,
        [a.tenant, value],
      );
    else if (g.kind === "project")
      r = await c.query(
        "SELECT employee_id id FROM project_members WHERE employer_id=$1 AND project_id=$2",
        [a.tenant, id(value)],
      );
    else if (g.kind === "saved" || g.kind === "team")
      r = await c.query(
        "SELECT e.id FROM workforce_employees e JOIN meeting_invite_groups g ON e.id=ANY(g.members) AND e.employer_id=g.employer_id WHERE g.employer_id=$1 AND g.id=$2 AND e.employment_status IN ('active','probation','on_leave')",
        [a.tenant, id(value)],
      );
    else throw new AccessError("Invalid group type", 400);
    const omitted = new Set([
      ...exclude,
      ...(g.exclusions ? ids(g.exclusions) : []),
    ]);
    for (const row of r.rows)
      if (!omitted.has(row.id))
        selected.set(row.id, selected.get(row.id) || g.required !== false);
  }
  return selected;
}
export async function scheduleMeeting(
  c: PoolClient,
  a: Actor,
  b: Record<string, unknown>,
) {
  if (a.employee) throw new AccessError("Employer access required");
  let settings, hybrid;
  try {
    settings = scheduleInput(b);
    hybrid = hybridInput(b);
  } catch (e) {
    throw new AccessError(
      e instanceof Error ? e.message : "Invalid schedule",
      400,
    );
  }
  const { date, duration, timezone, type } = settings;
  await limitMeetingCreation(c, a.tenant);
  const entitlement =
    hybrid.mode === "built_in"
      ? await requireBuiltIn(
          c,
          a.tenant,
          date.toISOString().slice(0, 7) + "-01",
        )
      : null;
  if (entitlement && entitlement.remaining <= 0)
    throw new AccessError(
      "Your monthly allowance is used or reserved. Use external link mode or upgrade.",
      429,
    );
  const participantLimit = entitlement
    ? Math.min(entitlement.maxParticipants, meetingConfig().maxParticipants)
    : 100;
  const groups = Array.isArray(b.groups) ? (b.groups as GroupRef[]) : [],
    exclude = b.excludeIds ? ids(b.excludeIds) : [],
    selected = await resolveGroups(c, a, groups, exclude),
    direct = b.employeeIds ? ids(b.employeeIds) : [],
    optional = new Set(b.optionalIds ? ids(b.optionalIds) : []);
  const allowed = (
    await c.query(
      "SELECT id FROM workforce_employees WHERE employer_id=$1 AND id=ANY($2::uuid[]) AND employment_status IN ('active','probation','on_leave')",
      [a.tenant, direct],
    )
  ).rows;
  if (allowed.length !== direct.length)
    throw new AccessError("Invite only your company employees", 422);
  for (const m of direct)
    if (!exclude.includes(m)) selected.set(m, !optional.has(m));
  if (selected.size + 1 + (b.applicationId ? 1 : 0) > participantLimit)
    throw new AccessError("Invite limit exceeded", 422);
  const emails = Array.isArray(b.guestEmails) ? b.guestEmails : [];
  if (
    emails.length + selected.size + 1 + (b.applicationId ? 1 : 0) > participantLimit ||
    emails.some(
      (e) =>
        typeof e !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ||
        e.length > 254,
    )
  )
    throw new AccessError("Invalid external emails", 400);
  const matched = (
    await c.query(
      "SELECT id,lower(email) email FROM workforce_employees WHERE employer_id=$1 AND lower(email)=ANY($2::text[]) AND employment_status IN ('active','probation','on_leave')",
      [a.tenant, emails.map((e: string) => e.toLowerCase())],
    )
  ).rows;
  for (const p of matched)
    if (!exclude.includes(p.id)) selected.set(p.id, true);
  const recurrence = text(b.recurrence || "none", 20);
  if (!["none", "daily", "weekly"].includes(recurrence))
    throw new AccessError("Invalid recurrence", 400);
  const room = randomUUID();
  await c.query(
    "INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes,agenda,timezone,recurrence,location) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [
      room,
      a.tenant,
      text(b.title, 150, true),
      date,
      duration,
      text(b.agenda, 10000),
      timezone,
      recurrence,
      text(b.location, 300),
    ],
  );
  await c.query(
    "UPDATE meet_rooms SET type=$1,mode=$3,external_url=$4 WHERE id=$2",
    [type, room, hybrid.mode, hybrid.externalUrl],
  );
  if (b.applicationId) {
    const candidate = (
      await c.query(
        "SELECT a.id,a.stage,a.interview_room_id FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.id=$1 AND j.employer_id=$2 AND a.stage IN ('shortlisted','interview') FOR UPDATE OF a",
        [id(b.applicationId), a.tenant],
      )
    ).rows[0];
    if (!candidate)
      throw new AccessError(
        "Choose a shortlisted application from your organisation.",
        404,
      );
    if (candidate.interview_room_id)
      await retireInterview(
        c,
        a.tenant,
        candidate.interview_room_id,
        "cancelled",
      );
    const revision = await c.query(
      "UPDATE ats_applications SET interview_room_id=$1,interview_at=$2,stage='interview',interview_completed_at=NULL,interview_revision=interview_revision+1 WHERE id=$3 RETURNING interview_revision",
      [room, date, candidate.id],
    );
    await enqueue(
      c,
      a.tenant,
      "interview_update",
      "interview:" + candidate.id + ":" + revision.rows[0].interview_revision,
      {
        application: candidate.id,
        revision: revision.rows[0].interview_revision,
      },
    );
  }

  if (selected.size)
    await c.query(
      "INSERT INTO meet_participants(employer_id,room_id,employee_id,required) SELECT $1,$2,x.id,x.required FROM unnest($3::uuid[],$4::boolean[]) AS x(id,required)",
      [a.tenant, room, [...selected.keys()], [...selected.values()]],
    );
  for (const g of groups)
    await c.query(
      "INSERT INTO meeting_group_refs(employer_id,room_id,kind,value,required,exclusions) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING",
      [
        a.tenant,
        room,
        g.kind,
        g.value,
        g.required !== false,
        g.exclusions || [],
      ],
    );
  for (const email of new Set(
    (emails as string[]).filter(
      (email) => !matched.some((p) => p.email === email.toLowerCase()),
    ),
  ))
    await c.query(
      "INSERT INTO meeting_guests(employer_id,room_id,email) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
      [a.tenant, room, email.toLowerCase()],
    );
  await audit(c, a, "meeting.created", room, {
    count: selected.size,
    groups: groups.length,
    external: emails.length,
  });
  return {
    id: room,
    participants: selected.size,
    externalGuests: emails.length,
  };
}

export async function terminateConference(
  tenant: string,
  room: string,
  generation: number,
) {
  const p = db();
  try {
    const m = (
      await p.query(
        "SELECT r.room_name AS provider_room_name FROM meeting_provider_rooms r JOIN meet_rooms m ON m.id=r.meeting_id WHERE m.employer_id=$1 AND m.id=$2 AND r.generation=$3",
        [tenant, room, generation],
      )
    ).rows[0];
    if (!m?.provider_room_name) return;
    if (!meetingProviderReady())
      throw Error("Meeting provider is not configured");
    const users = (
      await p.query(
        "SELECT user_id FROM meeting_participants WHERE meeting_id=$1 AND user_id IS NOT NULL",
        [room],
      )
    ).rows.map((r) => r.user_id);
    await meetingProvider().endRoom(m.provider_room_name, users);
  } finally {
    await p.end();
  }
}
