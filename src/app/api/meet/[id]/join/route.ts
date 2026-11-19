import { externalMeetingUrl } from "@/lib/meeting-hybrid-policy";
import {
  transaction,
  respond,
  errorResponse,
  AccessError,
} from "@/lib/collaboration";
import {
  meetingActor,
  meetingBody,
  accessibleMeeting,
  requireOpen,
  provisionMeeting,
  confirmedName,
} from "@/lib/meeting-access";
import { meetingProvider, meetingProviderReady } from "@/lib/meeting-provider";
import { meetingConfig } from "@/lib/meeting-policy";
export const runtime = "nodejs"; // Existing pg + HttpOnly session implementation; not an Edge handler.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const a = await meetingActor(),
      { id } = await ctx.params;
    return await transaction(async (c) => {
      const {
        meeting: m,
        participant: p,
        host,
      } = await accessibleMeeting(
        c,
        a,
        id,
        _request.headers.get("authorization")?.replace(/^Bearer /, "") || "",
      );
      const w = requireOpen(m);
      return respond({
        state: "open",
        id: m.id,
        title: m.title,
        type: m.type,
        startsAt: m.starts_at,
        expiresAt: w.expiresAt,
        name: a.name,
        host,
        status: p.status,
        admitted:
          host ||
          (p.admitted_generation === m.join_generation &&
            ["admitted", "joined"].includes(p.status)),
        configured: m.mode === "external_link" || meetingProviderReady(),
        mode: m.mode,
      });
    });
  } catch (e) {
    if (e instanceof AccessError && (e.status === 410 || e.status === 425))
      return respond(
        { error: e.message, state: e.status === 410 ? "expired" : "upcoming" },
        e.status,
      );
    return errorResponse(e);
  }
}
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const b = await meetingBody(request),
      a = await meetingActor(),
      { id } = await ctx.params;
    return await transaction(async (c) => {
      const {
        meeting: m,
        participant: p,
        host,
      } = await accessibleMeeting(
        c,
        a,
        id,
        request.headers.get("authorization")?.replace(/^Bearer /, "") || "",
      );
      const w = requireOpen(m);
      if (p.status === "rejected")
        throw new AccessError(
          "The host has declined this meeting request.",
          403,
        );
      if (m.mode === "external_link")
        return respond({
          mode: "external_link",
          externalUrl: externalMeetingUrl(m.external_url),
          title: m.title,
        });
      if (
        !host &&
        !(
          p.admitted_generation === m.join_generation &&
          ["admitted", "joined"].includes(p.status)
        )
      ) {
        await c.query(
          "UPDATE meeting_participants SET status='waiting' WHERE id=$1",
          [p.id],
        );
        return respond(
          { waiting: true, message: "Waiting for the host to admit you." },
          202,
        );
      }
      if (!meetingProviderReady())
        throw new AccessError(
          "Meetings are awaiting provider setup. Please contact support.",
          503,
        );
      const room = await provisionMeeting(c, m);
      // Do not mint unlimited tokens from repeated requests. One refresh per 15s per identity.
      const recent = await c.query(
        "SELECT 1 FROM collaboration_audit WHERE employer_id=$1 AND actor=$2 AND action='meeting.token' AND resource_id=$3 AND created_at>NOW()-INTERVAL '15 seconds' LIMIT 1",
        [m.employer_id, a.kind + ":" + a.userId, id],
      );
      if (recent.rowCount)
        throw new AccessError("Wait a few seconds before rejoining.", 429);
      const name = confirmedName(b.name, a.name),
        token = await meetingProvider().createToken({
          room: room.name,
          userId: a.userId,
          name,
          host,
          type: m.type,
          endsAt: w.expiresAt,
          ttl: meetingConfig().tokenSeconds,
        });
      await c.query(
        "UPDATE meeting_participants SET joined_at=COALESCE(joined_at,NOW()),status='joined' WHERE id=$1",
        [p.id],
      );
      if (a.kind === "employee")
        await c.query(
          "UPDATE meet_participants SET joined_at=COALESCE(joined_at,NOW()) WHERE room_id=$1 AND employee_id=$2",
          [id, a.userId],
        );
      await c.query(
        "INSERT INTO collaboration_audit(employer_id,actor,action,resource_id,details) VALUES($1,$2,'meeting.token',$3,'{}')",
        [m.employer_id, a.kind + ":" + a.userId, id],
      );
      return respond({
        provider: "daily",
        url: room.url,
        token,
        title: m.title,
        type: m.type,
        expiresAt: w.expiresAt,
        name,
        host,
      });
    });
  } catch (e) {
    if (e instanceof AccessError && (e.status === 410 || e.status === 425))
      return respond(
        { error: e.message, state: e.status === 410 ? "expired" : "upcoming" },
        e.status,
      );
    return errorResponse(e);
  }
}
