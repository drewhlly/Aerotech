// iCalendar TEXT escaping, UTF-8 folding and UTC values follow RFC 5545.
const escapeText = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
function fold(line: string) {
  const parts: string[] = [];
  let part = "";
  for (const c of line) {
    if (Buffer.byteLength(part + c, "utf8") > 75) {
      parts.push(part);
      part = " ";
    }
    part += c;
  }
  parts.push(part);
  return parts.join("\r\n");
}
const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
export function interviewCalendar({
  id,
  revision,
  title,
  start,
  end,
  url,
  cancelled = false,
  now = new Date(),
}: {
  id: string;
  revision: number;
  title: string;
  start: Date;
  end: Date;
  url: string;
  cancelled?: boolean;
  now?: Date;
}) {
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Aerotech//Recruitment//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + id + "@aerotechhr.app",
      "SEQUENCE:" + revision,
      "DTSTAMP:" + stamp(now),
      "DTSTART:" + stamp(start),
      "DTEND:" + stamp(end),
      "SUMMARY:" + escapeText("Interview: " + title),
      "DESCRIPTION:" +
        escapeText("Join securely in your Aerotech portal: " + url),
      "URL:" + url,
      "STATUS:" + (cancelled ? "CANCELLED" : "CONFIRMED"),
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(fold)
      .join("\r\n") + "\r\n"
  );
}
