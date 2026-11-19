import { meetingBody } from "@/lib/meeting-access";
import {
  actor,
  transaction,
  errorResponse,
  respond,
  AccessError,
  audit,
  text,
  notify,
  enqueue,
} from "@/lib/collaboration";
import { terminateConference } from "@/lib/meeting-service";
import { meetingAccess } from "@/lib/meeting-service";
import { scheduleInput } from "@/lib/meeting-policy";
import { joinWindow, pageBounds } from "@/lib/collaboration-policy";
type C = { params: Promise<{ id: string }> };
export async function GET(req: Request, ctx: C) {
  try {
    const a = await actor(),
      { id } = await ctx.params,
      u = new URL(req.url),
      { limit, offset } = pageBounds(u);
    return await transaction(async (c) => {
      const meeting = await meetingAccess(c, a, id),
        q = "%" + text(u.searchParams.get("q"), 100) + "%";
      const participants = (
        await c.query(
          `SELECT p.employee_id id,e.first_name||' '||e.last_name name,e.email,e.department,p.required,p.rsvp,p.joined_at FROM meet_participants p JOIN workforce_employees e ON e.id=p.employee_id WHERE p.room_id=$1 AND (e.first_name||' '||e.last_name||' '||e.email||' '||e.department) ILIKE $2 ORDER BY e.first_name LIMIT $3 OFFSET $4`,
          [id, q, limit, offset],
        )
      ).rows;
      return respond({
        meeting: {
          id: meeting.id,
          title: meeting.title,
          starts_at: meeting.starts_at,
          duration_minutes: meeting.duration_minutes,
          timezone: meeting.timezone,
          type: meeting.type,
          status: meeting.status,
          joinState: joinWindow(meeting).state,
        },
        participants,
        limit,
        offset,
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: Request, ctx: C) {
  try {
    const a = await actor(),
      { id } = await ctx.params,
      b = await meetingBody(req);
    if (!b || typeof b !== "object" || Array.isArray(b))
      return respond({ error: "Request body must be a JSON object." }, 400);

    let generation: number | undefined;
    const result = await transaction(async (c) => {
      const meeting = await meetingAccess(c, a, id, b.action !== "rsvp");
      if (b.action === "rsvp") {
        if (
          !a.employee ||
          typeof b.rsvp !== "string" ||
          !["Accept", "Decline", "Maybe"].includes(b.rsvp)
        )
          throw new AccessError("Invalid response", 400);
        await c.query(
          "UPDATE meet_participants SET rsvp=$1 WHERE room_id=$2 AND employee_id=$3",
          [b.rsvp, id, a.employee],
        );
      } else if (b.action === "cancel") {
        generation = meeting.join_generation;
        await enqueue(
          c,
          a.tenant,
          "meeting_terminate",
          "terminate:" + id + ":" + generation,
          { meeting: id, generation },
        );
        await c.query(
          "UPDATE meet_rooms SET status='cancelled',revoked_at=NOW(),join_generation=join_generation+1 WHERE id=$1",
          [id],
        );
        const recipients = (
          await c.query(
            "SELECT employee_id FROM meet_participants WHERE room_id=$1",
            [id],
          )
        ).rows;
        await notify(
          c,
          a,
          recipients.map((p) => "employee:" + p.employee_id),
          "meeting",
          "Meeting cancelled",
          "The organiser cancelled this meeting.",
          "/meet/" + id,
          id + ":cancel",
        );
      } else if (b.action === "reschedule") {
        let settings;
        try {
          settings = scheduleInput(b);
        } catch (e) {
          throw new AccessError(
            e instanceof Error ? e.message : "Invalid schedule",
            400,
          );
        }
        generation = meeting.join_generation;
        await enqueue(
          c,
          a.tenant,
          "meeting_terminate",
          "terminate:" + id + ":" + generation,
          { meeting: id, generation },
        );
        await c.query(
          "UPDATE meet_rooms SET starts_at=$1,duration_minutes=$2,timezone=$3,type=$4,join_generation=join_generation+1,status='scheduled',revoked_at=NULL,provider_room_name=NULL,provider_generation=NULL WHERE id=$5",
          [
            settings.date,
            settings.duration,
            settings.timezone,
            settings.type,
            id,
          ],
        );
        const linked = await c.query(
          "UPDATE ats_applications SET interview_at=$1,interview_revision=interview_revision+1 WHERE interview_room_id=$2 RETURNING id,interview_revision",
          [settings.date, id],
        );
        for (const app of linked.rows)
          await enqueue(
            c,
            a.tenant,
            "interview_update",
            "interview:" + app.id + ":" + app.interview_revision,
            { application: app.id, revision: app.interview_revision },
          );
      } else if (b.action === "notes" || b.action === "task")
        throw new AccessError(
          "Meeting content storage is retired. Use Projects for your own action items.",
          410,
        );
      else throw new AccessError("Unknown operation", 400);
      if (b.action === "cancel" || b.action === "reschedule")
        await c.query(
          "INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT p.employer_id,k,'meeting-'||$2::text||':'||p.id||':'||m.join_generation||':'||k,jsonb_build_object('meeting',m.id,'participant',p.id,'generation',m.join_generation,'event',$2) FROM meeting_participants p JOIN meet_rooms m ON m.id=p.meeting_id CROSS JOIN unnest(ARRAY['meeting_delivery','meeting_notice']) AS k WHERE m.id=$1 ON CONFLICT DO NOTHING",
          [id, b.action === "cancel" ? "cancel" : "invite"],
        );
      await audit(c, a, "meeting." + b.action, id);
      return respond({ ok: true });
    });
    if (generation !== undefined) {
      try {
        await terminateConference(a.tenant, id, generation);
      } catch {
        /* Durable retry remains queued; access is already revoked. */
      }
    }
    return result;
  } catch (e) {
    return errorResponse(e);
  }
}
