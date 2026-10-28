"use client";
import {useFeedback} from "@/components/use-feedback";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import ProjectFiles from "./project-files";
import TaskCalendar from "./task-calendar";
import ResourcePicker from "./resource-picker";
import { WorkspaceRoleContext } from "./workspace-shell";
import CollaborationDialog from "./collaboration-dialog";
import PeoplePicker, { type Person } from "./people-picker";
import { api } from "./collaboration-client";
import { formatDate } from "@/lib/i18n";
type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  health: string;
  overdue: number;
  ends_on: string | null;
  access_role: string;
  client: string;
  department: string;
  starts_on: string | null;
  tags: string[];
  budget: number | null;
};
type Task = {
  access_role: string;
  id: string;
  title: string;
  status: string;
  priority: string;
  due_at: string | null;
  starts_at: string | null;
  revision: number;
  project_id: string;
  project_name: string;
  assignees: { id: string; name: string }[];
};
type Details = {
  project: Project;
  members: { id: string; name: string; role: string }[];
  report: { status: string; count: number }[];
  workload: { id: string; name: string; open_tasks: number; minutes: number }[];
  activity: { action: string; actor: string; created_at: string }[];
  milestones: {
    id: string;
    title: string;
    due_on: string;
    completed: boolean;
  }[];
  rules: { trigger: string; enabled: boolean }[];
  timeTracking: boolean;
};
const states = ["To Do", "In Progress", "Blocked", "Done", "Cancelled"];
export default function ProjectsWorkspace({
  projectId,
  myTasks = false,
}: {
  projectId?: string;
  myTasks?: boolean;
}) {
  const role = useContext(WorkspaceRoleContext),
    base = role === "employer" ? "/dashboard/employer" : "/employee";
  const [projects, setProjects] = useState<Project[]>([]),
    [tasks, setTasks] = useState<Task[]>([]),
    [canCreate, setCanCreate] = useState(role === "employer"),
    [details, setDetails] = useState<Details | null>(null),
    [q, setQ] = useState(""),
    [filter, setFilter] = useState(""),
    [offset, setOffset] = useState(0),
    [view, setView] = useState("List"),
    [sort, setSort] = useState("due"),
    [groupBy, setGroupBy] = useState<"" | "status" | "priority">(""),
    [selected, setSelected] = useState<string[]>([]),
    [modal, setModal] = useState(""),
    [task, setTask] = useState<Task | null>(null),
    [people, setPeople] = useState<Person[]>([]),
    [message, setMessage] = useFeedback(),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [saved, setSaved] = useState<
      {
        id: string;
        name: string;
        filters: { q: string; status: string; view: string };
      }[]
    >([]);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        q,
        status: filter,
        offset: String(offset),
        limit: "50",
      });
      if (projectId) {
        const [d, t] = await Promise.all([
          api<Details>("/api/projects/" + projectId),
          api<{ records: Task[] }>(
            "/api/projects/" + projectId + "/tasks?" + query,
          ),
        ]);
        setDetails(d);
        setTasks(t.records);
      } else if (myTasks)
        setTasks(
          (await api<{ records: Task[] }>("/api/projects/my-tasks?" + query))
            .records,
        );
      else {
        const result = await api<{ records: Project[]; canCreate: boolean }>(
          "/api/projects?" + query,
        );
        setProjects(result.records);
        setCanCreate(result.canCreate);
      }
      setSaved(
        (await api<{ records: typeof saved }>("/api/projects/saved-views"))
          .records,
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [projectId, myTasks, q, filter, offset, setMessage]);
  useEffect(() => {
    const t = setTimeout(() => void refresh(), 200);
    return () => clearTimeout(t);
  }, [refresh]);
  const manager =
      role === "employer" ||
      ["Owner", "Manager"].includes(details?.project.access_role || ""),
    write = manager || details?.project.access_role === "Contributor";
  const canWriteTask = (t: Task) =>
    myTasks
      ? ["Owner", "Manager", "Contributor"].includes(t.access_role)
      : !!write;
  async function mutate(url: string, method: string, body: unknown) {
    setBusy(true);
    try {
      await api(url, method, body);
      setMessage("Saved.");
      await refresh();
      return true;
    } catch (e) {
      setMessage((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    let ok = false;
    if (modal === "project" || modal === "edit")
      ok = await mutate(
        "/api/projects" + (modal === "edit" ? "/" + projectId : ""),
        modal === "edit" ? "PATCH" : "POST",
        f,
      );
    if (modal === "task")
      ok = await mutate("/api/projects/" + projectId + "/tasks", "POST", {
        ...f,
        dueAt: f.dueAt ? new Date(String(f.dueAt)).toISOString() : null,
        assignees: people.map((p) => p.id),
      });
    if (modal === "member")
      ok = await mutate("/api/projects/" + projectId + "/members", "POST", {
        employeeId: people[0]?.id,
        role: f.role,
      });
    if (modal === "milestone")
      ok = await mutate(
        "/api/projects/" + projectId + "/milestones",
        "POST",
        f,
      );
    if (ok) {
      setModal("");
      setPeople([]);
    }
  }
  const displayed = tasks.toSorted(
    (a, b) =>
      (groupBy ? a[groupBy].localeCompare(b[groupBy]) : 0) ||
      (sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "status"
          ? a.status.localeCompare(b.status)
          : (a.due_at || "z").localeCompare(b.due_at || "z")),
  );
  const metrics = details?.project;
  return (
    <div className="space-y-6">
      <section className="aero-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {myTasks ? "My Tasks" : details?.project.name || "Projects"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {details?.project.description ||
                "Plan work, follow progress and collaborate within your company."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="aero-button border" href={base + "/projects"}>
              Projects
            </Link>
            <Link className="aero-button border" href={base + "/tasks"}>
              My Tasks
            </Link>
            {!myTasks && (!projectId ? canCreate : manager) && (
              <button
                className="aero-button bg-blue-700 text-white"
                onClick={() => setModal(projectId ? "task" : "project")}
              >
                {projectId ? "New task" : "New project"}
              </button>
            )}
          </div>
        </div>
      </section>
      {message && (
        <p role="status" className="aero-card">
          {message}
        </p>
      )}
      {loading && <p role="status">Loading work…</p>}
      {details&&projectId&&<ProjectFiles projectId={projectId} base={base}/>}
      {details && (
        <section className="aero-card space-y-4">
          <div className="flex flex-wrap gap-5">
            <p>
              Status: <b>{details.project.status}</b>
            </p>
            <p>
              Health: <b>{metrics?.health}</b>
            </p>
            <p>Task progress: {metrics?.progress}%</p>
            <p>Overdue tasks: {metrics?.overdue}</p>
          </div>
          <progress
            className="h-3 w-full"
            max={100}
            value={
              (details.report.reduce(
                (n, x) => n + (x.status === "Done" ? x.count : 0),
                0,
              ) *
                100) /
              Math.max(
                1,
                details.report
                  .filter((x) => x.status !== "Cancelled")
                  .reduce((n, x) => n + x.count, 0),
              )
            }
            aria-label="Project task completion"
          />
          {manager && (
            <div className="flex flex-wrap gap-2">
              <label className="text-sm">
                Project status
                <select
                  value={details.project.status}
                  className="aero-input"
                  onChange={(e) =>
                    void mutate("/api/projects/" + projectId, "PATCH", {
                      status: e.target.value,
                    })
                  }
                >
                  {[
                    "Planned",
                    "Active",
                    "On Hold",
                    "Completed",
                    "Cancelled",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <button
                className="aero-button border"
                onClick={() => setModal("edit")}
              >
                Edit project
              </button>
              <button
                className="aero-button border"
                onClick={() => setModal("member")}
              >
                Add member / role
              </button>
              <button
                className="aero-button border"
                onClick={() => setModal("milestone")}
              >
                Add milestone
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {details.members.map((m) => (
              <span
                className="rounded-full bg-blue-50 px-3 py-2 text-sm"
                key={m.id}
              >
                {m.name} · {m.role}
              </span>
            ))}
          </div>
          <h2 className="font-semibold">Milestones</h2>
          <ul className="space-y-2">
            {details.milestones.map((m) => (
              <li key={m.id}>
                {m.title} · {formatDate(m.due_on)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="aero-card">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            Search
            <input
              className="aero-input"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOffset(0);
              }}
            />
          </label>
          {(projectId || myTasks) && (
            <>
              <label className="text-sm">
                Status / period
                <select
                  className="aero-input"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setOffset(0);
                  }}
                >
                  <option value="">All</option>
                  {(myTasks ? ["Today", "Upcoming", "Overdue"] : states).map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="text-sm">
                View
                <select
                  className="aero-input"
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                >
                  {["List", "Kanban", "Calendar", "Timeline"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Sort
                <select
                  className="aero-input"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="due">Due date</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                </select>
              </label>
              <label className="text-sm">
                Group by
                <select
                  className="aero-input"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
                >
                  <option value="">No grouping</option>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                </select>
              </label>
              <button
                className="aero-button border"
                onClick={() => {
                  const name = window.prompt("Name this saved filter");
                  if (name)
                    void mutate("/api/projects/saved-views", "POST", {
                      name,
                      q,
                      status: filter,
                      view,
                    });
                }}
              >
                Save filter
              </button>
              <label className="text-sm">
                Saved filters
                <select
                  className="aero-input"
                  defaultValue=""
                  onChange={(e) => {
                    const f = saved.find(
                      (v) => v.id === e.target.value,
                    )?.filters;
                    if (f) {
                      setQ(f.q);
                      setFilter(f.status);
                      setView(f.view);
                    }
                  }}
                >
                  <option value="">Select</option>
                  {saved.map((v) => (
                    <option value={v.id} key={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
        {!projectId && !myTasks ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <Link
                href={base + "/projects/" + p.id}
                key={p.id}
                className="rounded-xl border p-4 hover:border-blue-600"
              >
                <h2 className="font-bold">{p.name}</h2>
                <p className="mt-2 text-sm">
                  {p.status} · {p.health} · {p.overdue} overdue
                </p>
                <progress
                  aria-label={p.name + " completion"}
                  value={p.progress}
                  max={100}
                  className="mt-4 w-full"
                />
                <span className="text-sm">{p.progress}% complete</span>
              </Link>
            ))}
            {!projects.length && !loading && (
              <p>No projects yet. Ask a project owner to add you.</p>
            )}
          </div>
        ) : (
          <div className="mt-5">
            {manager && projectId && selected.length > 0 && (
              <div className="mb-4 flex gap-3">
                <span>{selected.length} selected</span>
                <button
                  disabled={busy}
                  className="aero-button border"
                  onClick={async () => {
                    for (const t of tasks.filter((x) =>
                      selected.includes(x.id),
                    ))
                      await mutate(
                        "/api/projects/" + projectId + "/tasks/" + t.id,
                        "PATCH",
                        { status: "Done", revision: t.revision },
                      );
                    setSelected([]);
                  }}
                >
                  Mark selected Done
                </button>
              </div>
            )}
            {view === "Kanban" ? (
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                {states.map((status) => (
                  <section
                    key={status}
                    aria-label={status}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const t = tasks.find(
                        (t) => t.id === e.dataTransfer.getData("text/plain"),
                      );
                      if (t && canWriteTask(t))
                        void mutate(
                          "/api/projects/" + t.project_id + "/tasks/" + t.id,
                          "PATCH",
                          { status, revision: t.revision },
                        );
                    }}
                    className="min-h-40 rounded-xl bg-slate-50 p-3"
                  >
                    <h2 className="mb-3 font-semibold">{status}</h2>
                    {displayed
                      .filter((t) => t.status === status)
                      .map((t) => (
                        <article
                          draggable={canWriteTask(t)}
                          onDragStart={(e) =>
                            e.dataTransfer.setData("text/plain", t.id)
                          }
                          key={t.id}
                          className="mb-3 rounded-xl border bg-white p-3"
                        >
                          <button
                            onClick={() => setTask(t)}
                            className="min-h-11 text-left font-semibold"
                          >
                            {t.title}
                          </button>
                          {canWriteTask(t) && (
                            <label className="block text-xs">
                              Move task
                              <select
                                aria-label={"Move " + t.title}
                                className="aero-input mt-1"
                                value={t.status}
                                onChange={(e) =>
                                  void mutate(
                                    "/api/projects/" +
                                      t.project_id +
                                      "/tasks/" +
                                      t.id,
                                    "PATCH",
                                    {
                                      status: e.target.value,
                                      revision: t.revision,
                                    },
                                  )
                                }
                              >
                                {states.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </select>
                            </label>
                          )}
                        </article>
                      ))}
                  </section>
                ))}
              </div>
            ) : view === "Calendar" || view === "Timeline" ? (
              <TaskCalendar
                tasks={displayed}
                timeline={view === "Timeline"}
                onOpen={setTask}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Tasks on this page</caption>
                  <thead>
                    <tr>
                      {[
                        "Select",
                        "Task",
                        "Status",
                        "Assignees",
                        "Due date",
                        "Priority",
                      ].map((s) => (
                        <th className="border-b p-3" scope="col" key={s}>
                          {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((t, i) => (
                      <Fragment key={t.id}>
                        {groupBy &&
                          (i === 0 ||
                            displayed[i - 1][groupBy] !== t[groupBy]) && (
                            <tr>
                              <th
                                colSpan={6}
                                scope="colgroup"
                                className="border-y bg-slate-50 p-3"
                              >
                                {t[groupBy]}
                              </th>
                            </tr>
                          )}
                        <tr>
                          <td className="p-3">
                            <input
                              aria-label={"Select " + t.title}
                              type="checkbox"
                              checked={selected.includes(t.id)}
                              onChange={(e) =>
                                setSelected((v) =>
                                  e.target.checked
                                    ? [...v, t.id]
                                    : v.filter((x) => x !== t.id),
                                )
                              }
                            />
                          </td>
                          <td className="p-3">
                            <button
                              className="min-h-11 text-left font-semibold text-blue-800"
                              onClick={() => setTask(t)}
                            >
                              {t.title}
                            </button>
                            {myTasks && (
                              <Link
                                className="block text-xs text-blue-800"
                                href={base + "/projects/" + t.project_id}
                              >
                                {t.project_name}
                              </Link>
                            )}
                          </td>
                          <td className="p-3">{t.status}</td>
                          <td className="p-3">
                            {t.assignees.map((p) => p.name).join(", ") ||
                              "Unassigned"}
                          </td>
                          <td className="p-3">
                            {t.due_at ? formatDate(t.due_at) : "—"}
                          </td>
                          <td className="p-3">{t.priority}</td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!displayed.length && !loading && (
              <p className="p-4">No tasks match this view.</p>
            )}
          </div>
        )}
        <div className="mt-5 flex gap-3">
          <button
            className="aero-button border"
            disabled={!offset}
            onClick={() => setOffset((n) => Math.max(0, n - 50))}
          >
            Previous
          </button>
          <button
            className="aero-button border"
            disabled={(projectId || myTasks ? tasks : projects).length < 50}
            onClick={() => setOffset((n) => n + 50)}
          >
            Next page
          </button>
        </div>
      </section>
      {details && (
        <section className="aero-card space-y-4">
          <h2 className="text-lg font-bold">Reports & activity</h2>
          <div className="flex flex-wrap gap-3">
            {details.report.map((r) => (
              <p key={r.status}>
                {r.status}: <b>{r.count}</b>
              </p>
            ))}
          </div>
          {manager && (
            <>
              <h3 className="font-semibold">Team workload</h3>
              <ul>
                {details.workload.map((w) => (
                  <li key={w.id} className="py-1 text-sm">
                    {w.name}: {w.open_tasks} open tasks · {w.minutes} estimated
                    minutes
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="flex gap-3">
            {["csv", "pdf"].map((format) => (
              <a
                className="aero-button border"
                key={format}
                href={"/api/projects/" + projectId + "/report?format=" + format}
              >
                Export {format.toUpperCase()}
              </a>
            ))}
          </div>
          {manager && (
            <div>
              <h3 className="font-semibold">Automation rules</h3>
              {details.rules.map((r) => (
                <label
                  className="mr-4 inline-flex gap-2 py-3 text-sm"
                  key={r.trigger}
                >
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) =>
                      void mutate("/api/projects/" + projectId, "PATCH", {
                        trigger: r.trigger,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  {
                    {
                      done: "When a task is done, notify the owner",
                      overdue: "When overdue, escalate to managers",
                      all_done: "When all tasks are done, complete the project",
                    }[r.trigger as "done" | "overdue" | "all_done"]
                  }
                </label>
              ))}
              {role === "employer" && (
                <label className="block text-sm">
                  <input
                    type="checkbox"
                    checked={details.timeTracking}
                    onChange={(e) =>
                      void mutate("/api/projects/" + projectId, "PATCH", {
                        timeTracking: e.target.checked,
                      })
                    }
                  />{" "}
                  Enable time tracking
                </label>
              )}
            </div>
          )}
          <ul className="space-y-2 text-sm">
            {details.activity.map((x, i) => (
              <li key={i}>
                {x.action} · {formatDate(x.created_at)}
              </li>
            ))}
          </ul>
        </section>
      )}
      {modal && (
        <CollaborationDialog
          title={
            modal === "edit"
              ? "Edit project"
              : modal === "project"
                ? "Create project"
                : modal === "task"
                  ? "Create task"
                  : modal === "member"
                    ? "Add project member"
                    : "Create milestone"
          }
          close={() => setModal("")}
        >
          <form onSubmit={submit} className="space-y-4">
            {modal === "member" ? (
              <>
                <PeoplePicker
                  value={people}
                  onChange={(v) => setPeople(v.slice(-1))}
                />
                <label className="block">
                  Member role
                  <select name="role" className="aero-input">
                    {["Owner", "Manager", "Contributor", "Viewer"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  {modal === "project" || modal === "edit"
                    ? "Project name"
                    : "Title"}
                  <input
                    name={
                      modal === "project" || modal === "edit" ? "name" : "title"
                    }
                    defaultValue={
                      modal === "edit" ? details?.project.name : undefined
                    }
                    required
                    maxLength={200}
                    className="aero-input"
                  />
                </label>
                {modal !== "milestone" && (
                  <label className="block">
                    Description
                    <textarea
                      name="description"
                      defaultValue={
                        modal === "edit"
                          ? details?.project.description
                          : undefined
                      }
                      maxLength={10000}
                      className="aero-input"
                    />
                  </label>
                )}
                {modal === "project" || modal === "edit" ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ["client", "Client"],
                        ["department", "Department"],
                        ["tags", "Tags, comma separated"],
                        ["budget", "Optional budget"],
                      ].map(([n, l]) => (
                        <label key={n}>
                          {l}
                          <input
                            name={n}
                            defaultValue={
                              modal === "edit"
                                ? n === "tags"
                                  ? details?.project.tags?.join(",")
                                  : String(
                                      details?.project[
                                        n as "client" | "department" | "budget"
                                      ] ?? "",
                                    )
                                : undefined
                            }
                            type={n === "budget" ? "number" : "text"}
                            min={0}
                            className="aero-input"
                          />
                        </label>
                      ))}
                    </div>
                    <label>
                      Start date
                      <input
                        name="startsOn"
                        defaultValue={
                          modal === "edit"
                            ? details?.project.starts_on || ""
                            : undefined
                        }
                        type="date"
                        className="aero-input"
                      />
                    </label>
                    <label>
                      End date
                      <input
                        name="endsOn"
                        defaultValue={
                          modal === "edit"
                            ? details?.project.ends_on || ""
                            : undefined
                        }
                        type="date"
                        className="aero-input"
                      />
                    </label>
                  </>
                ) : modal === "milestone" ? (
                  <label>
                    Due date
                    <input
                      required
                      name="dueOn"
                      type="date"
                      className="aero-input"
                    />
                  </label>
                ) : (
                  <>
                    <label>
                      Start date
                      <input
                        name="startsAt"
                        type="datetime-local"
                        className="aero-input"
                      />
                    </label>
                    <label>
                      Due date
                      <input
                        name="dueAt"
                        type="datetime-local"
                        className="aero-input"
                      />
                    </label>
                    <label>
                      Estimate, minutes
                      <input
                        name="estimateMinutes"
                        min={0}
                        type="number"
                        className="aero-input"
                      />
                    </label>
                    <label>
                      Repeat every days (optional)
                      <input
                        name="recurrenceDays"
                        type="number"
                        min={1}
                        max={365}
                        className="aero-input"
                      />
                    </label>
                    <label>
                      Labels
                      <input name="labels" className="aero-input" />
                    </label>
                    <PeoplePicker
                      project={projectId}
                      value={people}
                      onChange={setPeople}
                    />
                  </>
                )}
                {modal !== "milestone" && (
                  <label>
                    Priority
                    <select
                      name="priority"
                      defaultValue={
                        modal === "edit" ? details?.project.priority : undefined
                      }
                      className="aero-input"
                    >
                      {["Normal", "Low", "High", "Urgent"].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
            <button
              disabled={busy}
              className="aero-button bg-blue-700 text-white"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </form>
        </CollaborationDialog>
      )}
      {task && (
        <TaskDetail
          task={task}
          close={() => setTask(null)}
          write={
            myTasks
              ? ["Owner", "Manager", "Contributor"].includes(task.access_role)
              : !!write
          }
          manager={
            myTasks ? ["Owner", "Manager"].includes(task.access_role) : manager
          }
          timeTracking={details?.timeTracking || false}
          refresh={refresh}
        />
      )}
    </div>
  );
}
function TaskDetail({
  task,
  close,
  write,
  manager,
  timeTracking,
  refresh,
}: {
  task: Task;
  close: () => void;
  write: boolean;
  manager: boolean;
  timeTracking: boolean;
  refresh: () => Promise<void>;
}) {
  const [mentions, setMentions] = useState<Person[]>([]),
    [assignment, setAssignment] = useState<Person[]>(
      task.assignees.map((p) => ({ ...p, email: "", department: "" })),
    );
  const [data, setData] = useState<{
      task: Task;
      comments: {
        id: string;
        author_name: string;
        body: string;
        created_at: string;
      }[];
      checklist: { id: string; title: string; done: boolean }[];
      dependencies: { depends_on: string }[];
      attachments: { document_id: string }[];
      children: { id: string; title: string; status: string }[];
      activity: { action: string; created_at: string }[];
    } | null>(null),
    [message, setMessage] = useFeedback();
  const endpoint = "/api/projects/" + task.project_id + "/tasks/" + task.id;
  const load = useCallback(async () => {
    try {
      setData(await api(endpoint));
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [endpoint, setMessage]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  async function send(action: string, body: unknown) {
    try {
      await api(
        endpoint + (action ? "/" + action : ""),
        action ? "POST" : "PATCH",
        body,
      );
      await load();
      await refresh();
      setMessage("Saved.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <CollaborationDialog title={task.title} close={close}>
      {message && <p role="status">{message}</p>}
      {data && (
        <div className="space-y-5">
          {write && (
            <label className="block">
              Status
              <select
                className="aero-input"
                value={data.task.status}
                onChange={(e) =>
                  void send("", {
                    status: e.target.value,
                    revision: data.task.revision,
                  })
                }
              >
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          )}
          {write && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void send("", {
                  title: f.get("title"),
                  description: f.get("description"),
                  dueAt: f.get("dueAt") || null,
                  revision: data.task.revision,
                });
              }}
            >
              <label className="block">
                Edit title
                <input
                  name="title"
                  defaultValue={data.task.title}
                  required
                  maxLength={240}
                  className="aero-input"
                />
              </label>
              <label className="block">
                Description
                <textarea
                  name="description"
                  defaultValue={
                    (data.task as Task & { description: string }).description
                  }
                  className="aero-input"
                  maxLength={10000}
                />
              </label>
              <label className="block">
                Due date
                <input
                  name="dueAt"
                  type="datetime-local"
                  defaultValue={data.task.due_at?.slice(0, 16)}
                  className="aero-input"
                />
              </label>
              <button className="aero-button border">Update task</button>
            </form>
          )}
          {manager && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send("", {
                  assignees: assignment.map((p) => p.id),
                  revision: data.task.revision,
                });
              }}
            >
              <h3 className="font-semibold">Assignees</h3>
              <PeoplePicker
                project={task.project_id}
                value={assignment}
                onChange={setAssignment}
              />
              <div className="flex flex-wrap gap-2">
                {assignment.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className="aero-button border"
                    onClick={() =>
                      setAssignment((v) => v.filter((x) => x.id !== p.id))
                    }
                  >
                    {p.name} ×
                  </button>
                ))}
              </div>
              <button className="aero-button border">Update assignees</button>
            </form>
          )}
          <h3 className="font-semibold">Subtasks</h3>
          <ul>
            {data.children.map((child) => (
              <li key={child.id} className="py-2 text-sm">
                {child.title} · {child.status}
              </li>
            ))}
          </ul>
          {manager && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send("subtasks", {
                  title: new FormData(e.currentTarget).get("title"),
                });
                e.currentTarget.reset();
              }}
            >
              <input
                name="title"
                aria-label="Subtask title"
                className="aero-input"
                required
                maxLength={240}
              />
              <button className="aero-button border">Add subtask</button>
            </form>
          )}
          <h3 className="font-semibold">Checklist</h3>
          {data.checklist.map((c) => (
            <label className="flex gap-2" key={c.id}>
              <input
                disabled={!write}
                checked={c.done}
                type="checkbox"
                onChange={(e) =>
                  void send("checklist", { id: c.id, done: e.target.checked })
                }
              />
              {c.title}
            </label>
          ))}
          {write && (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void send("checklist", { title: f.get("title") });
                e.currentTarget.reset();
              }}
            >
              <input
                name="title"
                required
                maxLength={240}
                aria-label="Checklist item"
                className="aero-input"
              />
              <button className="aero-button border">Add item</button>
            </form>
          )}
          <h3 className="font-semibold">Recent activity</h3>
          <ul>
            {data.activity.map((entry, i) => (
              <li key={i} className="py-1 text-sm">
                {entry.action} · {formatDate(entry.created_at)}
              </li>
            ))}
          </ul>
          <h3 className="font-semibold">Comments and mentions</h3>
          {data.comments.map((c) => (
            <article className="rounded-lg bg-slate-50 p-3 text-sm" key={c.id}>
              <p>{c.body}</p>
              <small>
                {c.author_name} · {formatDate(c.created_at)}
              </small>
            </article>
          ))}
          {write && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void send("comments", {
                  body: f.get("body"),
                  mentions: mentions.map((p) => p.id),
                });
                e.currentTarget.reset();
              }}
            >
              <label className="block">
                Comment
                <textarea
                  required
                  name="body"
                  maxLength={4000}
                  className="aero-input"
                />
              </label>
              <PeoplePicker
                value={mentions}
                onChange={setMentions}
                project={task.project_id}
              />
              <p className="text-xs text-slate-600">
                Selected project members receive an @mention notification.
              </p>
              <button className="aero-button border">Post comment</button>
            </form>
          )}
          {manager && (
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send("dependencies", {
                  dependsOn: new FormData(e.currentTarget).get("dependency"),
                });
              }}
            >
              <ResourcePicker
                label="Dependency task"
                endpoint={"/api/projects/" + task.project_id + "/tasks"}
                name="dependency"
                exclude={task.id}
              />
              <button className="aero-button border">Add dependency</button>
            </form>
          )}
          <p className="text-sm">
            Dependencies:{" "}
            {data.dependencies.map((d) => d.depends_on).join(", ") || "None"}
          </p>
          {write && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send("attachments", {
                  documentId: new FormData(e.currentTarget).get("document"),
                });
              }}
            >
              <ResourcePicker
                label="Shared document"
                endpoint="/api/document-library"
                name="document"
              />
              <button className="aero-button border mt-2">
                Attach document
              </button>
            </form>
          )}
          <p className="text-sm">
            {data.attachments.length} attached documents. Document sharing
            remains separately enforced.
          </p>
          {timeTracking && write && (
            <div className="flex flex-wrap gap-2">
              <button
                className="aero-button border"
                onClick={() => void send("time", { action: "start" })}
              >
                Start timer
              </button>
              <button
                className="aero-button border"
                onClick={() => void send("time", { action: "stop" })}
              >
                Stop timer
              </button>
              <button
                className="aero-button border"
                onClick={() => {
                  const minutes = window.prompt("Minutes worked");
                  if (minutes) void send("time", { minutes: Number(minutes) });
                }}
              >
                Log time
              </button>
            </div>
          )}
        </div>
      )}
    </CollaborationDialog>
  );
}
