import {guestEmail,validGuestInvitation} from "@/lib/meeting-guest";
import { NextResponse } from "next/server";
import { createHmac, createSign } from "node:crypto";
import { currentApplicant } from "@/lib/applicant-session";
import { currentEmployee } from "@/lib/employee-auth";
import { currentEmployer, db } from "@/lib/employer-session";
import { joinWindow } from "@/lib/collaboration-policy";
export const runtime = "nodejs";
const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ error: "Invalid meeting" }, { status: 400 });
  const employee = await currentEmployee();
  const applicant = employee ? null : await currentApplicant();
  let employerId = employee?.employer_id || (await currentEmployer());
  if (applicant && !employerId) {
    const p = db();
    try {
      employerId = (
        await p.query(
          "SELECT j.employer_id FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id WHERE a.interview_room_id=$1 AND a.applicant_id=$2 AND a.stage='interview'",
          [id, applicant],
        )
      ).rows[0]?.employer_id;
    } finally {
      await p.end();
    }
  }
  let guest:{employer_id:string;email:string;join_generation:number;[key:string]:unknown}|undefined;
  const guestToken=_request.headers.get("authorization")?.replace(/^Bearer /,"")||"";
  if(!employee&&!applicant&&!employerId&&guestToken){const email=guestEmail(guestToken);if(email){const p=db();try{const row=(await p.query("SELECT m.*,g.email FROM meet_rooms m JOIN meeting_guests g ON g.room_id=m.id AND g.employer_id=m.employer_id WHERE m.id=$1 AND g.email=$2",[id,email])).rows[0];if(row&&validGuestInvitation(id,email,row.join_generation,guestToken)){guest=row;employerId=row.employer_id}}finally{await p.end()}}}
  if (!employerId)
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const pool = db();
  try {
    const access = guest ? {rowCount:1,rows:[guest]} : applicant
      ? await pool.query(
          "SELECT m.* FROM meet_rooms m JOIN ats_applications a ON a.interview_room_id=m.id JOIN ats_jobs j ON j.id=a.job_id AND j.employer_id=m.employer_id WHERE m.id=$1 AND a.applicant_id=$2 AND a.stage='interview'",
          [id, applicant],
        )
      : employee
        ? await pool.query(
            "SELECT m.* FROM meet_rooms m JOIN meet_participants p ON p.room_id=m.id AND p.employer_id=m.employer_id WHERE m.id=$1 AND m.employer_id=$2 AND p.employee_id=$3",
            [id, employerId, employee.id],
          )
        : await pool.query(
            "SELECT * FROM meet_rooms WHERE id=$1 AND employer_id=$2",
            [id, employerId],
          );
    if (!access.rowCount)
      return NextResponse.json(
        { error: "You are not invited to this meeting" },
        { status: 403 },
      );
    const window = joinWindow(access.rows[0]);
    if (window.state !== "open")
      return NextResponse.json(
        {
          state: window.state,
          error:
            window.state === "expired"
              ? "This meeting link has expired"
              : "This meeting opens 15 minutes before its start",
        },
        {
          status: window.state === "expired" ? 410 : 425,
          headers: { "Cache-Control": "private, no-store" },
        },
      );
    if (new URL(_request.url).searchParams.get("status") === "1")
      return NextResponse.json(
        { state: "open", expiresAt: window.expiresAt },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    const managed = Boolean(process.env.JAAS_APP_ID);
    const domain = managed
      ? "8x8.vc"
      : process.env.JITSI_DOMAIN?.trim()
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");
    const appId = process.env.JITSI_APP_ID;
    const secret = process.env.JITSI_APP_SECRET;
    if (
      !domain ||
      (!managed && (!appId || !secret || secret.length < 32)) ||
      (managed &&
        (!process.env.JAAS_KEY_ID || !process.env.JAAS_PRIVATE_KEY)) ||
      !/^[a-z0-9.-]+(?::\d+)?$/i.test(domain)
    )
      return NextResponse.json(
        { error: "Video conferencing server has not been configured" },
        { status: 503 },
      );
    const room =
      "aerotech-" +
      employerId.replaceAll("-", "") +
      "-" +
      id.replaceAll("-", "") +
      "-g" +
      access.rows[0].join_generation;
    const now = Math.floor(Date.now() / 1000);
    let token: string;
    let roomName = room;
    if (managed) {
      const jaasId = process.env.JAAS_APP_ID!;
      const kid = process.env.JAAS_KEY_ID!;
      if (
        !/^vpaas-magic-cookie-[a-zA-Z0-9-]+$/.test(jaasId) ||
        !kid.startsWith(jaasId + "/")
      )
        return NextResponse.json(
          { error: "Invalid managed meeting configuration" },
          { status: 503 },
        );
      const privateKey = process.env.JAAS_PRIVATE_KEY!.replace(/\\n/g, "\n");
      roomName = jaasId + "/" + room;
      const header = encode({ alg: "RS256", typ: "JWT", kid });
      const payload = encode({
        aud: "jitsi",
        iss: "chat",
        sub: jaasId,
        room,
        iat: now,
        nbf: now - 5,
        exp: Math.min(now + 60, Math.floor(window.expiresAt / 1000)),
        context: {
          user: {
            id: employee?.id || applicant || (guest ? "guest:"+guest.email : employerId),
            name: guest ? "Invited guest" : employee
              ? employee.first_name + " " + employee.last_name
              : applicant
                ? "Candidate"
                : "Employer host",
            email: guest?.email || employee?.email || "",
            moderator: employee || applicant || guest ? "false" : "true",
          },
          features: {
            recording: false,
            livestreaming: false,
            transcription: false,
          },
        },
      });
      const body = header + "." + payload;
      const signature = createSign("RSA-SHA256");
      signature.update(body);
      signature.end();
      try {
        token = body + "." + signature.sign(privateKey).toString("base64url");
      } catch {
        return NextResponse.json(
          { error: "Invalid managed meeting signing key" },
          { status: 503 },
        );
      }
    } else {
      const header = encode({ alg: "HS256", typ: "JWT" });
      const payload = encode({
        aud: appId,
        iss: appId,
        sub: process.env.JITSI_JWT_SUB || "meet.jitsi",
        room,
        iat: now,
        nbf: now - 5,
        exp: Math.min(now + 60, Math.floor(window.expiresAt / 1000)),
        context: {
          user: {
            name: guest ? "Invited guest" : employee
              ? employee.first_name + " " + employee.last_name
              : applicant
                ? "Candidate"
                : "Employer host",
            email: guest?.email || employee?.email || undefined,
            moderator: !employee && !applicant && !guest,
          },
        },
      });
      const body = header + "." + payload;
      token =
        body +
        "." +
        createHmac("sha256", secret!).update(body).digest("base64url");
    }
    if (employee)
      await pool.query(
        "UPDATE meet_participants SET joined_at=COALESCE(joined_at,NOW()) WHERE room_id=$1 AND employee_id=$2",
        [id, employee.id],
      );
    if(guest)await pool.query("UPDATE meeting_guests SET joined_at=COALESCE(joined_at,NOW()) WHERE room_id=$1 AND email=$2",[id,guest.email]);
    return NextResponse.json(
      {
        domain,
        room: roomName,
        token,
        title: access.rows[0].title,
        expiresAt: window.expiresAt,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Meeting access unavailable" },
      { status: 503 },
    );
  } finally {
    await pool.end();
  }
}
