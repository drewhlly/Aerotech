export function eventVisible(expiresAt: string | null | undefined, now: number) {
  if (!expiresAt) return true;
  const expiry = Date.parse(expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}
export function meetingEnd(meeting: {starts_at: string; duration_minutes?: number}) {
  const end = Date.parse(meeting.starts_at) + (meeting.duration_minutes ?? 60) * 60000;
  return Number.isFinite(end) ? new Date(end).toISOString() : '';
}
