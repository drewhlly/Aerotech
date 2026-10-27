import type { PoolClient } from "pg";
import {
  AccessError,
  projectAccess,
  audit,
  notify,
  enqueue,
  text,
  id,
  ids,
  date,
  type Actor,
} from "./collaboration";
const statuses = ["To Do", "In Progress", "Blocked", "Done", "Cancelled"];
const priorities = ["Low", "Normal", "High", "Urgent"];
function choice(v: unknown, values: string[], fallback: string) {
  if (v === undefined) return fallback;
  if (typeof v !== "string" || !values.includes(v))
    throw new AccessError("Invalid selection", 400);
  return v;
}
export async function projects(
  c: PoolClient,
  a: Actor,
  limit: number,
  offset: number,
  q = "",
) {
  return (
    await c.query(
      `WITH counts AS (SELECT project_id,COUNT(*) FILTER(WHERE status<>'Cancelled')::int total,COUNT(*) FILTER(WHERE status='Done')::int done,COUNT(*) FILTER(WHERE status NOT IN ('Done','Cancelled') AND due_at<NOW())::int overdue,COUNT(*) FILTER(WHERE status='Blocked')::int blocked FROM project_tasks WHERE employer_id=$1 GROUP BY project_id)
 SELECT p.*,COALESCE(round(100.0*x.done/NULLIF(x.total,0)),0)::int progress,COALESCE(x.overdue,0) overdue,
 CASE WHEN COALESCE(x.overdue,0)>0 OR p.ends_on<CURRENT_DATE AND COALESCE(x.done,0)<COALESCE(x.total,0) THEN 'Overdue' WHEN COALESCE(x.blocked,0)>0 THEN 'At risk' ELSE 'On track' END health,
 CASE WHEN $2::uuid IS NULL THEN 'Owner' ELSE m.role END access_role FROM projects p LEFT JOIN project_members m ON m.project_id=p.id AND m.employee_id=$2 LEFT JOIN counts x ON x.project_id=p.id
 WHERE p.employer_id=$1 AND ($2::uuid IS NULL OR m.employee_id IS NOT NULL) AND (p.name ILIKE $3 OR p.department ILIKE $3) ORDER BY p.created_at DESC,p.id LIMIT $4 OFFSET $5`,
      [a.tenant, a.employee, "%" + q + "%", limit, offset],
    )
  ).rows;
}
export async function createProject(
  c: PoolClient,
  a: Actor,
  b: Record<string, unknown>,
) {
  if (
    a.employee &&
    !(
      await c.query(
        "SELECT 1 FROM workforce_employees WHERE employer_id=$1 AND manager_employee_id=$2 LIMIT 1",
        [a.tenant, a.employee],
      )
    ).rowCount
  )
    throw new AccessError(
      "Only employers and team managers may create projects",
    );
  const owner =
    a.employee || (b.ownerEmployeeId && id(b.ownerEmployeeId)) || null;
  const r = await c.query(
    `INSERT INTO projects(employer_id,name,description,client,department,owner_employee_id,starts_on,ends_on,status,priority,tags,budget) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      a.tenant,
      text(b.name, 200, true),
      text(b.description, 10000),
      text(b.client),
      text(b.department),
      owner,
      date(b.startsOn),
      date(b.endsOn),
      choice(
        b.status,
        ["Planned", "Active", "On Hold", "Completed", "Cancelled"],
        "Planned",
      ),
      choice(b.priority, priorities, "Normal"),
      text(b.tags, 1000).split(",").filter(Boolean).slice(0, 20),
      b.budget === undefined || b.budget === "" ? null : Number(b.budget),
    ],
  );
  const p = r.rows[0];
  if (owner)
    await c.query(
      "INSERT INTO project_members(employer_id,project_id,employee_id,role) VALUES($1,$2,$3,'Owner')",
      [a.tenant, p.id, owner],
    );
  for (const trigger of ["done", "overdue", "all_done"])
    await c.query(
      "INSERT INTO project_rules(employer_id,project_id,trigger) VALUES($1,$2,$3)",
      [a.tenant, p.id, trigger],
    );
  await audit(c, a, "project.created", p.id);
  return p;
}
export async function tasks(
  c: PoolClient,
  a: Actor,
  p: string | null,
  limit: number,
  offset: number,
  q = "",
  status = "",
  mine = false,
  period = "",
) {
  if (p) await projectAccess(c, a, p);
  if (status && !statuses.includes(status))
    throw new AccessError("Invalid task status", 400);
  return (
    await c.query(
      `SELECT t.*,COALESCE(x.assignees,'[]') assignees,p.name project_name,CASE WHEN $3::uuid IS NULL THEN 'Owner' ELSE (SELECT role FROM project_members pm WHERE pm.project_id=t.project_id AND pm.employee_id=$3) END access_role FROM project_tasks t JOIN projects p ON p.id=t.project_id
 LEFT JOIN LATERAL(SELECT jsonb_agg(jsonb_build_object('id',e.id,'name',e.first_name||' '||e.last_name)) assignees FROM task_assignees x JOIN workforce_employees e ON e.id=x.employee_id WHERE x.task_id=t.id) x ON TRUE
 WHERE t.employer_id=$1 AND ($2::uuid IS NULL OR t.project_id=$2) AND ($3::uuid IS NULL OR EXISTS(SELECT 1 FROM project_members m WHERE m.project_id=t.project_id AND m.employee_id=$3)) AND ($4::boolean=FALSE OR EXISTS(SELECT 1 FROM task_assignees x WHERE x.task_id=t.id AND x.employee_id=$3)) AND t.title ILIKE $5 AND ($6='' OR t.status=$6) AND ($9='' OR $9='Today' AND (t.due_at AT TIME ZONE 'Africa/Lagos')::date=(NOW() AT TIME ZONE 'Africa/Lagos')::date OR $9='Overdue' AND t.due_at<NOW() AND t.status NOT IN ('Done','Cancelled') OR $9='Upcoming' AND t.due_at>NOW() AND t.status NOT IN ('Done','Cancelled')) ORDER BY t.due_at NULLS LAST,t.created_at,t.id LIMIT $7 OFFSET $8`,
      [
        a.tenant,
        p,
        a.employee,
        mine,
        "%" + q + "%",
        status,
        limit,
        offset,
        period,
      ],
    )
  ).rows;
}
export async function createTask(
  c: PoolClient,
  a: Actor,
  project: string,
  b: Record<string, unknown>,
) {
  await projectAccess(c, a, project, true, true);
  const members = b.assignees ? ids(b.assignees, 100) : [];
  if (
    members.length &&
    (
      await c.query(
        "SELECT employee_id FROM project_members WHERE employer_id=$1 AND project_id=$2 AND employee_id=ANY($3::uuid[])",
        [a.tenant, project, members],
      )
    ).rowCount !== members.length
  )
    throw new AccessError("Assign only project members", 422);
  const recurrence = b.recurrenceDays ? Number(b.recurrenceDays) : null;
  if (
    recurrence &&
    (!Number.isInteger(recurrence) || recurrence < 1 || recurrence > 365)
  )
    throw new AccessError("Invalid recurrence", 400);
  const r = await c.query(
    `INSERT INTO project_tasks(employer_id,project_id,title,description,due_at,starts_at,priority,labels,estimate_minutes,parent_id,recurrence_days,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      a.tenant,
      project,
      text(b.title, 240, true),
      text(b.description, 10000),
      date(b.dueAt),
      date(b.startsAt),
      choice(b.priority, priorities, "Normal"),
      text(b.labels, 1000).split(",").filter(Boolean).slice(0, 20),
      b.estimateMinutes ? Number(b.estimateMinutes) : null,
      b.parentId ? id(b.parentId) : null,
      recurrence,
      a.id,
    ],
  );
  const task = r.rows[0];
  for (const m of members)
    await c.query(
      "INSERT INTO task_assignees(employer_id,project_id,task_id,employee_id) VALUES($1,$2,$3,$4)",
      [a.tenant, project, task.id, m],
    );
  await notify(
    c,
    a,
    members.map((x) => "employee:" + x),
    "assignment",
    "Task assigned",
    task.title,
    "/projects/" + project,
    task.id,
  );
  if (task.due_at) {
    await enqueue(
      c,
      a.tenant,
      "task_due",
      "due:" + task.id + ":1",
      { task: task.id, revision: 1 },
      new Date(new Date(task.due_at).getTime() - 24 * 3600000),
    );
    await enqueue(
      c,
      a.tenant,
      "task_overdue",
      "overdue:" + task.id + ":1",
      { task: task.id, revision: 1 },
      new Date(task.due_at),
    );
  }
  await c.query(
    "UPDATE projects SET status='Active' WHERE id=$1 AND status='Completed'",
    [project],
  );
  await audit(c, a, "task.created", task.id, { project });
  return task;
}
export async function updateTask(
  c: PoolClient,
  a: Actor,
  project: string,
  task: string,
  b: Record<string, unknown>,
) {
  const p = await projectAccess(c, a, project, true);
  const r = await c.query(
    "SELECT * FROM project_tasks WHERE employer_id=$1 AND project_id=$2 AND id=$3 FOR UPDATE",
    [a.tenant, project, id(task)],
  );
  const old = r.rows[0];
  if (!old) throw new AccessError("Task not found", 404);
  if (b.revision !== undefined && Number(b.revision) !== old.revision)
    throw new AccessError("This task changed. Refresh before saving.", 409);
  const status = choice(b.status, statuses, old.status);
  if (
    status === "Done" &&
    (
      await c.query(
        "SELECT 1 FROM task_dependencies d JOIN project_tasks t ON t.id=d.depends_on WHERE d.task_id=$1 AND t.status NOT IN ('Done','Cancelled') LIMIT 1",
        [task],
      )
    ).rowCount
  )
    throw new AccessError("Complete dependencies first", 409);
  if ("assignees" in b) {
    await projectAccess(c, a, project, true, true);
    const members = ids(b.assignees, 100);
    if (
      members.length &&
      (
        await c.query(
          "SELECT employee_id FROM project_members WHERE project_id=$1 AND employee_id=ANY($2::uuid[])",
          [project, members],
        )
      ).rowCount !== members.length
    )
      throw new AccessError("Assign only project members", 422);
    await c.query("DELETE FROM task_assignees WHERE task_id=$1", [task]);
    for (const m of members)
      await c.query(
        "INSERT INTO task_assignees(employer_id,project_id,task_id,employee_id) VALUES($1,$2,$3,$4)",
        [a.tenant, project, task, m],
      );
    await notify(
      c,
      a,
      members.map((x) => "employee:" + x),
      "assignment",
      "Task assigned",
      old.title,
      "/projects/" + project,
      task + ":" + old.revision,
    );
  }
  const next = (
    await c.query(
      `UPDATE project_tasks SET title=$4,description=$5,status=$6,priority=$7,due_at=$8,revision=revision+1,updated_at=NOW() WHERE employer_id=$1 AND project_id=$2 AND id=$3 RETURNING *`,
      [
        a.tenant,
        project,
        task,
        b.title === undefined ? old.title : text(b.title, 240, true),
        b.description === undefined
          ? old.description
          : text(b.description, 10000),
        status,
        choice(b.priority, priorities, old.priority),
        b.dueAt === undefined ? old.due_at : date(b.dueAt),
      ],
    )
  ).rows[0];
  const members = (
    await c.query("SELECT employee_id FROM task_assignees WHERE task_id=$1", [
      task,
    ])
  ).rows.map((x) => "employee:" + x.employee_id);
  if (old.status !== status) {
    await notify(
      c,
      a,
      members,
      "status",
      "Task status changed",
      next.title + ": " + status,
      "/projects/" + project,
      task + ":" + next.revision,
    );
    if (
      status === "Done" &&
      (
        await c.query(
          "SELECT 1 FROM project_rules WHERE project_id=$1 AND trigger='done' AND enabled",
          [project],
        )
      ).rowCount
    )
      await notify(
        c,
        a,
        [
          p.owner_employee_id
            ? "employee:" + p.owner_employee_id
            : "employer:" + a.tenant,
        ],
        "status",
        "Task completed",
        next.title,
        "/projects/" + project,
        task + ":done:" + next.revision,
      );
    if (status === "Done" && old.status !== "Done" && old.recurrence_days)
      await enqueue(
        c,
        a.tenant,
        "task_recur",
        "recur:" + task + ":" + next.revision,
        { task },
        new Date(Date.now() + old.recurrence_days * 86400000),
      );
  }
  if (next.due_at && !["Done", "Cancelled"].includes(status)) {
    await enqueue(
      c,
      a.tenant,
      "task_due",
      "due:" + task + ":" + next.revision,
      { task, revision: next.revision },
      new Date(new Date(next.due_at).getTime() - 86400000),
    );
    await enqueue(
      c,
      a.tenant,
      "task_overdue",
      "overdue:" + task + ":" + next.revision,
      { task, revision: next.revision },
      new Date(next.due_at),
    );
  }
  await c.query(
    `UPDATE projects SET status='Completed',updated_at=NOW() WHERE id=$1 AND status IN ('Active','Planned') AND EXISTS(SELECT 1 FROM project_rules WHERE project_id=$1 AND trigger='all_done' AND enabled) AND EXISTS(SELECT 1 FROM project_tasks WHERE project_id=$1 AND status='Done') AND NOT EXISTS(SELECT 1 FROM project_tasks WHERE project_id=$1 AND status NOT IN ('Done','Cancelled'))`,
    [project],
  );
  await audit(c, a, "task.updated", task, {
    project,
    status,
    revision: next.revision,
  });
  return next;
}
export async function dependency(
  c: PoolClient,
  a: Actor,
  project: string,
  task: string,
  target: string,
) {
  await projectAccess(c, a, project, true, true);
  id(task);
  id(target);
  const cycle = await c.query(
    `WITH RECURSIVE chain(id) AS (SELECT $2::uuid UNION SELECT d.depends_on FROM task_dependencies d JOIN chain x ON x.id=d.task_id WHERE d.employer_id=$3 AND d.project_id=$4) SELECT 1 FROM chain WHERE id=$1`,
    [task, target, a.tenant, project],
  );
  if (cycle.rowCount)
    throw new AccessError("Dependencies cannot form a cycle", 409);
  await c.query(
    "INSERT INTO task_dependencies(employer_id,project_id,task_id,depends_on) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",
    [a.tenant, project, task, target],
  );
  await audit(c, a, "task.dependency", task, { project, target });
}
