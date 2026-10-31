import {
  actor,
  transaction,
  errorResponse,
  respond,
  AccessError,
  ids,
  text,
} from "@/lib/collaboration";
import { resolveGroups, type GroupRef } from "@/lib/meeting-service";
export async function POST(req: Request) {
  try {
    const a = await actor();
    if (a.employee) throw new AccessError("Employer access required");
    const b = await req.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return respond({error:'Request body must be a JSON object.'},400);

    return await transaction(async (c) => {
      const exclude = b.excludeIds ? ids(b.excludeIds) : [],
        m = await resolveGroups(
          c,
          a,
          Array.isArray(b.groups) ? (b.groups as GroupRef[]) : [],
          exclude,
        );
      for (const id of ids(b.employeeIds || []))
        if (!exclude.includes(id)) m.set(id, true);
      const r = await c.query(
        "SELECT id,first_name||' '||last_name name,email,department FROM workforce_employees WHERE employer_id=$1 AND id=ANY($2::uuid[]) AND (first_name||' '||last_name||' '||email||' '||department) ILIKE $3 ORDER BY first_name,id LIMIT 21 OFFSET $4",
        [
          a.tenant,
          [...m.keys()],
          "%" + text(b.q, 100) + "%",
          Math.max(0, Number(b.offset) || 0),
        ],
      );
      return respond({
        records: r.rows.slice(0, 20),
        hasMore: r.rows.length > 20,
        total: m.size,
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
