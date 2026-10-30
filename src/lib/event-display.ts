export function eventVisible(expiresAt: string | null | undefined, now: number) {
  if (!expiresAt) return true;
  const expiry = Date.parse(expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}
export function meetingEnd(meeting: {starts_at: string; duration_minutes?: number}) {
  const end = Date.parse(meeting.starts_at) + (meeting.duration_minutes ?? 60) * 60000;
  return Number.isFinite(end) ? new Date(end).toISOString() : '';
}
export function vacancyEnd(job: {expires_at?: string|null;deadline?: string|null}) {
 const ends=[job.expires_at,job.deadline].filter((v):v is string=>Boolean(v));
 return ends.sort((a,b)=>Date.parse(a)-Date.parse(b))[0]||null;
}
export function vacancyVisible(job: {status:string;expires_at?:string|null;deadline?:string|null}, now:number) {
 return job.status==='published'&&Boolean(vacancyEnd(job))&&eventVisible(vacancyEnd(job),now);
}
