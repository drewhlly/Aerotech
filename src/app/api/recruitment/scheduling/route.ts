import {calendarDate} from '@/lib/leave-dates';
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentEmployer, db } from "@/lib/employer-session";
import { currentApplicant } from "@/lib/applicant-session";
import { uuid } from "@/lib/collaboration-policy";
import {
  bookInterview,
  cancelInterview,
  SchedulingError,
} from "@/lib/interview-scheduling";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
const reply = (b: unknown, status = 200) =>
  NextResponse.json(b, { status, headers });
export async function GET() {
  const employer = await currentEmployer(),
    applicant = employer ? null : await currentApplicant();
  if (!employer && !applicant)
    return reply({ error: "Sign in required." }, 401);
  const pool = db();
  try {
    if (employer) {
      const [jobs, employees, slots] = await Promise.all([
        pool.query(
          "SELECT id,title FROM ats_jobs WHERE employer_id=$1 ORDER BY created_at DESC LIMIT 200",
          [employer],
        ),
        pool.query(
          "SELECT id,first_name,last_name FROM workforce_employees WHERE employer_id=$1 AND employment_status IN ('active','probation','on_leave') ORDER BY first_name,last_name LIMIT 500",
          [employer],
        ),
        pool.query(
          "SELECT s.id,s.job_id,s.starts_at,s.ends_at,s.status,s.application_id,s.interviewer_employee_id,j.title,p.first_name,p.last_name FROM recruitment_interview_slots s JOIN ats_jobs j ON j.id=s.job_id AND j.employer_id=s.employer_id LEFT JOIN ats_applications a ON a.id=s.application_id LEFT JOIN applicant_accounts p ON p.id=a.applicant_id WHERE s.employer_id=$1 AND s.ends_at>NOW() AND s.status<>'cancelled' ORDER BY s.starts_at LIMIT 200",
          [employer],
        ),
      ]);
      return reply({
        role: "employer",
        jobs: jobs.rows,
        employees: employees.rows,
        slots: slots.rows,
      });
    }
    const applications = await pool.query(
      "SELECT a.id,a.job_id,a.stage,a.interview_at,a.interview_room_id,a.interview_revision,COALESCE(m.status='scheduled' AND m.revoked_at IS NULL AND a.interview_at+m.duration_minutes*INTERVAL '1 minute'>NOW(),FALSE) AS interview_active,j.title,e.company_name FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN employer_accounts e ON e.id=j.employer_id LEFT JOIN meet_rooms m ON m.id=a.interview_room_id AND m.employer_id=j.employer_id WHERE a.applicant_id=$1 AND a.stage IN ('shortlisted','interview') AND a.interview_completed_at IS NULL ORDER BY a.created_at DESC LIMIT 100",
      [applicant],
    );
    const slots = await pool.query(
      "SELECT s.id,s.job_id,s.starts_at,s.ends_at,s.status,s.application_id,j.title FROM recruitment_interview_slots s JOIN ats_jobs j ON j.id=s.job_id AND j.employer_id=s.employer_id WHERE s.starts_at>NOW()+INTERVAL '30 minutes' AND (s.status='open' OR s.application_id IN (SELECT id FROM ats_applications WHERE applicant_id=$1)) AND s.job_id IN (SELECT job_id FROM ats_applications WHERE applicant_id=$1 AND stage IN ('shortlisted','interview') AND interview_completed_at IS NULL) ORDER BY s.starts_at LIMIT 200",
      [applicant],
    );
    return reply({
      role: "applicant",
      applications: applications.rows,
      slots: slots.rows,
    });
  } catch {
    return reply({ error: "Interview scheduling is unavailable." }, 503);
  } finally {
    await pool.end();
  }
}
export async function POST(request: Request) {
  const employer = await currentEmployer(),
    applicant = employer ? null : await currentApplicant();
  if (!employer && !applicant)
    return reply({ error: "Sign in required." }, 401);
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object" || Array.isArray(b))
    return reply({ error: "Invalid request." }, 400);
  const pool = db(),
    c = await pool.connect();
  try {
    await c.query("BEGIN");
    if (b.action === "slot") {
      if (!employer) return reply({ error: "Employer access required." }, 403);
      if (
        !uuid(b.jobId) ||
        (b.interviewerId !== null &&
          b.interviewerId !== undefined &&
          b.interviewerId !== "" &&
          !uuid(b.interviewerId)) ||
        typeof b.startsAt !== "string" ||
        !/(Z|[+-]\d{2}:\d{2})$/.test(b.startsAt) || !calendarDate(b.startsAt.slice(0,10)) ||
        ![15, 30, 45, 60, 90, 120].includes(b.duration)
      )
        return reply(
          {
            error: "Choose a role, interviewer, valid start time and duration.",
          },
          400,
        );
      const start = new Date(b.startsAt),
        end = new Date(start.getTime() + b.duration * 60000);
      if (
        !Number.isFinite(start.getTime()) ||
        start.getTime() < Date.now() + 30 * 60000 ||
        start.getTime() > Date.now() + 90 * 86400000
      )
        return reply(
          {
            error: "Publish availability between 30 minutes and 90 days ahead.",
          },
          400,
        );
      await c.query("SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE", [
        employer,
      ]);
      if (
        !(
          await c.query(
            "SELECT 1 FROM ats_jobs WHERE employer_id=$1 AND id=$2",
            [employer, b.jobId],
          )
        ).rowCount
      )
        return reply({ error: "Role not found." }, 404);
      const interviewer = b.interviewerId || null;
      if (
        interviewer &&
        !(
          await c.query(
            "SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND id=$2 AND employment_status IN ('active','probation','on_leave')",
            [employer, interviewer],
          )
        ).rowCount
      )
        return reply({ error: "Interviewer not found." }, 404);
      const clash = await c.query(
        "SELECT id,job_id,starts_at,ends_at FROM recruitment_interview_slots WHERE employer_id=$1 AND interviewer_employee_id IS NOT DISTINCT FROM $2::uuid AND status<>'cancelled' AND starts_at<$4 AND ends_at>$3 LIMIT 1",
        [employer, interviewer, start, end],
      );
      if (clash.rowCount) {
        const old = clash.rows[0];
        if (
          old.job_id === b.jobId &&
          new Date(old.starts_at).getTime() === start.getTime() &&
          new Date(old.ends_at).getTime() === end.getTime()
        ) {
          await c.query("COMMIT");
          return reply({ id: old.id, reused: true });
        }
        return reply(
          { error: "This interviewer already has overlapping availability." },
          409,
        );
      }
      const id = randomUUID();
      await c.query(
        "INSERT INTO recruitment_interview_slots(id,employer_id,job_id,starts_at,ends_at,interviewer_employee_id) VALUES($1,$2,$3,$4,$5,$6)",
        [id, employer, b.jobId, start, end, interviewer],
      );
      await c.query("COMMIT");
      return reply({ id }, 201);
    }
    if (b.action === "remove_slot") {
      if (!employer) return reply({ error: "Employer access required." }, 403);
      if (!uuid(b.id)) return reply({ error: "Choose a slot." }, 400);
      await c.query("SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE", [
        employer,
      ]);
      const r = await c.query(
        "UPDATE recruitment_interview_slots SET status='cancelled' WHERE employer_id=$1 AND id=$2 AND status='open' RETURNING id",
        [employer, b.id],
      );
      if (!r.rowCount)
        return reply(
          {
            error:
              "Slot not found or already booked. Cancel a booked interview through the candidate record.",
          },
          409,
        );
      await c.query("COMMIT");
      return reply({ ok: true });
    }
    if (b.action === "book") {
      if (!applicant)
        return reply({ error: "Applicant access required." }, 403);
      if (!uuid(b.applicationId) || !uuid(b.slotId))
        return reply({ error: "Choose an application and slot." }, 400);
      const result = await bookInterview(
        c,
        applicant,
        b.applicationId,
        b.slotId,
      );
      await c.query("COMMIT");
      return reply({ ok: true, ...result });
    }
    if (b.action === "cancel") {
      if (
        !uuid(b.applicationId) ||
        typeof b.reason !== "string" ||
        b.reason.trim().length < 5 ||
        b.reason.length > 1000
      )
        return reply(
          { error: "Choose an interview and provide a short reason." },
          400,
        );
      const owner = await c.query(
        "SELECT j.employer_id FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.id=$1 AND ($2::uuid IS NOT NULL AND j.employer_id=$2 OR $3::uuid IS NOT NULL AND a.applicant_id=$3)",
        [b.applicationId, employer, applicant],
      );
      if (!owner.rowCount)
        return reply({ error: "Application not found." }, 404);
      await c.query("SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE", [
        owner.rows[0].employer_id,
      ]);
      await cancelInterview(
        c,
        owner.rows[0].employer_id,
        b.applicationId,
        applicant,
        b.reason.trim(),
      );
      await c.query("COMMIT");
      return reply({ ok: true });
    }
    return reply({ error: "Unknown action." }, 400);
  } catch (e) {
    await c.query("ROLLBACK").catch(() => {});
    return reply(
      {
        error:
          e instanceof SchedulingError
            ? e.message
            : "Unable to save scheduling changes.",
      },
      e instanceof SchedulingError ? e.status : 503,
    );
  } finally {
    await c.query("ROLLBACK").catch(() => {});
    c.release();
    await pool.end();
  }
}
