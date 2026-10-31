import { NextResponse } from "next/server";
import { currentEmployer, db } from "@/lib/employer-session";
import { currentApplicant } from "@/lib/applicant-session";
import { uuid } from "@/lib/collaboration-policy";
import { interviewCalendar } from "@/lib/recruitment-calendar";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const employer = await currentEmployer(),
    applicant = employer ? null : await currentApplicant();
  if (!employer && !applicant)
    return NextResponse.json(
      { error: "Sign in required." },
      { status: 401, headers },
    );
  const id = new URL(request.url).searchParams.get("applicationId");
  if (!uuid(id))
    return NextResponse.json(
      { error: "Choose an interview." },
      { status: 400, headers },
    );
  const pool = db();
  try {
    const r = await pool.query(
      "SELECT a.id,a.interview_at,a.interview_revision,a.interview_room_id,j.title,m.duration_minutes,m.status FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN meet_rooms m ON m.id=a.interview_room_id AND m.employer_id=j.employer_id WHERE a.id=$1 AND ($2::uuid IS NOT NULL AND j.employer_id=$2 OR $3::uuid IS NOT NULL AND a.applicant_id=$3)",
      [id, employer, applicant],
    );
    if (!r.rowCount || !r.rows[0].interview_at)
      return NextResponse.json(
        { error: "Interview not found." },
        { status: 404, headers },
      );
    const a = r.rows[0],
      start = new Date(a.interview_at),
      url = new URL(
        (employer ? "/dashboard/employer" : "/applicant") +
          "/meet/" +
          a.interview_room_id,
        process.env.APP_BASE_URL || "https://aerotechhr.app",
      ).toString(),
      file = interviewCalendar({
        id: a.id,
        revision: a.interview_revision,
        title: a.title,
        start,
        end: new Date(start.getTime() + a.duration_minutes * 60000),
        url,
        cancelled: a.status === "cancelled",
      });
    return new NextResponse(file, {
      headers: {
        ...headers,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="aerotech-interview.ics"',
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to produce calendar file." },
      { status: 503, headers },
    );
  } finally {
    await pool.end();
  }
}
