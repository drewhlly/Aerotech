import { currentApplicant } from "@/lib/applicant-session";
import {
  activeCollaborationNotice,
  collaborationNoticeExpiry,
} from "@/lib/notification-policy";
import {
  actor,
  transaction,
  errorResponse,
  respond,
  AccessError,
  text,
  id,
} from "@/lib/collaboration";
import { pageBounds } from "@/lib/collaboration-policy";
const events = [
  "assignment",
  "mention",
  "due",
  "overdue",
  "status",
  "comment",
  "meeting",
  "document",
];
export async function GET(req: Request) {
  try {
    const candidate = await currentApplicant();
    if (candidate) {
      const { limit, offset } = pageBounds(new URL(req.url));
      return await transaction(async (c) => {
        const records = (
          await c.query(
            "SELECT n.* FROM collaboration_notifications n WHERE n.actor=$1 AND n.event IN ('meeting','status') AND n.in_app AND (n.expires_at IS NULL OR n.expires_at>NOW()) ORDER BY n.created_at DESC LIMIT $2 OFFSET $3",
            ["applicant:" + candidate, limit, offset],
          )
        ).rows;
        return respond({
          records,
          preferences: [],
          unread: records.filter((r) => !r.read_at).length,
          nextExpiry: null,
        });
      });
    }
    const a = await actor(),
      { limit, offset } = pageBounds(new URL(req.url));
    return await transaction(async (c) =>
      respond({
        records: (
          await c.query(
            `SELECT n.*,(${collaborationNoticeExpiry}) AS expires_at FROM collaboration_notifications n WHERE n.employer_id=$1 AND n.actor=$2 AND n.in_app AND ($5::boolean AND NOT (${activeCollaborationNotice}) OR NOT $5::boolean AND (${activeCollaborationNotice})) ORDER BY n.created_at DESC,n.id LIMIT $3 OFFSET $4`,
            [
              a.tenant,
              a.id,
              limit,
              offset,
              new URL(req.url).searchParams.get("history") === "1",
            ],
          )
        ).rows,
        preferences: (
          await c.query(
            "SELECT event,in_app,email,digest FROM notification_preferences WHERE employer_id=$1 AND actor=$2",
            [a.tenant, a.id],
          )
        ).rows,
        nextExpiry: (
          await c.query(
            `SELECT MIN(${collaborationNoticeExpiry}) AS expiry FROM collaboration_notifications n WHERE n.employer_id=$1 AND n.actor=$2 AND n.in_app AND (${activeCollaborationNotice})`,
            [a.tenant, a.id],
          )
        ).rows[0].expiry,
        unread: (
          await c.query(
            `SELECT count(*)::int count FROM collaboration_notifications n WHERE n.employer_id=$1 AND n.actor=$2 AND n.in_app AND (${activeCollaborationNotice})`,
            [a.tenant, a.id],
          )
        ).rows[0].count,
      }),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PATCH(req: Request) {
  try {
    const candidate = await currentApplicant();
    if (candidate) {
      const b = await req.json();
      return await transaction(async (c) => {
        if (b.id)
          await c.query(
            "UPDATE collaboration_notifications SET read_at=NOW() WHERE actor=$1 AND id=$2 AND event IN ('meeting','status')",
            ["applicant:" + candidate, id(b.id)],
          );
        return respond({ ok: true });
      });
    }

    const a = await actor(),
      b = await req.json().catch(() => null);
    if (!b || typeof b !== "object" || Array.isArray(b))
      return respond({ error: "Request body must be a JSON object." }, 400);

    return await transaction(async (c) => {
      if (b.id) {
        await c.query(
          "UPDATE collaboration_notifications SET read_at=NOW() WHERE employer_id=$1 AND actor=$2 AND id=$3",
          [a.tenant, a.id, id(b.id)],
        );
        return respond({ ok: true });
      }
      const event = text(b.event, 30);
      if (
        !events.includes(event) ||
        !["none", "daily", "weekly"].includes(b.digest)
      )
        throw new AccessError("Invalid preference", 400);
      await c.query(
        "INSERT INTO notification_preferences(employer_id,actor,event,in_app,email,digest) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(employer_id,actor,event) DO UPDATE SET in_app=EXCLUDED.in_app,email=EXCLUDED.email,digest=EXCLUDED.digest",
        [a.tenant, a.id, event, Boolean(b.inApp), Boolean(b.email), b.digest],
      );
      return respond({ ok: true });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
