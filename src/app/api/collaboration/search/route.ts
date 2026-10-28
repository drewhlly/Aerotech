import {
  actor,
  transaction,
  errorResponse,
  respond,
  text,
} from "@/lib/collaboration";
export async function GET(req: Request) {
  try {
    const a = await actor(),
      u = new URL(req.url),
      q = "%" + text(u.searchParams.get("q"), 100) + "%",
      base = a.role === "employer" ? "/dashboard/employer" : "/employee";
    return await transaction(async (c) => {
      const projects = (
        await c.query(
          `SELECT p.id,p.name title,'project' kind FROM projects p WHERE p.employer_id=$1 AND p.name ILIKE $2 AND ($3::uuid IS NULL OR EXISTS(SELECT 1 FROM project_members m WHERE m.project_id=p.id AND m.employee_id=$3)) ORDER BY p.name LIMIT 5`,
          [a.tenant, q, a.employee],
        )
      ).rows.map((r) => ({ ...r, href: base + "/projects/" + r.id }));
      const tasks = (
        await c.query(
          `SELECT t.id,t.title,t.project_id,'task' kind FROM project_tasks t WHERE t.employer_id=$1 AND t.title ILIKE $2 AND ($3::uuid IS NULL OR EXISTS(SELECT 1 FROM project_members m WHERE m.project_id=t.project_id AND m.employee_id=$3)) ORDER BY t.title LIMIT 5`,
          [a.tenant, q, a.employee],
        )
      ).rows.map((r) => ({ ...r, href: base + "/projects/" + r.project_id }));
      const documents = (
        await c.query(
          `SELECT d.id,d.title,'document' kind FROM library_documents d WHERE d.employer_id=$1 AND d.title ILIKE $2 AND (d.retention_until IS NULL OR d.retention_until>=CURRENT_DATE) AND ($3::uuid IS NULL OR d.owner=$4 OR d.visibility='company' OR d.visibility='department' AND d.department=$5 OR EXISTS(SELECT 1 FROM document_grants g WHERE g.document_id=d.id AND g.employee_id=$3)) ORDER BY d.title LIMIT 5`,
          [a.tenant, q, a.employee, a.id, a.department],
        )
      ).rows.map((r) => ({ ...r, href: base + "/documents" }));
      let people: object[] = [],
        jobs: object[] = [];
      if (!a.employee) {
        people = (
          await c.query(
            "SELECT id,first_name||' '||last_name title,'person' kind FROM workforce_employees WHERE employer_id=$1 AND (first_name||' '||last_name) ILIKE $2 LIMIT 5",
            [a.tenant, q],
          )
        ).rows.map((r) => ({ ...r, href: base + "/employees/" + r.id }));
        jobs = (
          await c.query(
            "SELECT id,title,'job' kind FROM ats_jobs WHERE employer_id=$1 AND title ILIKE $2 LIMIT 5",
            [a.tenant, q],
          )
        ).rows.map((r) => ({ ...r, href: base + "/recruitment/jobs/" + r.id }));
      }
      return respond({
        records: [...projects, ...tasks, ...documents, ...people, ...jobs],
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
