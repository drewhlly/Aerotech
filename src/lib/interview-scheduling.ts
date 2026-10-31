import type { PoolClient } from "pg";
import { randomUUID } from "node:crypto";
import { enqueue } from "./collaboration";
import { scheduleInterview, retireInterview } from "./recruitment-interviews";
import { assessmentPolicy } from "./recruitment-screening";
export class SchedulingError extends Error {
  status: number;
  constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}
export async function bookInterview(
  c: PoolClient,
  applicant: string,
  application: string,
  slotId: string,
) {
  const owner = await c.query(
    "SELECT j.employer_id FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.id=$1 AND a.applicant_id=$2",
    [application, applicant],
  );
  if (!owner.rowCount) throw new SchedulingError("Application not found.", 404);
  const tenant = owner.rows[0].employer_id;
  await c.query("SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE", [
    tenant,
  ]);
  const a = (
    await c.query(
      "SELECT a.*,j.title FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.id=$1 AND a.applicant_id=$2 AND j.employer_id=$3 FOR UPDATE OF a",
      [application, applicant, tenant],
    )
  ).rows[0];
  const policy = assessmentPolicy(a.assessment_policy);
  if (
    !["shortlisted", "interview"].includes(a.stage) ||
    a.interview_completed_at ||
    (policy &&
      (a.assessment_score === null ||
        (a.assessment_score < policy.threshold && !policy.review)))
  )
    throw new SchedulingError(
      "This application is not currently eligible for interview booking.",
    );
  const slot = (
    await c.query(
      "SELECT * FROM recruitment_interview_slots WHERE id=$1 AND employer_id=$2 AND job_id=$3 FOR UPDATE",
      [slotId, tenant, a.job_id],
    )
  ).rows[0];
  if (
    !slot ||
    slot.status === "cancelled" ||
    (slot.status === "booked" && slot.application_id !== application)
  )
    throw new SchedulingError("This slot is no longer available.", 409);
  if (slot.application_id === application && a.interview_room_id)
    return { reused: true, room: a.interview_room_id };
  if (new Date(slot.starts_at).getTime() < Date.now() + 30 * 60000)
    throw new SchedulingError("Choose a slot at least 30 minutes ahead.");
  if (
    a.stage === "interview" &&
    a.interview_at &&
    new Date(a.interview_at).getTime() < Date.now() + 30 * 60000
  )
    throw new SchedulingError(
      "Contact HR for a change within 30 minutes of your interview.",
    );
  const duration = Math.round(
    (new Date(slot.ends_at).getTime() - new Date(slot.starts_at).getTime()) /
      60000,
  );
  if (slot.interviewer_employee_id) {
    const conflict = await c.query(
      "SELECT 1 FROM meet_participants p JOIN meet_rooms m ON m.id=p.room_id AND m.employer_id=p.employer_id WHERE p.employer_id=$1 AND p.employee_id=$2 AND p.rsvp<>'Decline' AND m.status='scheduled' AND m.revoked_at IS NULL AND m.starts_at<$4 AND m.starts_at+m.duration_minutes*INTERVAL '1 minute'>$3 AND m.id IS DISTINCT FROM $5::uuid LIMIT 1",
      [
        tenant,
        slot.interviewer_employee_id,
        slot.starts_at,
        slot.ends_at,
        a.interview_room_id,
      ],
    );
    if (conflict.rowCount)
      throw new SchedulingError(
        "The interviewer is no longer available. Choose another slot.",
        409,
      );
  }
  const room = await scheduleInterview(
    c,
    tenant,
    a.id,
    a.interview_room_id,
    a.title,
    new Date(slot.starts_at).toISOString(),
    duration,
    slot.interviewer_employee_id,
  );
  await c.query(
    "UPDATE recruitment_interview_slots SET status='booked',application_id=$2 WHERE id=$1",
    [slot.id, a.id],
  );
  await c.query(
    "UPDATE ats_applications SET stage='interview',interview_at=$2 WHERE id=$1",
    [a.id, slot.starts_at],
  );
  await c.query(
    "INSERT INTO ats_events(id,application_id,stage,message) VALUES($1,$2,'interview',$3)",
    [
      randomUUID(),
      a.id,
      "Candidate selected an employer-published interview slot: " +
        new Date(slot.starts_at).toISOString(),
    ],
  );
  return { room };
}
export async function cancelInterview(
  c: PoolClient,
  tenant: string,
  application: string,
  applicant: string | null,
  reason: string,
) {
  const a = (
    await c.query(
      "SELECT a.* FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.id=$1 AND j.employer_id=$2 AND ($3::uuid IS NULL OR a.applicant_id=$3) FOR UPDATE OF a",
      [application, tenant, applicant],
    )
  ).rows[0];
  if (!a) throw new SchedulingError("Application not found.", 404);
  if (a.stage !== "interview" || a.interview_completed_at)
    throw new SchedulingError("No active interview to cancel.", 409);
  if (applicant && new Date(a.interview_at).getTime() < Date.now() + 30 * 60000)
    throw new SchedulingError(
      "Contact HR for changes within 30 minutes of the interview.",
    );
  if (a.interview_room_id)
    await retireInterview(c, tenant, a.interview_room_id, "cancelled");
  await c.query(
    "UPDATE recruitment_interview_slots SET status=CASE WHEN starts_at>NOW()+INTERVAL '30 minutes' THEN 'open' ELSE 'cancelled' END,application_id=NULL WHERE employer_id=$1 AND application_id=$2",
    [tenant, a.id],
  );
  const r = await c.query(
    "UPDATE ats_applications SET stage='shortlisted',interview_revision=interview_revision+1 WHERE id=$1 RETURNING interview_revision",
    [a.id],
  );
  await enqueue(
    c,
    tenant,
    "interview_update",
    "interview-cancel:" + a.id + ":" + r.rows[0].interview_revision,
    {
      application: a.id,
      revision: r.rows[0].interview_revision,
      cancelled: true,
    },
  );
  await c.query(
    "INSERT INTO ats_events(id,application_id,stage,message) VALUES($1,$2,'shortlisted',$3)",
    [randomUUID(), a.id, "Interview cancelled: " + reason],
  );
}
