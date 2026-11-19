import type { PoolClient } from "pg";
import { dailyRequest, meetingProviderReady } from "./meeting-provider";
import { minuteSegments } from "./meeting-hybrid-policy";
// Verified 2026-11-19: https://docs.daily.co/reference/rest-api/meetings/list-meetings
// Poll only server-authenticated analytics. A client Leave is never a usage event.
export async function reconcileMeetingUsage(c: PoolClient) {
  if (!meetingProviderReady()) return;
  const rooms = (
    await c.query(
      `SELECT r.*,m.employer_id,m.starts_at,m.duration_minutes FROM meeting_provider_rooms r JOIN meetings m ON m.id=r.meeting_id WHERE r.usage_finalized_at IS NULL AND (r.usage_checked_at IS NULL OR r.usage_checked_at<NOW()-INTERVAL '5 minutes') ORDER BY r.usage_checked_at NULLS FIRST LIMIT 20 FOR UPDATE OF r SKIP LOCKED`,
    )
  ).rows;
  for (const r of rooms) {
    let cursor = "",
      pages = 0,
      complete = false;
    while (pages++ < 20) {
      const q = new URLSearchParams({
        room: r.room_name,
        limit: "100",
        no_participants: "false",
        ...(cursor ? { starting_after: cursor } : {}),
      });
      const result = await dailyRequest("/meetings?" + q);
      if (!Array.isArray(result.data))
        throw Error("Provider usage response unavailable");
      const sessions = result.data as Record<string, unknown>[];
      for (const session of sessions) {
        if (session.room !== r.room_name || session.ongoing !== false) continue;
        if (
          typeof session.id !== "string" ||
          !Array.isArray(session.participants)
        )
          throw Error("Incomplete provider usage metadata");
        for (const value of session.participants) {
          const p = value as Record<string, unknown>;
          if (
            typeof p.participant_id !== "string" ||
            typeof p.join_time !== "number" ||
            typeof p.duration !== "number" ||
            p.duration < 0 ||
            p.duration > 86400
          )
            throw Error("Invalid provider participant duration");
          const joined = p.join_time * 1000,
            left = joined + p.duration * 1000;
          if (left > Date.now() + 60000)
            throw Error("Provider usage is not final");
          // Count every provider participant, including unknown IDs, towards the room owner.
          const inserted = await c.query(
            "INSERT INTO meeting_usage_segments(employer_id,meeting_id,generation,provider_session_id,provider_participant_id,joined_at,left_at,audio_only) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING RETURNING provider_participant_id",
            [
              r.employer_id,
              r.meeting_id,
              r.generation,
              session.id,
              p.participant_id,
              new Date(joined),
              new Date(left),
              r.type === "audio",
            ],
          );
          if (inserted.rowCount)
            for (const segment of minuteSegments(joined, left))
              await c.query(
                "INSERT INTO employer_meeting_usage(employer_id,month,participant_minutes,audio_minutes) VALUES($1,$2,$3,$4) ON CONFLICT(employer_id,month) DO UPDATE SET participant_minutes=employer_meeting_usage.participant_minutes+EXCLUDED.participant_minutes,audio_minutes=employer_meeting_usage.audio_minutes+EXCLUDED.audio_minutes,updated_at=NOW()",
                [
                  r.employer_id,
                  segment.month,
                  segment.minutes,
                  r.type === "audio" ? segment.minutes : 0,
                ],
              );
        }
      }
      if (sessions.length < 100) {
        complete = true;
        break;
      }
      const last = sessions.at(-1)?.id;
      if (typeof last !== "string" || last === cursor)
        throw Error("Provider usage pagination incomplete");
      cursor = last;
    }
    const expiry =
      new Date(r.starts_at).getTime() + (r.duration_minutes + 5) * 60000;
    // Keep capacity reserved through room expiry and a 24h reporting lag. Delayed
    // provider data is polled for 7 days. Never report reservations as actual use.
    if (complete && Date.now() > expiry + 86400000)
      await c.query(
        "UPDATE employer_meeting_reservations SET released_at=NOW() WHERE meeting_id=$1 AND generation=$2 AND released_at IS NULL",
        [r.meeting_id, r.generation],
      );
    await c.query(
      "UPDATE meeting_provider_rooms SET usage_checked_at=NOW(),usage_finalized_at=CASE WHEN $3::boolean THEN NOW() ELSE NULL END WHERE meeting_id=$1 AND generation=$2",
      [
        r.meeting_id,
        r.generation,
        complete && Date.now() > expiry + 7 * 86400000,
      ],
    );
  }
}
