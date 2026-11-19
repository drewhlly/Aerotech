import type { PoolClient } from "pg";
import { AccessError } from "./collaboration";
export async function limitMeetingCreation(c: PoolClient, tenant: string) {
  await c.query("SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE", [
    tenant,
  ]);
  const recent = await c.query(
    "SELECT count(*)::int n FROM meet_rooms WHERE employer_id=$1 AND created_at>NOW()-INTERVAL '5 minutes'",
    [tenant],
  );
  if (recent.rows[0].n >= 5)
    throw new AccessError(
      "You can create up to five meetings in five minutes.",
      429,
    );
}
