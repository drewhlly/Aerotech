export type MeetingMode = "external_link" | "built_in";
export function externalMeetingUrl(
  value: unknown,
  domains = process.env.MEETING_EXTERNAL_ALLOWED_DOMAINS ||
    "meet.google.com,zoom.us,teams.microsoft.com,teams.live.com",
) {
  if (typeof value !== "string" || value.length > 2048)
    throw Error("Paste a valid HTTPS meeting link.");
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    throw Error("Paste a valid HTTPS meeting link.");
  }
  const allowed = domains
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter((x) => /^[a-z0-9.-]+$/.test(x));
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    u.port ||
    !allowed.some((d) => u.hostname === d || u.hostname.endsWith("." + d))
  )
    throw Error(
      "Use an HTTPS Google Meet, Zoom or Teams link from an allowed meeting domain.",
    );
  if (!u.pathname || u.pathname === "/")
    throw Error("Paste the full meeting link, including its meeting path.");
  return u.href;
}
export function hybridInput(b: Record<string, unknown>) {
  const mode = b.mode ?? "external_link";
  if (mode !== "external_link" && mode !== "built_in")
    throw Error("Choose external link or built-in meeting.");
  if (mode === "built_in" && b.externalUrl)
    throw Error("Built-in meetings cannot use an external link.");
  return {
    mode: mode as MeetingMode,
    externalUrl:
      mode === "external_link" ? externalMeetingUrl(b.externalUrl) : null,
  };
}
export function minuteSegments(join: number, leave: number) {
  if (
    !Number.isFinite(join) ||
    !Number.isFinite(leave) ||
    join < 0 ||
    leave < join
  )
    throw Error("Invalid provider duration");
  const rows: { month: string; minutes: number }[] = [];
  let t = join;
  while (t < leave) {
    const d = new Date(t),
      end = Math.min(
        leave,
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1),
      );
    rows.push({
      month: d.toISOString().slice(0, 7) + "-01",
      minutes: (end - t) / 60000,
    });
    t = end;
  }
  return rows;
}
