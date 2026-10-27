import {
  actor,
  transaction,
  errorResponse,
  respond,
  AccessError,
  projectAccess,
  audit,
  text,
  id,
  ids,
  date,
  notify,
  documentAccess,
} from "@/lib/collaboration";
import {
  projects,
  tasks,
  createProject,
  createTask,
  updateTask,
  dependency,
} from "@/lib/project-service";
import { pageBounds, csv } from "@/lib/collaboration-policy";
import { textPDF } from "@/lib/simple-pdf";
export const runtime = "nodejs";
type Context = { params: Promise<{ segments?: string[] }> };
export async function GET(req: Request, ctx: Context) {
  try {
    const a = await actor(),
      s = (await ctx.params).segments || [],
      u = new URL(req.url),
      { limit, offset } = pageBounds(u);
    return await transaction(async (c) => {
      if (!s.length)
        return respond({
          canCreate:
            !a.employee ||
            Boolean(
              (
                await c.query(
                  "SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND manager_employee_id=$2 LIMIT 1",
                  [a.tenant, a.employee],
                )
              ).rowCount,
            ),
          records: await projects(
            c,
            a,
            limit,
            offset,
            text(u.searchParams.get("q"), 100),
          ),
          limit,
          offset,
        });
      if (s[0] === "my-tasks")
        return respond({
          records: await tasks(
            c,
            a,
            null,
            limit,
            offset,
            text(u.searchParams.get("q"), 100),
            "",
            !!a.employee,
            text(u.searchParams.get("status"), 30),
          ),
          limit,
          offset,
        });
      if (s[0] === "saved-views")
        return respond({
          records: (
            await c.query(
              "SELECT id,name,filters FROM collaboration_saved_views WHERE employer_id=$1 AND actor=$2 ORDER BY name LIMIT 100",
              [a.tenant, a.id],
            )
          ).rows,
        });
      const p = await projectAccess(c, a, s[0]);
      if (s[1] === "tasks" && s[2]) {
        const task = (
          await c.query(
            "SELECT * FROM project_tasks WHERE employer_id=$1 AND project_id=$2 AND id=$3",
            [a.tenant, p.id, id(s[2])],
          )
        ).rows[0];
        if (!task) throw new AccessError("Task not found", 404);
        const comments = (
          await c.query(
            "SELECT tc.id,tc.actor,COALESCE(e.first_name||' '||e.last_name,'Company administrator') author_name,tc.body,tc.mentions,tc.created_at FROM task_comments tc LEFT JOIN workforce_employees e ON tc.actor='employee:'||e.id::text AND e.employer_id=tc.employer_id WHERE tc.employer_id=$1 AND tc.task_id=$2 ORDER BY tc.created_at DESC,tc.id LIMIT $3 OFFSET $4",
            [a.tenant, task.id, limit, offset],
          )
        ).rows;
        const checklist = (
          await c.query(
            "SELECT id,title,done FROM task_checklist WHERE employer_id=$1 AND task_id=$2 LIMIT 100",
            [a.tenant, task.id],
          )
        ).rows;
        return respond({
          task,
          comments,
          checklist,
          children: (
            await c.query(
              "SELECT id,title,status FROM project_tasks WHERE employer_id=$1 AND project_id=$2 AND parent_id=$3 ORDER BY created_at LIMIT 20",
              [a.tenant, p.id, task.id],
            )
          ).rows,
          activity: (
            await c.query(
              "SELECT action,created_at FROM collaboration_audit WHERE employer_id=$1 AND resource_id=$2 ORDER BY created_at DESC LIMIT 30",
              [a.tenant, task.id],
            )
          ).rows,
          dependencies: (
            await c.query(
              "SELECT depends_on FROM task_dependencies WHERE task_id=$1",
              [task.id],
            )
          ).rows,
          attachments: (
            await c.query(
              "SELECT document_id FROM task_attachments WHERE employer_id=$1 AND task_id=$2",
              [a.tenant, task.id],
            )
          ).rows,
        });
      }
      if (s[1] === "tasks")
        return respond({
          records: await tasks(
            c,
            a,
            p.id,
            limit,
            offset,
            text(u.searchParams.get("q"), 100),
            text(u.searchParams.get("status"), 30),
          ),
          limit,
          offset,
        });
      if (s[1] === "report") {
        const rows = await tasks(c, a, p.id, 1000, 0);
        const headers = ["Task", "Status", "Assignees", "Due date", "Priority"];
        const values = rows.map((t) => [
          t.title,
          t.status,
          t.assignees.map((x: { name: string }) => x.name).join(", "),
          t.due_at,
          t.priority,
        ]);
        await audit(c, a, "project.export", p.id);
        const pdf = u.searchParams.get("format") === "pdf";
        return new Response(
          new Uint8Array(
            pdf
              ? textPDF(
                  p.name + " - tasks (first 1000)",
                  values.map((r) => r.join(" | ")),
                )
              : Buffer.from(csv(headers, values)),
          ),
          {
            headers: {
              "Content-Type": pdf
                ? "application/pdf"
                : "text/csv; charset=utf-8",
              "Content-Disposition": `attachment; filename="project-tasks.${pdf ? "pdf" : "csv"}"`,
              "Cache-Control": "private, no-store",
            },
          },
        );
      }
      const members = (
        await c.query(
          `SELECT m.employee_id id,m.role,e.first_name||' '||e.last_name name FROM project_members m JOIN workforce_employees e ON e.id=m.employee_id WHERE m.project_id=$1 ORDER BY e.first_name LIMIT 100`,
          [p.id],
        )
      ).rows;
      const report = (
        await c.query(
          "SELECT status,count(*)::int count,count(*) FILTER(WHERE due_at<NOW() AND status NOT IN ('Done','Cancelled'))::int overdue FROM project_tasks WHERE employer_id=$1 AND project_id=$2 GROUP BY status",
          [a.tenant, p.id],
        )
      ).rows;
      const workload = (
        await c.query(
          "SELECT e.id,e.first_name||' '||e.last_name name,count(*) FILTER(WHERE t.status NOT IN ('Done','Cancelled'))::int open_tasks,COALESCE(sum(t.estimate_minutes) FILTER(WHERE t.status NOT IN ('Done','Cancelled')),0)::int minutes FROM task_assignees x JOIN project_tasks t ON t.id=x.task_id JOIN workforce_employees e ON e.id=x.employee_id WHERE x.employer_id=$1 AND x.project_id=$2 GROUP BY e.id LIMIT 100",
          [a.tenant, p.id],
        )
      ).rows;
      const activity = (
        await c.query(
          "SELECT actor,action,resource_id,created_at FROM collaboration_audit WHERE employer_id=$1 AND (resource_id=$2 OR details->>'project'=$2) ORDER BY created_at DESC LIMIT 30",
          [a.tenant, p.id],
        )
      ).rows;
      return respond({
        project: {
          ...p,
          progress: Math.round(
            (100 *
              report
                .filter((x) => x.status === "Done")
                .reduce((n, x) => n + x.count, 0)) /
              Math.max(
                1,
                report
                  .filter((x) => x.status !== "Cancelled")
                  .reduce((n, x) => n + x.count, 0),
              ),
          ),
          health: report.some((x) => x.overdue > 0)
            ? "Overdue"
            : report.some((x) => x.status === "Blocked" && x.count > 0)
              ? "At risk"
              : "On track",
          overdue: report.reduce((n, x) => n + x.overdue, 0),
        },
        members,
        report,
        workload:
          !a.employee || ["Owner", "Manager"].includes(p.access_role)
            ? workload
            : [],
        activity,
        milestones: (
          await c.query(
            "SELECT * FROM project_milestones WHERE employer_id=$1 AND project_id=$2 ORDER BY due_on LIMIT 100",
            [a.tenant, p.id],
          )
        ).rows,
        rules: (
          await c.query(
            "SELECT trigger,enabled FROM project_rules WHERE project_id=$1",
            [p.id],
          )
        ).rows,
        timeTracking:
          (
            await c.query(
              "SELECT time_tracking FROM collaboration_settings WHERE employer_id=$1",
              [a.tenant],
            )
          ).rows[0]?.time_tracking || false,
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: Request, ctx: Context) {
  try {
    const a = await actor(),
      s = (await ctx.params).segments || [],
      b = await req.json();
    return await transaction(async (c) => {
      if (!s.length) return respond(await createProject(c, a, b), 201);
      if (s[0] === "saved-views") {
        await c.query(
          "INSERT INTO collaboration_saved_views(employer_id,actor,name,filters) VALUES($1,$2,$3,$4) ON CONFLICT(employer_id,actor,name) DO UPDATE SET filters=EXCLUDED.filters",
          [
            a.tenant,
            a.id,
            text(b.name, 100, true),
            JSON.stringify({
              q: text(b.q, 100),
              status: text(b.status, 30),
              view: text(b.view, 20),
            }),
          ],
        );
        return respond({ ok: true });
      }
      const p = await projectAccess(
        c,
        a,
        s[0],
        true,
        s[1] !== "tasks" || !s[2],
      );
      if (s[1] === "members") {
        await projectAccess(c, a, p.id, true, true);
        const member = id(b.employeeId);
        if (!["Owner", "Manager", "Contributor", "Viewer"].includes(b.role))
          throw new AccessError("Invalid role", 400);
        await c.query(
          "INSERT INTO project_members(employer_id,project_id,employee_id,role) VALUES($1,$2,$3,$4) ON CONFLICT(project_id,employee_id) DO UPDATE SET role=EXCLUDED.role",
          [a.tenant, p.id, member, b.role],
        );
        await audit(c, a, "project.member", p.id, { member, role: b.role });
        return respond({ ok: true });
      }
      if (s[1] === "milestones") {
        await c.query(
          "INSERT INTO project_milestones(employer_id,project_id,title,due_on) VALUES($1,$2,$3,$4)",
          [a.tenant, p.id, text(b.title, 200, true), b.dueOn],
        );
        return respond({ ok: true }, 201);
      }
      if (s[1] === "tasks" && !s[2])
        return respond(await createTask(c, a, p.id, b), 201);
      const task = id(s[2]);
      if (
        !(
          await c.query(
            "SELECT 1 FROM project_tasks WHERE employer_id=$1 AND project_id=$2 AND id=$3",
            [a.tenant, p.id, task],
          )
        ).rowCount
      )
        throw new AccessError("Task not found", 404);
      if (s[3] === "subtasks")
        return respond(
          await createTask(c, a, p.id, { ...b, parentId: task }),
          201,
        );
      if (s[3] === "dependencies") {
        await dependency(c, a, p.id, task, id(b.dependsOn));
        return respond({ ok: true });
      }
      if (s[3] === "comments") {
        const mentions = b.mentions ? ids(b.mentions, 100) : [];
        if (
          mentions.length &&
          (
            await c.query(
              "SELECT employee_id FROM project_members WHERE project_id=$1 AND employee_id=ANY($2::uuid[])",
              [p.id, mentions],
            )
          ).rowCount !== mentions.length
        )
          throw new AccessError("Mention only project members", 422);
        const row = (
          await c.query(
            "INSERT INTO task_comments(employer_id,task_id,actor,body,mentions) VALUES($1,$2,$3,$4,$5) RETURNING id",
            [a.tenant, task, a.id, text(b.body, 4000, true), mentions],
          )
        ).rows[0];
        const watchers = (
          await c.query(
            "SELECT employee_id FROM task_assignees WHERE task_id=$1",
            [task],
          )
        ).rows.map((x) => "employee:" + x.employee_id);
        await notify(
          c,
          a,
          watchers,
          "comment",
          "New task comment",
          text(b.body, 4000, true),
          "/projects/" + p.id,
          row.id,
        );
        await notify(
          c,
          a,
          mentions.map((x) => "employee:" + x),
          "mention",
          "You were mentioned",
          text(b.body, 4000, true),
          "/projects/" + p.id,
          row.id,
        );
        await audit(c, a, "task.comment", task, { project: p.id });
        return respond({ ok: true }, 201);
      }
      if (s[3] === "checklist") {
        if (b.id)
          await c.query(
            "UPDATE task_checklist SET done=$1 WHERE id=$2 AND employer_id=$3 AND task_id=$4",
            [Boolean(b.done), id(b.id), a.tenant, task],
          );
        else
          await c.query(
            "INSERT INTO task_checklist(employer_id,task_id,title) VALUES($1,$2,$3)",
            [a.tenant, task, text(b.title, 240, true)],
          );
        return respond({ ok: true });
      }
      if (s[3] === "attachments") {
        await documentAccess(c, a, id(b.documentId));
        await c.query(
          "INSERT INTO task_attachments(employer_id,task_id,document_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
          [a.tenant, task, b.documentId],
        );
        return respond({ ok: true });
      }
      if (s[3] === "time") {
        if (
          !a.employee ||
          !(
            await c.query(
              "SELECT 1 FROM collaboration_settings WHERE employer_id=$1 AND time_tracking",
              [a.tenant],
            )
          ).rowCount
        )
          throw new AccessError("Time tracking is disabled");
        if (b.action === "stop")
          await c.query(
            "UPDATE task_time_entries SET ended_at=NOW(),minutes=CEIL(EXTRACT(EPOCH FROM NOW()-started_at)/60) WHERE employee_id=$1 AND task_id=$2 AND ended_at IS NULL",
            [a.employee, task],
          );
        else {
          const minutes = b.minutes ? Number(b.minutes) : null;
          if (
            minutes !== null &&
            (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440)
          )
            throw new AccessError("Invalid time entry", 400);
          await c.query(
            "INSERT INTO task_time_entries(employer_id,task_id,employee_id,started_at,ended_at,minutes) VALUES($1,$2,$3,NOW()-COALESCE($4,0)*INTERVAL '1 minute',CASE WHEN $4::integer IS NULL THEN NULL ELSE NOW() END,$4)",
            [a.tenant, task, a.employee, minutes],
          );
        }
        return respond({ ok: true });
      }
      throw new AccessError("Unknown operation", 404);
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PATCH(req: Request, ctx: Context) {
  try {
    const a = await actor(),
      s = (await ctx.params).segments || [],
      b = await req.json();
    return await transaction(async (c) => {
      if (s[1] === "tasks" && s[2])
        return respond(await updateTask(c, a, id(s[0]), id(s[2]), b));
      const project = await projectAccess(c, a, id(s[0]), true, true);
      if (b.trigger) {
        if (!["done", "overdue", "all_done"].includes(b.trigger))
          throw new AccessError("Invalid rule", 400);
        await c.query(
          "UPDATE project_rules SET enabled=$1 WHERE project_id=$2 AND trigger=$3",
          [Boolean(b.enabled), s[0], b.trigger],
        );
        return respond({ ok: true });
      }
      if (b.timeTracking !== undefined) {
        if (a.employee) throw new AccessError("Employer access required");
        await c.query(
          "INSERT INTO collaboration_settings(employer_id,time_tracking) VALUES($1,$2) ON CONFLICT(employer_id) DO UPDATE SET time_tracking=EXCLUDED.time_tracking",
          [a.tenant, Boolean(b.timeTracking)],
        );
        return respond({ ok: true });
      }
      const status = b.status ?? project.status,
        priority = b.priority ?? project.priority;
      if (
        !["Planned", "Active", "On Hold", "Completed", "Cancelled"].includes(
          status,
        ) ||
        !["Low", "Normal", "High", "Urgent"].includes(priority)
      )
        throw new AccessError("Invalid selection", 400);
      const starts = "startsOn" in b ? date(b.startsOn) : project.starts_on,
        ends = "endsOn" in b ? date(b.endsOn) : project.ends_on;
      if (starts && ends && new Date(ends) < new Date(starts))
        throw new AccessError("End date must follow start date", 400);
      const budget =
        "budget" in b
          ? b.budget === "" || b.budget === null
            ? null
            : Number(b.budget)
          : project.budget;
      if (
        budget !== null &&
        (!Number.isFinite(Number(budget)) || Number(budget) < 0)
      )
        throw new AccessError("Invalid budget", 400);
      await c.query(
        "UPDATE projects SET name=$3,description=$4,client=$5,department=$6,starts_on=$7,ends_on=$8,status=$9,priority=$10,tags=$11,budget=$12,updated_at=NOW() WHERE id=$1 AND employer_id=$2",
        [
          s[0],
          a.tenant,
          b.name === undefined ? project.name : text(b.name, 200, true),
          b.description === undefined
            ? project.description
            : text(b.description, 10000),
          b.client === undefined ? project.client : text(b.client),
          b.department === undefined ? project.department : text(b.department),
          starts,
          ends,
          status,
          priority,
          b.tags === undefined
            ? project.tags
            : text(b.tags, 1000).split(",").filter(Boolean).slice(0, 20),
          budget,
        ],
      );
      await audit(c, a, "project.updated", s[0]);
      return respond({ ok: true });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
