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
import { terminateConference } from "@/lib/meeting-provider";
import { meetingAccess } from "@/lib/meeting-service";
import { createTask } from "@/lib/project-service";
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
        meeting: { ...meeting, joinState: joinWindow(meeting).state },
        participants,
        actions: (
          await c.query(
            "SELECT id,title,task_id FROM meeting_actions WHERE room_id=$1 LIMIT 100",
            [id],
          )
        ).rows,
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
      b = await req.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return respond({error:'Request body must be a JSON object.'},400);

    let generation: number | undefined;
    const result = await transaction(async (c) => {
      const meeting = await meetingAccess(c, a, id, b.action !== "rsvp");
      if (b.action === "rsvp") {
        if (!a.employee || !["Accept", "Decline", "Maybe"].includes(b.rsvp))
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
      } else if (b.action === "notes")
        await c.query("UPDATE meet_rooms SET notes=$1 WHERE id=$2", [
          text(b.notes, 20000),
          id,
        ]);
      else if (b.action === "task") {
        const task = await createTask(c, a, b.projectId, {
          title: b.title,
          dueAt: b.dueAt,
          assignees: b.assignees || [],
        });
        await c.query(
          "INSERT INTO meeting_actions(employer_id,room_id,title,task_id) VALUES($1,$2,$3,$4)",
          [a.tenant, id, task.title, task.id],
        );
        return respond({ taskId: task.id, projectId: task.project_id }, 201);
      } else throw new AccessError("Unknown operation", 400);
      await audit(c, a, "meeting." + b.action, id);
      return respond({ ok: true });
    });
    if (generation !== undefined && process.env.JAAS_APP_ID) {
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
