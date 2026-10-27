import type { PoolClient } from "pg";
import {
  AccessError,
  id,
  ids,
  text,
  notify,
  audit,
  type Actor,
} from "./collaboration";
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
  const date = new Date(String(b.startsAt)),
    duration = Number(b.durationMinutes || 60),
    timezone = text(b.timezone || "Africa/Lagos", 80);
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format(date);
  } catch {
    throw new AccessError("Invalid start time or timezone", 400);
  }
  if (
    !Number.isFinite(date.getTime()) ||
    date.getTime() < Date.now() - 60000 ||
    !Number.isInteger(duration) ||
    duration < 15 ||
    duration > 240
  )
    throw new AccessError("Invalid meeting schedule", 400);
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
  if (selected.size > 10000)
    throw new AccessError("Invite limit exceeded", 422);
  const emails = Array.isArray(b.guestEmails) ? b.guestEmails : [];
  if (
    emails.length > 100 ||
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
  await notify(
    c,
    a,
    [...selected.keys()].map((x) => "employee:" + x),
    "meeting",
    "Meeting invitation",
    text(b.title, 150, true) + " · " + date.toISOString() + " · " + timezone,
    "/meet/" + room,
    room,
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
