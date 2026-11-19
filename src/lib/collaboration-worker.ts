import { reconcileMeetingUsage } from "./meeting-metering";
import { requireBuiltIn } from "./meeting-entitlements";
import { deliverInterviewUpdate } from "./interview-delivery";
import { deliverEmployeeActivation } from "./activation-delivery";
import {
  activeMeeting,
  activeCollaborationNotice,
} from "./notification-policy";
import type { PoolClient } from "pg";
import { db } from "./employer-session";
import { transaction, enqueue, notify, type Actor } from "./collaboration";
import { decryptDocument } from "./document-crypto";
import { createTask } from "./project-service";
import { terminateConference } from "./meeting-service";
import { meetingInvitation } from "./meeting-invitations";
import { calendarFile } from "./meeting-policy";
import { randomUUID } from "node:crypto";
type Job = {
  id: string;
  employer_id: string;
  kind: string;
  payload: Record<string, unknown>;
  attempts: number;
  created_at: Date | string;
};
async function email(to: string, subject: string, body: string, key: string) {
  if (!process.env.RESEND_API_KEY || !process.env.INVITATION_FROM_EMAIL)
    throw Error("Email delivery is not configured");
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    body: JSON.stringify({
      from: process.env.INVITATION_FROM_EMAIL,
      to: [to],
      subject,
      text: body,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw Error("Email provider rejected delivery");
}
async function recipientEmail(
  c: PoolClient,
  tenant: string,
  recipient: string,
) {
  const [kind, id] = recipient.split(":");
  const r =
    kind === "employee"
      ? await c.query(
          "SELECT email FROM workforce_employees WHERE employer_id=$1 AND id=$2",
          [tenant, id],
        )
      : await c.query(
          "SELECT company_email AS email FROM employer_accounts WHERE id=$1",
          [tenant],
        );
  return r.rows[0]?.email as string | undefined;
}
export async function sweep(c: PoolClient) {
  await c.query(
    "UPDATE collaboration_jobs SET status='dead',lease_until=NULL,last_error='Worker lease expired after final attempt' WHERE status='running' AND lease_until<NOW() AND attempts>=5",
  );
  const ended = await c.query(
    "UPDATE meet_rooms SET status='ended',revoked_at=COALESCE(revoked_at,NOW()),join_generation=join_generation+1 WHERE status='scheduled' AND starts_at+duration_minutes*INTERVAL '1 minute'+INTERVAL '5 minutes'<=NOW() RETURNING id,employer_id,join_generation-1 generation",
  );
  for (const meeting of ended.rows)
    await enqueue(
      c,
      meeting.employer_id,
      "meeting_terminate",
      "terminate:" + meeting.id + ":" + meeting.generation,
      { meeting: meeting.id, generation: meeting.generation },
    );
  await c.query(
    "UPDATE ats_jobs SET status='expired' WHERE status='published' AND expires_at<=NOW()",
  );
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT p.employer_id,k,'meeting-invite:'||p.id||':'||m.join_generation||':'||k,jsonb_build_object('meeting',m.id,'participant',p.id,'generation',m.join_generation,'event','invite') FROM meeting_participants p JOIN meet_rooms m ON m.id=p.meeting_id CROSS JOIN unnest(ARRAY['meeting_delivery','meeting_notice']) AS k WHERE m.status='scheduled' AND m.revoked_at IS NULL AND m.starts_at+m.duration_minutes*INTERVAL '1 minute'>NOW() ON CONFLICT DO NOTHING`,
  );
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT p.employer_id,k,'meeting-soon:'||p.id||':'||m.join_generation||':'||k,jsonb_build_object('meeting',m.id,'participant',p.id,'generation',m.join_generation,'event','reminder') FROM meeting_participants p JOIN meet_rooms m ON m.id=p.meeting_id CROSS JOIN unnest(ARRAY['meeting_delivery','meeting_notice']) AS k WHERE m.status='scheduled' AND m.revoked_at IS NULL AND p.status<>'rejected' AND m.starts_at BETWEEN NOW() AND NOW()+INTERVAL '15 minutes' ON CONFLICT DO NOTHING`,
  );

  for (const [label, window] of [
    ["day", 1440],
    ["soon", 30],
  ] as const)
    await c.query(
      `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT j.employer_id,'interview_update','interview-reminder:'||a.id||':'||a.interview_revision||':'||$1,jsonb_build_object('application',a.id,'revision',a.interview_revision,'reminder',TRUE) FROM ats_applications a JOIN ats_jobs j ON j.id=a.job_id JOIN meet_rooms m ON m.id=a.interview_room_id AND m.employer_id=j.employer_id WHERE a.stage='interview' AND a.interview_completed_at IS NULL AND m.status='scheduled' AND m.revoked_at IS NULL AND a.interview_at>NOW() AND a.interview_at<=NOW()+$2::int*INTERVAL '1 minute' AND ($1<>'day' OR a.interview_at>NOW()+INTERVAL '30 minutes') AND m.created_at<NOW()-CASE WHEN $1='day' THEN INTERVAL '30 minutes' ELSE INTERVAL '5 minutes' END ON CONFLICT DO NOTHING`,
      [label, window],
    );
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload,run_at) SELECT employer_id,'task_overdue','overdue:'||id||':'||revision,jsonb_build_object('task',id,'revision',revision),NOW() FROM project_tasks WHERE status NOT IN ('Done','Cancelled') AND due_at<NOW() ON CONFLICT DO NOTHING`,
  );
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload,run_at) SELECT employer_id,'task_due','due:'||id||':'||revision,jsonb_build_object('task',id,'revision',revision),NOW() FROM project_tasks WHERE status NOT IN ('Done','Cancelled') AND due_at BETWEEN NOW() AND NOW()+INTERVAL '24 hours' ON CONFLICT DO NOTHING`,
  );
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT employer_id,'meeting_recur','meeting-recur:'||id,jsonb_build_object('meeting',id) FROM meet_rooms WHERE status='ended' AND recurrence IN ('daily','weekly') ON CONFLICT DO NOTHING`,
  );

  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT d.employer_id,'notification','doc-expiry:'||d.id||':'||d.expiry_date||':'||CURRENT_DATE,jsonb_build_object('recipient','employer:'||d.employer_id,'event','document','title','Document expiry reminder','body',d.title||' expires '||d.expiry_date,'href','/dashboard/employer/documents') FROM library_documents d WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE+30 ON CONFLICT DO NOTHING`,
  );
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT a.employer_id,'notification','ack-reminder:'||a.id||':'||CURRENT_DATE,jsonb_build_object('recipient','employee:'||a.employee_id,'event','document','title','Acknowledgement reminder','body',d.title,'href','/employee/documents') FROM document_acknowledgements a JOIN library_documents d ON d.id=a.document_id WHERE a.status IN ('Sent','Viewed') AND a.updated_at<NOW()-INTERVAL '3 days' AND a.version=d.current_version ON CONFLICT DO NOTHING`,
  );
  await c.query(
    `INSERT INTO collaboration_jobs(employer_id,kind,dedupe_key,payload) SELECT DISTINCT employer_id,'digest','digest:'||actor||':'||CURRENT_DATE,jsonb_build_object('recipient',actor,'period',digest) FROM notification_preferences WHERE email AND (digest='daily' OR digest='weekly' AND EXTRACT(ISODOW FROM CURRENT_DATE)=1) ON CONFLICT DO NOTHING`,
  );
  await c.query(
    `UPDATE library_document_versions v SET encrypted_content=''::bytea FROM library_documents d WHERE v.document_id=d.id AND d.retention_until<CURRENT_DATE AND octet_length(v.encrypted_content)>0`,
  );
}
async function perform(c: PoolClient, job: Job) {
  const a: Actor = {
      tenant: job.employer_id,
      id: "employer:" + job.employer_id,
      employee: null,
      department: null,
      role: "employer",
    },
    b = job.payload;
  if (job.kind === "interview_update") {
    await deliverInterviewUpdate(c, job);
    return;
  }
  if (job.kind === "employee_activation") {
    await deliverEmployeeActivation(c, job);
    return;
  }
  if (job.kind === "guest_invite") return; // Retired anonymous invitation flow; canonical deliveries below.
  if (job.kind === "meeting_delivery" || job.kind === "meeting_notice") {
    const row = (
      await c.query(
        "SELECT m.*,p.id AS participant_id,p.user_id,p.principal_type,p.invited_email,COALESCE(e.email,x.email,h.company_email,p.invited_email) AS recipient_email FROM meeting_participants p JOIN meet_rooms m ON m.id=p.meeting_id AND m.employer_id=p.employer_id LEFT JOIN workforce_employees e ON p.principal_type='employee' AND e.id=p.user_id AND e.employer_id=p.employer_id LEFT JOIN applicant_accounts x ON p.principal_type='applicant' AND x.id=p.user_id LEFT JOIN employer_accounts h ON p.principal_type='employer' AND h.id=p.user_id WHERE p.id=$1 AND p.meeting_id=$2 AND m.employer_id=$3",
        [b.participant, b.meeting, a.tenant],
      )
    ).rows[0];
    if (
      !row ||
      row.join_generation !== Number(b.generation) ||
      !row.recipient_email
    )
      return;
    if (
      b.event === "cancel"
        ? row.status !== "cancelled"
        : row.status !== "scheduled" ||
          row.revoked_at ||
          new Date(row.starts_at).getTime() + row.duration_minutes * 60000 <=
            Date.now()
    )
      return;
    const origin = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin || !origin.startsWith("https://"))
      throw Error("Meeting invitation origin is not configured");
    const portal =
      row.principal_type === "employee"
        ? "/employee"
        : row.principal_type === "employer"
          ? "/dashboard/employer"
          : "/applicant";
    const href = portal + "/meet/" + row.id;
    const link =
      row.principal_type === "email"
        ? origin +
          "/guest/meet/" +
          row.id +
          "#invite=" +
          (await meetingInvitation(row.participant_id, row.join_generation))
        : origin + href;
    const time = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "long",
      timeZone: row.timezone,
    }).format(new Date(row.starts_at));
    const subject =
      (b.event === "cancel"
        ? "Meeting cancelled: "
        : b.event === "reminder"
          ? "Meeting starts soon: "
          : "Meeting invitation: ") + row.title;
    const body =
      row.title +
      "\n" +
      time +
      " (" +
      row.timezone +
      ")\n" +
      row.duration_minutes +
      " minutes · " +
      row.type +
      "\n\n" +
      link +
      "\nSign into your invited Aerotech account. No Daily account is needed. Recording and transcription are off.";
    if (job.kind === "meeting_notice") {
      if (row.user_id)
        await c.query(
          "INSERT INTO collaboration_notifications(employer_id,actor,event,title,body,href,source_key,in_app,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,TRUE,$8) ON CONFLICT DO NOTHING",
          [
            a.tenant,
            row.principal_type + ":" + row.user_id,
            b.event === "cancel" ? "status" : "meeting",
            subject,
            time + " · " + row.timezone,
            href,
            job.id,
            b.event === "cancel"
              ? new Date(Date.now() + 7 * 86400000)
              : new Date(
                  new Date(row.starts_at).getTime() +
                    row.duration_minutes * 60000,
                ),
          ],
        );
      return;
    }
    // ATS already delivers interview invitations/reminders with its own calendar revision.
    const interview = (
      await c.query(
        "SELECT 1 FROM ats_applications WHERE interview_room_id=$1 LIMIT 1",
        [row.id],
      )
    ).rowCount;
    if (
      interview &&
      b.event !== "cancel" &&
      ["employer", "applicant"].includes(row.principal_type)
    )
      return;
    if (!process.env.RESEND_API_KEY || !process.env.INVITATION_FROM_EMAIL)
      throw Error("Meeting email is not configured");
    const delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        "Idempotency-Key": job.id,
      },
      body: JSON.stringify({
        from: process.env.INVITATION_FROM_EMAIL,
        to: [row.recipient_email],
        subject,
        text: body,
        attachments: [
          {
            filename: "aerotech-meeting.ics",
            content: Buffer.from(calendarFile(row, origin, link)).toString(
              "base64",
            ),
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!delivery.ok) throw Error("Meeting invitation delivery failed");
    return;
  }
  if (job.kind === "meeting_terminate") {
    await terminateConference(
      a.tenant,
      String(b.meeting),
      Number(b.generation),
    );
    return;
  }
  if (job.kind === "notification") {
    const recipient = String(b.recipient),
      event = String(b.event),
      pref = (
        await c.query(
          "SELECT * FROM notification_preferences WHERE employer_id=$1 AND actor=$2 AND event=$3",
          [a.tenant, recipient, event],
        )
      ).rows[0];
    let expiresAt: Date | null = null;
    if (event === "meeting") {
      const room = String(b.href || "").match(/\/meet\/([0-9a-f-]{36})$/i)?.[1];
      if (!room) return;
      const live = await c.query(
        `SELECT m.starts_at+m.duration_minutes*INTERVAL '1 minute' AS expires_at FROM meet_rooms m WHERE m.employer_id=$1 AND m.id=$2 AND (${activeMeeting})`,
        [a.tenant, room],
      );
      if (!live.rows.length) return;
      expiresAt = live.rows[0].expires_at;
    }
    await c.query(
      "INSERT INTO collaboration_notifications(employer_id,actor,event,title,body,href,source_key,in_app,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING",
      [
        a.tenant,
        recipient,
        event,
        b.title,
        b.body,
        b.href,
        job.id,
        pref?.in_app !== false,
        expiresAt,
      ],
    );
    if (pref?.email !== false && (!pref || pref.digest === "none"))
      await enqueue(c, a.tenant, "email", "email:" + job.id, {
        recipient,
        event,
        subject: b.title,
        body: b.body,
        href: b.href,
      });
    return;
  }
  if (job.kind === "email") {
    if (b.event === "meeting") {
      const room = String(b.href || "").match(/\/meet\/([0-9a-f-]{36})$/i)?.[1];
      if (
        !room ||
        !(
          await c.query(
            `SELECT 1 FROM meet_rooms m WHERE m.employer_id=$1 AND m.id=$2 AND (${activeMeeting})`,
            [a.tenant, room],
          )
        ).rows.length
      )
        return;
    }
    const pref = (
      await c.query(
        "SELECT email,digest FROM notification_preferences WHERE employer_id=$1 AND actor=$2 AND event=$3",
        [a.tenant, b.recipient, String(b.event || "all")],
      )
    ).rows[0];
    if (pref?.email === false || (pref && pref.digest !== "none")) return;
    const to = await recipientEmail(c, a.tenant, String(b.recipient));
    if (!to) return;
    const origin =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://aerotech-psi.vercel.app";
    const href = String(b.href || "");
    if (!/^\/(employee|dashboard\/employer)\//.test(href))
      throw Error("Unsafe notification link");
    await email(
      to,
      String(b.subject),
      String(b.body) + "\n\n" + origin + href,
      job.id,
    );
    return;
  }
  if (job.kind === "digest") {
    const recipient = String(b.recipient),
      prefs = (
        await c.query(
          "SELECT event,email,digest FROM notification_preferences WHERE employer_id=$1 AND actor=$2",
          [a.tenant, recipient],
        )
      ).rows;
    const enabled = prefs
      .filter((p) => p.email && p.digest === b.period)
      .map((p) => p.event);
    if (!enabled.length) return;
    const records = (
      await c.query(
        `SELECT n.title,n.body FROM collaboration_notifications n WHERE n.employer_id=$1 AND n.actor=$2 AND n.event=ANY($3::text[]) AND n.created_at>NOW()-$4*INTERVAL '1 day' AND (${activeCollaborationNotice}) ORDER BY n.created_at DESC LIMIT 100`,
        [a.tenant, recipient, enabled, b.period === "weekly" ? 7 : 1],
      )
    ).rows;
    if (!records.length) return;
    const to = await recipientEmail(c, a.tenant, recipient);
    if (to)
      await email(
        to,
        "Aerotech " + b.period + " digest",
        records.map((r) => r.title + ": " + r.body).join("\n"),
        job.id,
      );
    return;
  }
  if (job.kind === "virus_scan") {
    if (
      !process.env.DOCUMENT_SCAN_URL?.startsWith("https://") ||
      !process.env.DOCUMENT_SCAN_TOKEN
    )
      throw Error("Virus scanner is not configured; file remains quarantined");
    const v = (
      await c.query(
        "SELECT * FROM library_document_versions WHERE employer_id=$1 AND id=$2",
        [a.tenant, b.versionId],
      )
    ).rows[0];
    if (!v || v.scan_status !== "pending") return;
    const bytes = decryptDocument(
      v.encrypted_content,
      a.tenant + ":" + v.document_id + ":" + v.version,
    );
    const r = await fetch(process.env.DOCUMENT_SCAN_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.DOCUMENT_SCAN_TOKEN,
        "Content-Type": "application/octet-stream",
      },
      body: new Uint8Array(bytes),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw Error("Virus scan failed");
    const scan = await r.json();
    if (!["clean", "infected"].includes(scan.status))
      throw Error("Invalid scan result");
    await c.query(
      "UPDATE library_document_versions SET scan_status=$1 WHERE id=$2",
      [scan.status, v.id],
    );
    return;
  }
  if (job.kind === "task_due" || job.kind === "task_overdue") {
    const t = (
      await c.query(
        "SELECT t.*,p.owner_employee_id FROM project_tasks t JOIN projects p ON p.id=t.project_id WHERE t.employer_id=$1 AND t.id=$2",
        [a.tenant, b.task],
      )
    ).rows[0];
    if (
      !t ||
      t.revision !== Number(b.revision) ||
      ["Done", "Cancelled"].includes(t.status)
    )
      return;
    const overdue = job.kind === "task_overdue";
    const assignees = (
      await c.query("SELECT employee_id FROM task_assignees WHERE task_id=$1", [
        t.id,
      ])
    ).rows;
    const recipients = assignees.map((x) => "employee:" + x.employee_id);
    if (
      overdue &&
      (
        await c.query(
          "SELECT 1 FROM project_rules WHERE project_id=$1 AND trigger='overdue' AND enabled",
          [t.project_id],
        )
      ).rowCount
    ) {
      const managers = (
        await c.query(
          "SELECT employee_id FROM project_members WHERE project_id=$1 AND role IN ('Owner','Manager')",
          [t.project_id],
        )
      ).rows;
      recipients.push(
        ...managers.map((x) => "employee:" + x.employee_id),
        "employer:" + a.tenant,
      );
    }
    await notify(
      c,
      a,
      recipients,
      overdue ? "overdue" : "due",
      "Task " + (overdue ? "overdue" : "due soon"),
      t.title,
      "/projects/" + t.project_id,
      job.id,
    );
    return;
  }
  if (job.kind === "task_recur") {
    const t = (
      await c.query(
        "SELECT * FROM project_tasks WHERE employer_id=$1 AND id=$2",
        [a.tenant, b.task],
      )
    ).rows[0];
    if (!t || !t.recurrence_days || t.status === "Cancelled") return;
    const assignees = (
      await c.query("SELECT employee_id FROM task_assignees WHERE task_id=$1", [
        t.id,
      ])
    ).rows.map((x) => x.employee_id);
    await createTask(c, a, t.project_id, {
      title: t.title,
      description: t.description,
      assignees,
      priority: t.priority,
      recurrenceDays: t.recurrence_days,
      dueAt: t.due_at
        ? new Date(
            new Date(t.due_at).getTime() + t.recurrence_days * 86400000,
          ).toISOString()
        : null,
    });
    await c.query(
      "UPDATE projects SET status='Active' WHERE id=$1 AND status='Completed'",
      [t.project_id],
    );
    return;
  }
  if (job.kind === "meeting_recur") {
    const m = (
      await c.query(
        "SELECT * FROM meet_rooms WHERE employer_id=$1 AND id=$2 AND status='ended' AND recurrence<>'none'",
        [a.tenant, b.meeting],
      )
    ).rows[0];
    if (!m) return;
    if (m.mode === "built_in") await requireBuiltIn(c, a.tenant);
    const id = randomUUID(),
      step = m.recurrence === "daily" ? 1 : 7;
    let date = new Date(new Date(m.starts_at).getTime() + step * 86400000);
    while (date.getTime() < Date.now())
      date = new Date(date.getTime() + step * 86400000);
    await c.query(
      "INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes,agenda,timezone,recurrence,location) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        id,
        a.tenant,
        m.title,
        date,
        m.duration_minutes,
        m.agenda,
        m.timezone,
        m.recurrence,
        m.location,
      ],
    );
    await c.query(
      "UPDATE meet_rooms SET mode=$1,external_url=$2,type=$3 WHERE id=$4",
      [m.mode, m.external_url, m.type, id],
    );
    await c.query(
      "INSERT INTO meet_participants(employer_id,room_id,employee_id,required) SELECT employer_id,$1,employee_id,required FROM meet_participants WHERE room_id=$2",
      [id, m.id],
    );
    await c.query(
      "INSERT INTO meeting_guests(employer_id,room_id,email,required) SELECT employer_id,$1,email,required FROM meeting_guests WHERE room_id=$2",
      [id, m.id],
    );
    return;
  }
  throw Error("Unknown job kind");
}
export async function runCollaborationJobs() {
  await transaction(sweep);
  let meteringFailed = 0;
  try {
    await transaction(reconcileMeetingUsage);
  } catch {
    meteringFailed = 1;
  }
  const p = db();
  let processed = 0,
    failed = 0;
  const started = Date.now();
  try {
    for (let i = 0; i < 200 && Date.now() - started < 50000; i++) {
      const claim = await p.query(
        `WITH candidate AS (SELECT id FROM collaboration_jobs WHERE (status='pending' AND run_at<=NOW() OR status='running' AND lease_until<NOW()) AND attempts<5 AND (kind<>'virus_scan' OR $1::boolean) ORDER BY run_at FOR UPDATE SKIP LOCKED LIMIT 1) UPDATE collaboration_jobs j SET status='running',attempts=attempts+1,lease_until=NOW()+INTERVAL '2 minutes' FROM candidate WHERE j.id=candidate.id RETURNING j.*`,
        [
          Boolean(
            process.env.DOCUMENT_SCAN_URL?.startsWith("https://") &&
            process.env.DOCUMENT_SCAN_TOKEN,
          ),
        ],
      );
      const job = claim.rows[0] as Job | undefined;
      if (!job) break;
      try {
        await transaction(async (c) => {
          await perform(c, job);
          await c.query(
            "UPDATE collaboration_jobs SET status='done',lease_until=NULL WHERE id=$1",
            [job.id],
          );
        });
        processed++;
      } catch (e) {
        failed++;
        await p.query(
          "UPDATE collaboration_jobs SET status=CASE WHEN attempts>=5 THEN 'dead' ELSE 'pending' END,run_at=NOW()+LEAST(3600,POWER(2,attempts)::integer*30)*INTERVAL '1 second',lease_until=NULL,last_error=$2 WHERE id=$1",
          [job.id, e instanceof Error ? e.message.slice(0, 160) : "Job failed"],
        );
      }
    }
    return { processed, failed: failed + meteringFailed };
  } finally {
    await p.end();
  }
}
