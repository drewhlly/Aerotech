import {
  transaction,
  respond,
  errorResponse,
  id,
  AccessError,
} from "@/lib/collaboration";
import {
  meetingActor,
  meetingBody,
  accessibleMeeting,
  requireMeetingHost,
  requireOpen,
} from "@/lib/meeting-access";
export const runtime = "nodejs";
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const a = await meetingActor(),
      { id } = await ctx.params;
    return await transaction(async (c) => {
      const { meeting: m, host } = await accessibleMeeting(c, a, id);
      requireMeetingHost(host);
      requireOpen(m);
      const r = await c.query(
        "SELECT p.id,p.principal_type,COALESCE(e.first_name||' '||e.last_name,x.first_name||' '||x.last_name,'Invited participant') AS name FROM meeting_participants p LEFT JOIN workforce_employees e ON p.principal_type='employee' AND e.id=p.user_id AND e.employer_id=p.employer_id LEFT JOIN applicant_accounts x ON p.principal_type='applicant' AND x.id=p.user_id WHERE p.meeting_id=$1 AND p.status='waiting' ORDER BY p.invited_at LIMIT 100",
        [id],
      );
      return respond({ waiting: r.rows });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const b = await meetingBody(req),
      a = await meetingActor(),
      { id: room } = await ctx.params;
    if (typeof b.admit !== "boolean")
      throw new AccessError("Choose admit or decline.", 400);
    return await transaction(async (c) => {
      const { meeting: m, host } = await accessibleMeeting(c, a, room);
      requireMeetingHost(host);
      requireOpen(m);
      const r = await c.query(
        "UPDATE meeting_participants SET status=$1,admitted_generation=$2 WHERE id=$3 AND meeting_id=$4 AND role='participant' AND status='waiting' RETURNING id",
        [
          b.admit === true ? "admitted" : "rejected",
          m.join_generation,
          id(b.participantId),
          room,
        ],
      );
      return respond({ ok: Boolean(r.rowCount) });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
