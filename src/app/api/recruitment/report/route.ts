import { NextResponse } from "next/server";
import { currentEmployer, db } from "@/lib/employer-session";
import { assessmentPolicy } from "@/lib/recruitment-screening";
import { matchRequirementTerms } from "@/lib/cv-profile";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const employer = await currentEmployer();
  if (!employer)
    return NextResponse.json(
      { error: "Employer sign in required." },
      { status: 401, headers },
    );
  const params = new URL(request.url).searchParams,
    id = params.get("id");
  if (
    !id ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return NextResponse.json(
      { error: "Choose a valid application." },
      { status: 400, headers },
    );
  const pool = db();
  try {
    const r = await pool.query(
      `SELECT a.id,a.stage,a.assessment_score,a.assessment_policy,a.created_at,a.interview_completed_at,a.feedback,j.title,j.requirements,p.first_name,p.last_name,p.email,(SELECT count(*)::int FROM workforce_submissions s JOIN workforce_submissions v ON v.employer_id=s.employer_id AND v.content=s.content AND v.applicant_id<>s.applicant_id WHERE s.employer_id=j.employer_id AND s.application_id=a.id AND s.title='Application CV' AND v.title='Application CV') AS matching_cv_files FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN applicant_accounts p ON p.id=a.applicant_id WHERE a.id=$1 AND j.employer_id=$2`,
      [id, employer],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404, headers },
      );
    const a = r.rows[0],
      policy = assessmentPolicy(a.assessment_policy),
      profile = a.assessment_policy?.profile || null,
      report = {
        candidate: a.first_name + " " + a.last_name,
        email: a.email,
        role: a.title,
        stage: a.stage,
        profile,
        verification:
          "Self-reported; identity and qualifications require authorised checks.",
        generalScore: a.assessment_policy?.general_score ?? null,
        score: a.assessment_score,
        threshold: policy?.threshold ?? null,
        qualified:
          policy && a.assessment_score !== null
            ? a.assessment_score >= policy.threshold
            : null,
        humanReview: policy?.review || null,
        keywordHints: profile
          ? matchRequirementTerms(a.requirements, profile)
          : null,
        duplicateCVReview:
          a.matching_cv_files > 0
            ? "Identical CV file found on another application in this organisation. Review manually; this is not proof of a duplicate identity."
            : "No identical CV flagged within this organisation.",
        feedback: a.feedback,
      };
    if (params.get("format") !== "xlsx")
      return NextResponse.json(report, { headers });
    const ExcelJS = (await import("exceljs")).default,
      workbook = new ExcelJS.Workbook(),
      sheet = workbook.addWorksheet("Screening report");
    workbook.creator = "Aerotech";
    sheet.columns = [
      { header: "Field", key: "field", width: 30 },
      { header: "Value", key: "value", width: 85 },
    ];
    for (const [field, value] of [
      ["Candidate", report.candidate],
      ["Email", report.email],
      ["Role", report.role],
      ["Stage", report.stage],
      ["Verification", report.verification],
      ["Skills", profile?.skills || "Not recorded"],
      ["Experience", profile?.experience || "Not recorded"],
      ["Education", profile?.education || "Not recorded"],
      ["General skills (%)", report.generalScore ?? "Not recorded"],
      ["Job-specific score (%)", report.score ?? "Pending"],
      ["Qualifying score (%)", report.threshold ?? "Legacy manual review"],
      [
        "Scoring criteria",
        "Percentage correct; equally weighted. Ordered assessments retain the questions and threshold fixed at submission.",
      ],
      ["Human review", policy?.review?.reason || "No exception recorded"],
      [
        "Matched terms",
        report.keywordHints?.matched.join(", ") || "Not recorded",
      ],
      [
        "Terms not found",
        report.keywordHints?.notFound.join(", ") || "Not recorded",
      ],
      ["Keyword method", report.keywordHints?.method || "Not recorded"],
      ["Duplicate CV check", report.duplicateCVReview],
      ["Shared feedback", report.feedback || "Not recorded"],
    ])
      sheet.addRow({ field, value });
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF123A73" },
    };
    sheet.eachRow((row) => {
      row.alignment = { vertical: "top", wrapText: true };
    });
    return new NextResponse(new Uint8Array(await workbook.xlsx.writeBuffer()), {
      headers: {
        ...headers,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="aerotech-screening-report.xlsx"',
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to produce screening report." },
      { status: 503, headers },
    );
  } finally {
    await pool.end();
  }
}
