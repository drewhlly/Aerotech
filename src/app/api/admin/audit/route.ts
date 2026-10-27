import { superAdmin } from "@/lib/super-admin";
import { db } from "@/lib/employer-session";
import { respond, errorResponse } from "@/lib/collaboration";
import { pageBounds } from "@/lib/collaboration-policy";
export async function GET(req: Request) {
  try {
    if (!(await superAdmin()))
      return respond({ error: "Admin access required" }, 403);
    const u = new URL(req.url),
      { limit, offset } = pageBounds(u),
      p = db();
    try {
      return respond({
        records: (
          await p.query(
            "SELECT id,employer_id,actor,action,resource_id,details,created_at FROM collaboration_audit WHERE ($1='' OR action ILIKE $1) AND ($2='' OR employer_id::text=$2) ORDER BY created_at DESC,id DESC LIMIT $3 OFFSET $4",
            [
              u.searchParams.get("action")
                ? "%" + u.searchParams.get("action") + "%"
                : "",
              u.searchParams.get("company") || "",
              limit,
              offset,
            ],
          )
        ).rows,
      });
    } finally {
      await p.end();
    }
  } catch (e) {
    return errorResponse(e);
  }
}
