import { transaction, errorResponse } from "@/lib/collaboration";
import { meetingActor, accessibleMeeting } from "@/lib/meeting-access";
import { calendarFile } from "@/lib/meeting-policy";
export const runtime = "nodejs";
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const a = await meetingActor(),
      { id } = await ctx.params;
    return await transaction(async (c) => {
      const { meeting: m } = await accessibleMeeting(c, a, id);
      return new Response(calendarFile(m, new URL(req.url).origin), {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'attachment; filename="aerotech-meeting.ics"',
          "Cache-Control": "private, no-store",
        },
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
