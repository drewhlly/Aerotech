import {
  actor,
  transaction,
  errorResponse,
  respond,
  text,
  projectAccess,
  AccessError,
} from "@/lib/collaboration";
import { pageBounds } from "@/lib/collaboration-policy";
export async function GET(req: Request) {
  try {
    const a = await actor(),
      u = new URL(req.url),
      { offset } = pageBounds(u),
      q = text(u.searchParams.get("q"), 100),
      project = u.searchParams.get("project");
    return await transaction(async (c) => {
      if (a.employee && !project)
        throw new AccessError("Project membership required");
      if (project) await projectAccess(c, a, project);
      const date = u.searchParams.get("startsAt"),
        end = u.searchParams.get("endsAt");
      if (
        (date && Number.isNaN(Date.parse(date))) ||
        (end && Number.isNaN(Date.parse(end)))
      )
        throw new AccessError("Invalid dates", 400);
      const result = await c.query(
        `SELECT e.id,e.first_name||' '||e.last_name name,e.email,e.employee_number staff_id,e.department,e.job_title,e.location,CASE WHEN $5::timestamptz IS NULL THEN NULL ELSE EXISTS(SELECT 1 FROM meet_participants p JOIN meet_rooms m ON m.id=p.room_id WHERE p.employee_id=e.id AND m.status='scheduled' AND p.rsvp<>'Decline' AND m.starts_at<$6 AND m.starts_at+m.duration_minutes*INTERVAL '1 minute'>$5) END conflict
 FROM workforce_employees e WHERE e.employer_id=$1 AND e.employment_status IN ('active','probation','on_leave') AND (COALESCE(e.first_name,'')||' '||COALESCE(e.last_name,'')||' '||COALESCE(e.email,'')||' '||COALESCE(e.employee_number,'')||' '||COALESCE(e.job_title,'')||' '||COALESCE(e.department,'')) ILIKE $2 AND ($4::uuid IS NULL OR EXISTS(SELECT 1 FROM project_members m WHERE m.employee_id=e.id AND m.project_id=$4)) ORDER BY (SELECT max(m.starts_at) FROM meet_participants p JOIN meet_rooms m ON m.id=p.room_id WHERE p.employee_id=e.id) DESC NULLS LAST,e.first_name,e.id LIMIT 21 OFFSET $3`,
        [
          a.tenant,
          "%" + q + "%",
          offset,
          project,
          date,
          date
            ? end || new Date(Date.parse(date) + 3600000).toISOString()
            : null,
        ],
      );
      return respond({
        records: result.rows.slice(0, 20),
        hasMore: result.rows.length > 20,
        offset,
        limit: 20,
        availabilitySource:
          "Aerotech meetings only; no connected external calendar",
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
