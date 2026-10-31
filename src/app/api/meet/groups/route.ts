import {
  actor,
  transaction,
  errorResponse,
  respond,
  AccessError,
  text,
  ids,
} from "@/lib/collaboration";
export async function GET(req: Request) {
  try {
    const a = await actor();
    if (a.employee) throw new AccessError("Employer access required");
    const u = new URL(req.url),
      q = "%" + text(u.searchParams.get("q"), 100) + "%";
    return await transaction(async (c) =>
      respond({
        records: (
          await c.query(
            `WITH groups AS (
 SELECT 'department' kind,department value,department name,count(*)::int count FROM workforce_employees WHERE employer_id=$1 AND employment_status IN ('active','probation','on_leave') GROUP BY department
 UNION ALL SELECT 'location',location,location,count(*)::int FROM workforce_employees WHERE employer_id=$1 AND location IS NOT NULL AND employment_status IN ('active','probation','on_leave') GROUP BY location
 UNION ALL SELECT 'role',job_title,job_title,count(*)::int FROM workforce_employees WHERE employer_id=$1 AND employment_status IN ('active','probation','on_leave') GROUP BY job_title
 UNION ALL SELECT 'project',p.id::text,p.name,count(m.employee_id)::int FROM projects p JOIN project_members m ON m.project_id=p.id WHERE p.employer_id=$1 GROUP BY p.id
 UNION ALL SELECT 'saved',g.id::text,g.name,cardinality(g.members) FROM meeting_invite_groups g WHERE employer_id=$1
 ) SELECT * FROM groups WHERE name ILIKE $2 ORDER BY kind,name LIMIT 20 OFFSET $3`,
            [
              a.tenant,
              q,
              Math.max(0, Number(u.searchParams.get("offset")) || 0),
            ],
          )
        ).rows,
      }),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: Request) {
  try {
    const a = await actor();
    if (a.employee) throw new AccessError("Employer access required");
    const b = await req.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return respond({error:'Request body must be a JSON object.'},400);

    return await transaction(async (c) => {
      const members = ids(b.members);
      if (
        (
          await c.query(
            "SELECT id FROM workforce_employees WHERE employer_id=$1 AND id=ANY($2::uuid[])",
            [a.tenant, members],
          )
        ).rowCount !== members.length
      )
        throw new AccessError("Invalid group members", 422);
      return respond(
        (
          await c.query(
            "INSERT INTO meeting_invite_groups(employer_id,name,members) VALUES($1,$2,$3) RETURNING id",
            [a.tenant, text(b.name, 120, true), members],
          )
        ).rows[0],
        201,
      );
    });
  } catch (e) {
    return errorResponse(e);
  }
}
