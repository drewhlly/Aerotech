import {activeMeeting} from '@/lib/notification-policy';
import {
  actor,
  transaction,
  errorResponse,
  respond,
} from "@/lib/collaboration";
import { currentApplicant } from "@/lib/applicant-session";
import { db } from "@/lib/employer-session";
import { scheduleMeeting } from "@/lib/meeting-service";
import { joinWindow, pageBounds } from "@/lib/collaboration-policy";
export const runtime = "nodejs";
export async function GET(req: Request) {
  try {
    const applicant = await currentApplicant(),
      u = new URL(req.url),
      { limit, offset } = pageBounds(u);
    const history=u.searchParams.get("history")==="1";
    if (applicant) {
      const c = db();
      try {
        const r = await c.query(
          `SELECT m.id,m.title,m.starts_at,m.duration_minutes,m.status,m.revoked_at FROM meet_rooms m JOIN ats_applications a ON a.interview_room_id=m.id JOIN ats_jobs j ON j.id=a.job_id AND j.employer_id=m.employer_id WHERE a.applicant_id=$1 AND a.stage='interview' AND ($4::boolean AND NOT (${activeMeeting}) OR NOT $4::boolean AND (${activeMeeting})) ORDER BY m.starts_at DESC LIMIT $2 OFFSET $3`,
          [applicant, limit, offset,history],
        );
        return respond({
          meetings: r.rows.map((m) => ({
            ...m,
            joinState: joinWindow(m).state,
          })),
          role: "applicant",
          limit,
          offset,
        });
      } finally {
        await c.end();
      }
    }
    const a = await actor();
    return await transaction(async (c) => {
      const r = await c.query(
        `SELECT m.id,m.title,m.agenda,m.starts_at,m.duration_minutes,m.timezone,m.status,m.notes,m.location,m.recurrence,p.rsvp,CASE WHEN m.revoked_at IS NULL THEN FALSE ELSE TRUE END revoked,(SELECT count(*)::int FROM meet_participants x WHERE x.room_id=m.id) attendee_count FROM meet_rooms m LEFT JOIN meet_participants p ON p.room_id=m.id AND p.employee_id=$2 WHERE m.employer_id=$1 AND ($2::uuid IS NULL OR p.employee_id IS NOT NULL) AND ($5::boolean AND NOT (${activeMeeting}) OR NOT $5::boolean AND (${activeMeeting})) ORDER BY m.starts_at DESC,m.id LIMIT $3 OFFSET $4`,
        [a.tenant, a.employee, limit, offset,history],
      );
      return respond({
        meetings: r.rows.map((m) => ({
          ...m,
          joinState: joinWindow({ ...m, revoked_at: m.revoked ? true : null })
            .state,
        })),
        role: a.role,
        limit,
        offset,
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: Request) {
  try {
    const a = await actor(),
      b = await req.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return respond({error:'Request body must be a JSON object.'},400);

    return await transaction(async (c) =>
      respond(await scheduleMeeting(c, a, b), 201),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
