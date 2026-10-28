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
    const a = await actor(),
      { limit, offset } = pageBounds(new URL(req.url));
    return await transaction(async (c) =>
      respond({
        records: (
          await c.query(
            "SELECT * FROM collaboration_notifications WHERE employer_id=$1 AND actor=$2 AND in_app AND ($5::boolean OR read_at IS NULL AND (expires_at IS NULL OR expires_at>NOW())) ORDER BY created_at DESC,id LIMIT $3 OFFSET $4",
            [a.tenant, a.id, limit, offset,new URL(req.url).searchParams.get("history")==="1"],
          )
        ).rows,
        preferences: (
          await c.query(
            "SELECT event,in_app,email,digest FROM notification_preferences WHERE employer_id=$1 AND actor=$2",
            [a.tenant, a.id],
          )
        ).rows,
        unread: (
          await c.query(
            "SELECT count(*)::int count FROM collaboration_notifications WHERE employer_id=$1 AND actor=$2 AND in_app AND read_at IS NULL AND (expires_at IS NULL OR expires_at>NOW())",
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
    const a = await actor(),
      b = await req.json();
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
