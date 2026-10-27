import { timingSafeEqual } from "node:crypto";
import { runCollaborationJobs } from "@/lib/collaboration-worker";
import { respond, errorResponse } from "@/lib/collaboration";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(req: Request) {
  const expected = Buffer.from(process.env.CRON_SECRET || ""),
    actual = Buffer.from(
      req.headers.get("authorization")?.replace(/^Bearer /, "") || "",
    );
  if (
    !expected.length ||
    actual.length !== expected.length ||
    !timingSafeEqual(expected, actual)
  )
    return respond({ error: "Unauthorized" }, 401);
  try {
    return respond(await runCollaborationJobs());
  } catch (e) {
    return errorResponse(e);
  }
}
