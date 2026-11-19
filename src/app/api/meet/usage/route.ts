import { meetingActor } from "@/lib/meeting-access";
import {
  transaction,
  respond,
  errorResponse,
  AccessError,
} from "@/lib/collaboration";
import { meetingEntitlement } from "@/lib/meeting-entitlements";
export const runtime = "nodejs";
export async function GET() {
  try {
    const a = await meetingActor();
    if (a.kind !== "employer" || !a.tenant)
      throw new AccessError("Employer access required", 403);
    return await transaction(async (c) =>
      respond(await meetingEntitlement(c, a.tenant!)),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
