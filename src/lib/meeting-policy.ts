export type MeetingType = "video" | "audio";
export function meetingConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const integer = (key: string, fallback: number, min: number, max: number) => {
    const n = Number(env[key]);
    return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
  };
  return {
    budget: integer("MEETING_MONTHLY_BUDGET_MINUTES", 8000, 1, 10000000),
    maxParticipants: integer("MEETING_MAX_PARTICIPANTS", 32, 2, 100),
    tokenSeconds: integer("MEETING_TOKEN_TTL_SECONDS", 300, 60, 600),
  };
}
export function scheduleInput(b: Record<string, unknown>, now = Date.now()) {
  const instant = b.instant === true;
  const raw = String(b.startsAt || "");
  if (!instant && !/(Z|[+-]\d{2}:\d{2})$/.test(raw))
    throw Error("Provide a start time with a UTC offset.");
  const date = instant ? new Date(now) : new Date(raw),
    duration = Number(b.durationMinutes || 60),
    timezone = String(b.timezone || "UTC");
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format(date);
  } catch {
    throw Error("Invalid start time or timezone.");
  }
  if (
    !Number.isFinite(date.getTime()) ||
    date.getTime() < now - 60000 ||
    date.getTime() > now + 366 * 86400000 ||
    !Number.isInteger(duration) ||
    duration < 15 ||
    duration > 240
  )
    throw Error(
      "Choose a valid start time and a duration from 15 to 240 minutes.",
    );
  const type = b.type ?? "audio";
  if (type !== "video" && type !== "audio")
    throw Error("Choose video or audio.");
  return { date, duration, timezone, type: type as MeetingType };
}
export function reservationMonths(
  start: Date,
  end: Date,
  participants: number,
) {
  const result: { month: string; minutes: number }[] = [];
  let t = start.getTime();
  while (t < end.getTime()) {
    const d = new Date(t),
      next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
    const until = Math.min(next, end.getTime());
    result.push({
      month: d.toISOString().slice(0, 7) + "-01",
      minutes: Math.ceil((until - t) / 60000) * participants,
    });
    t = until;
  }
  return result;
}
export function tokenExpiry(now: number, meetingEnd: number, ttl = 300) {
  if (meetingEnd <= now) throw Error("Meeting ended");
  return Math.floor(Math.min(now + ttl * 1000, meetingEnd) / 1000);
}
export function calendarFile(
  m: {
    id: string;
    title: string;
    starts_at: string | Date;
    duration_minutes: number;
    status: string;
    join_generation: number;
  },
  origin: string,
  invitationUrl?: string,
) {
  const clean = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/[\r\n]+/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const stamp = (n: number) =>
    new Date(n)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z/, "Z");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aerotech//Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + m.id + "@aerotechhr.app",
    "DTSTAMP:" + stamp(Date.now()),
    "SEQUENCE:" + m.join_generation,
    "DTSTART:" + stamp(new Date(m.starts_at).getTime()),
    "DTEND:" +
      stamp(new Date(m.starts_at).getTime() + m.duration_minutes * 60000),
    "SUMMARY:" + clean(m.title),
    "URL:" + (invitationUrl || origin + "/meet/" + m.id),
    "DESCRIPTION:Sign into your invited Aerotech portal to join. Review the call provider and settings before joining.",
    "STATUS:" + (m.status === "cancelled" ? "CANCELLED" : "CONFIRMED"),
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map((line) => {
      let result = "",
        bytes = 0;
      for (const character of line) {
        const n = new TextEncoder().encode(character).length;
        if (bytes + n > 74) {
          result += "\r\n ";
          bytes = 1;
        }
        result += character;
        bytes += n;
      }
      return result;
    })
    .join("\r\n");
}
