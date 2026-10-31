import type { PoolClient } from "pg";
export async function deliverInterviewUpdate(
  c: PoolClient,
  job: {
    id: string;
    employer_id: string;
    created_at: Date | string;
    payload: Record<string, unknown>;
  },
) {
  const b = job.payload,
    r = await c.query(
      "SELECT a.id,a.stage,a.interview_revision,a.interview_at,a.interview_room_id,a.interview_completed_at,j.title,p.email AS candidate_email,e.company_email,m.status,m.duration_minutes FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN applicant_accounts p ON p.id=a.applicant_id JOIN employer_accounts e ON e.id=j.employer_id LEFT JOIN meet_rooms m ON m.id=a.interview_room_id AND m.employer_id=j.employer_id WHERE a.id::text=$1 AND j.employer_id=$2",
      [String(b.application), job.employer_id],
    );
  const a = r.rows[0];
  if (!a || a.interview_revision !== Number(b.revision)) return;
  if (
    !b.cancelled &&
    (a.stage !== "interview" ||
      a.interview_completed_at ||
      a.status !== "scheduled" ||
      new Date(a.interview_at).getTime() + a.duration_minutes * 60000 <=
        Date.now())
  )
    return;
  if (Date.now() - new Date(job.created_at).getTime() > 23 * 3600000)
    throw Error("Interview email delivery window expired");
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.INVITATION_FROM_EMAIL ||
    !process.env.APP_BASE_URL?.startsWith("https://")
  )
    throw Error("Interview email delivery is not configured");
  for (const [kind, to, path] of [
    ["candidate", a.candidate_email, "/applicant/interviews"],
    ["employer", a.company_email, "/dashboard/employer/recruitment/scheduling"],
  ]) {
    const link = new URL(path, process.env.APP_BASE_URL).toString(),
      subject = b.cancelled
        ? "Interview cancelled"
        : b.reminder
          ? "Interview reminder"
          : "Interview scheduled",
      text =
        (b.cancelled
          ? "The interview was cancelled. Choose a new time with HR."
          : "Interview time: " +
            new Date(a.interview_at).toISOString() +
            ". Your portal displays this in your local timezone.") +
        "\n\n" +
        a.title +
        "\nOpen your Aerotech portal: " +
        link +
        "\nCalendar downloads and joining controls are available in your portal.";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        "Idempotency-Key": job.id + ":" + kind,
      },
      body: JSON.stringify({
        from: process.env.INVITATION_FROM_EMAIL,
        to: [to],
        subject: subject + ": " + a.title,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw Error("Interview email provider rejected delivery");
  }
}
