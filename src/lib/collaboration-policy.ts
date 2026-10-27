export type ProjectRole = "Owner" | "Manager" | "Contributor" | "Viewer";
export const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export function mayWrite(role: ProjectRole | null, structural = false) {
  return structural
    ? role === "Owner" || role === "Manager"
    : !!role && role !== "Viewer";
}
export function joinWindow(
  meeting: {
    starts_at: string | Date;
    duration_minutes: number;
    status?: string;
    revoked_at?: unknown;
  },
  now = Date.now(),
) {
  const start = new Date(meeting.starts_at).getTime(),
    end = start + meeting.duration_minutes * 60000;
  if (
    meeting.revoked_at ||
    meeting.status === "cancelled" ||
    meeting.status === "ended" ||
    now >= end + 5 * 60000
  )
    return { state: "expired" as const, expiresAt: end + 5 * 60000 };
  if (now < start - 15 * 60000)
    return { state: "upcoming" as const, expiresAt: end + 5 * 60000 };
  return { state: "open" as const, expiresAt: end + 5 * 60000 };
}
export function taskProgress(
  tasks: { status: string; due_at?: string | null }[],
  ends?: string | null,
  now = Date.now(),
) {
  const active = tasks.filter((t) => t.status !== "Cancelled"),
    done = active.filter((t) => t.status === "Done").length,
    overdue = active.filter(
      (t) => t.status !== "Done" && t.due_at && Date.parse(t.due_at) < now,
    ).length;
  return {
    progress: active.length ? Math.round((done / active.length) * 100) : 0,
    overdue,
    health:
      overdue ||
      (ends && Date.parse(ends + "T23:59:59Z") < now && done < active.length)
        ? "Overdue"
        : active.some((t) => t.status === "Blocked")
          ? "At risk"
          : "On track",
  };
}
export function pageBounds(url: URL) {
  return {
    limit: Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit")) || 20),
    ),
    offset: Math.min(
      100000,
      Math.max(0, Number(url.searchParams.get("offset")) || 0),
    ),
  };
}
export function csvCell(v: unknown) {
  const s = String(v ?? "");
  return (
    '"' + (/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"'
  );
}
export function csv(headers: string[], rows: unknown[][]) {
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
  );
}
export function resolveSelection(
  people: { id: string; department: string }[],
  ids: string[],
  departments: string[],
  exclude: string[],
) {
  const removed = new Set(exclude);
  return people
    .filter(
      (p) =>
        !removed.has(p.id) &&
        (ids.includes(p.id) || departments.includes(p.department)),
    )
    .map((p) => p.id);
}
export function safeReturnPath(role: "employer" | "employee", path: string) {
  const base = role === "employer" ? "/dashboard/employer" : "/employee";
  return path.startsWith(base + "/") ? path : base;
}

// Next's internal URL may use localhost behind a proxy. Host remains the requested authority.
export function sameOrigin(
  origin: string,
  host: string | null,
  protocol: string,
) {
  try {
    return (
      Boolean(host) &&
      new URL(origin).origin === new URL(protocol + "//" + host).origin
    );
  } catch {
    return false;
  }
}
