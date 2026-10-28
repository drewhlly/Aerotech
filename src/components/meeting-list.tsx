"use client";
import {useFeedback} from "@/components/use-feedback";
import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { WorkspaceRoleContext } from "./workspace-shell";
import { workspaceHomes } from "@/lib/portal-policy";
import PeoplePicker, { type Person } from "./people-picker";
import CollaborationDialog from "./collaboration-dialog";
import { api } from "./collaboration-client";
import ResourcePicker from "./resource-picker";
import { formatDate } from "@/lib/i18n";
type Meeting = {
  id: string;
  title: string;
  agenda: string;
  starts_at: string;
  duration_minutes: number;
  timezone: string;
  joinState: "open" | "upcoming" | "expired";
  status: string;
  notes: string;
  rsvp: string;
  attendee_count: number;
};
type Group = {
  kind: string;
  value: string;
  name: string;
  count: number;
  required?: boolean;
};
export default function Meetings() {
  const role = useContext(WorkspaceRoleContext) || "employee",
    base = workspaceHomes[role] + "/meet",
    employer = role === "employer";
  const [meetings, setMeetings] = useState<Meeting[]>([]),
    [people, setPeople] = useState<Person[]>([]),
    [groups, setGroups] = useState<Group[]>([]),
    [chosen, setChosen] = useState<Group[]>([]),
    [exclude, setExclude] = useState<string[]>([]),
    [optional, setOptional] = useState<string[]>([]),
    [q, setQ] = useState(""),
    [selected, setSelected] = useState<Person[]>([]),
    [total, setTotal] = useState(0),
    [search, setSearch] = useState(""),
    [allOffset, setAllOffset] = useState(0),
    [more, setMore] = useState(false),
    [offset, setOffset] = useState(0),
    [showAll, setShowAll] = useState(false),
    [details, setDetails] = useState<Meeting | null>(null),
    [message, setMessage] = useFeedback(),
    [busy, setBusy] = useState(false),
    [startsAt, setStartsAt] = useState("");
  const reload = useCallback(async () => {
    const d = await api<{ meetings: Meeting[] }>(
      "/api/meet?offset=" + offset + "&limit=20",
    );
    setMeetings(d.meetings);
  }, [offset]);
  useEffect(() => {
    void Promise.resolve()
      .then(reload)
      .catch((e) => setMessage(e.message));
    const t = setInterval(() => void reload().catch(() => {}), 30000);
    return () => clearInterval(t);
  }, [reload]);
  useEffect(() => {
    if (!employer) return;
    const c = new AbortController(),
      t = setTimeout(
        () =>
          void api<{ records: Group[] }>(
            "/api/meet/groups?q=" + encodeURIComponent(q),
            "GET",
            undefined,
            c.signal,
          )
            .then((d) => setGroups(d.records))
            .catch((e) => {
              if (e.name !== "AbortError") setMessage(e.message);
            }),
        250,
      );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [q, employer]);
  useEffect(() => {
    if (!employer) return;
    const c = new AbortController(),
      t = setTimeout(
        () =>
          void api<{ records: Person[]; total: number; hasMore: boolean }>(
            "/api/meet/selection",
            "POST",
            {
              groups: chosen,
              employeeIds: people.map((p) => p.id),
              excludeIds: exclude,
              q: search,
              offset: allOffset,
            },
            c.signal,
          )
            .then((d) => {
              setSelected(d.records);
              setTotal(d.total);
              setMore(d.hasMore);
            })
            .catch((e) => {
              if (e.name !== "AbortError") setMessage(e.message);
            }),
        200,
      );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [employer, chosen, people, exclude, search, allOffset]);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = Object.fromEntries(new FormData(e.currentTarget));
      const local = String(f.startsAt),
        timezone = String(f.timezone);
      const naive = Date.parse(local + "Z");
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        timeZoneName: "longOffset",
      }).formatToParts(new Date(naive));
      const offsetString =
        parts.find((p) => p.type === "timeZoneName")?.value || "GMT";
      const match = offsetString.match(/GMT([+-])(\d{2}):(\d{2})/);
      const delta = match
        ? (Number(match[2]) * 60 + Number(match[3])) *
          (match[1] === "+" ? 1 : -1)
        : 0;
      const date = new Date(naive - delta * 60000).toISOString();
      await api("/api/meet", "POST", {
        ...f,
        startsAt: date,
        employeeIds: people.map((p) => p.id),
        optionalIds: optional,
        groups: chosen,
        excludeIds: exclude,
        guestEmails: String(f.emails || "")
          .split(/[\s,;]+/)
          .filter(Boolean),
      });
      setMessage(
        "Meeting scheduled. Invited employees will see it in their portal.",
      );
      setPeople([]);
      setChosen([]);
      setExclude([]);
      await reload();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <section className="aero-card">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Private meeting schedules, invitations and action items. Times default
          to Africa/Lagos (WAT).
        </p>
      </section>
      {message && (
        <p role="status" className="aero-card">
          {message}
        </p>
      )}
      {employer && (
        <form onSubmit={create} className="aero-card space-y-5">
          <h2 className="text-lg font-bold">Schedule a meeting</h2>
          <label className="block">
            Title
            <input
              required
              name="title"
              maxLength={150}
              className="aero-input"
            />
          </label>
          <label className="block">
            Agenda
            <textarea name="agenda" maxLength={10000} className="aero-input" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              Start date and time
              <input
                type="datetime-local"
                required
                name="startsAt"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="aero-input"
              />
            </label>
            <label>
              Timezone
              <select
                name="timezone"
                defaultValue="Africa/Lagos"
                className="aero-input"
              >
                {[
                  "Africa/Lagos",
                  "Africa/Accra",
                  "Africa/Nairobi",
                  "Europe/London",
                  "America/New_York",
                  "UTC",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Duration, minutes
              <input
                name="durationMinutes"
                type="number"
                min={15}
                max={240}
                defaultValue={60}
                required
                className="aero-input"
              />
            </label>
            <label>
              Recurrence
              <select name="recurrence" className="aero-input">
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
          </div>
          <label className="block">
            Location
            <input
              name="location"
              maxLength={300}
              className="aero-input"
              placeholder="Room / office location; video joins stay inside Aerotech"
            />
          </label>
          <PeoplePicker
            value={people}
            onChange={setPeople}
            startsAt={
              startsAt ? new Date(startsAt + "+01:00").toISOString() : undefined
            }
          />
          <fieldset className="space-y-3 rounded-xl border p-4">
            <legend className="font-semibold">Quick-add groups</legend>
            <label className="block text-sm">
              Search department, role, location, project or saved team
              <input
                className="aero-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <div className="grid max-h-56 gap-2 overflow-auto sm:grid-cols-2">
              {groups.map((g) => (
                <button
                  type="button"
                  key={g.kind + g.value}
                  className="aero-button border text-left"
                  disabled={chosen.some(
                    (x) => x.kind === g.kind && x.value === g.value,
                  )}
                  onClick={() => {
                    if (
                      g.count > 100 &&
                      !window.confirm(
                        "Add " + g.count + " people from " + g.name + "?",
                      )
                    )
                      return;
                    setChosen((v) => [...v, { ...g, required: true }]);
                  }}
                >
                  {g.name} · {g.count} people <small>({g.kind})</small>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="aero-button border"
              onClick={() => {
                if (
                  !window.confirm(
                    "Add all currently displayed groups? Overlapping members are deduplicated.",
                  )
                )
                  return;
                setChosen((v) => [
                  ...v,
                  ...groups.filter(
                    (g) =>
                      !v.some((x) => x.kind === g.kind && x.value === g.value),
                  ),
                ]);
              }}
            >
              Select displayed groups
            </button>
          </fieldset>
          <section aria-label="Selected attendees" className="space-y-3">
            <h3 className="font-semibold">Selected attendees ({total})</h3>
            <div className="flex flex-wrap gap-2">
              {people.slice(0, 6).map((p) => (
                <div key={p.id} className="rounded-xl bg-blue-50 p-2 text-sm">
                  <span>{p.name}</span>
                  <button
                    aria-label={"Remove " + p.name}
                    type="button"
                    className="ml-2 min-h-11 px-2"
                    onClick={() => {
                      setPeople((v) => v.filter((x) => x.id !== p.id));
                      setExclude((v) => [...v, p.id]);
                    }}
                  >
                    ×
                  </button>
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={optional.includes(p.id)}
                      onChange={(e) =>
                        setOptional((v) =>
                          e.target.checked
                            ? [...v, p.id]
                            : v.filter((x) => x !== p.id),
                        )
                      }
                    />{" "}
                    Optional
                  </label>
                </div>
              ))}
              {chosen.map((g) => (
                <div
                  className="rounded-xl bg-slate-100 p-2 text-sm"
                  key={g.kind + g.value}
                >
                  {g.name} · {g.count}
                  <button
                    type="button"
                    aria-label={"Remove group " + g.name}
                    className="min-h-11 px-3"
                    onClick={() => setChosen((v) => v.filter((x) => x !== g))}
                  >
                    ×
                  </button>
                  <label className="block">
                    <input
                      type="checkbox"
                      checked={g.required === false}
                      onChange={(e) =>
                        setChosen((v) =>
                          v.map((x) =>
                            x === g ? { ...x, required: !e.target.checked } : x,
                          ),
                        )
                      }
                    />{" "}
                    Optional group
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="aero-button border"
              onClick={() => setShowAll(true)}
            >
              View all {total > 6 ? "(+" + (total - 6) + " more)" : ""}
            </button>
            <button
              type="button"
              className="aero-button border ml-2"
              onClick={async () => {
                const name = window.prompt(
                  "Saved team/group name (individually selected people only)",
                );
                if (name)
                  try {
                    await api("/api/meet/groups", "POST", {
                      name,
                      members: people.map((p) => p.id),
                    });
                    setMessage("Group saved. Search its name to reuse it.");
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
              }}
            >
              Save group
            </button>
          </section>
          <label className="block">
            Bulk paste employee or external guest emails
            <textarea
              name="emails"
              className="aero-input"
              placeholder="Separate emails with commas, spaces or new lines"
            />
          </label>
          <p className="text-xs text-slate-600">
            External guests are recorded separately. Guest video access requires
            verified identity; external invitation delivery is not enabled by
            this release.
          </p>
          <button
            className="aero-button bg-blue-700 text-white"
            disabled={busy}
          >
            {busy ? "Scheduling…" : "Schedule meeting"}
          </button>
        </form>
      )}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">My meetings</h2>
        {meetings.map((m) => (
          <article key={m.id} className="aero-card">
            <h3 className="font-bold">{m.title}</h3>
            <p className="mt-2 text-sm">
              {new Date(m.starts_at).toLocaleString("en-GB", {
                timeZone: m.timezone || "Africa/Lagos",
              })}{" "}
              · {m.timezone || "Africa/Lagos"} · {m.duration_minutes} minutes ·{" "}
              {m.status}
            </p>
            <p className="mt-2 text-sm">{m.agenda}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {m.joinState === "open" ? (
                <Link
                  href={base + "/" + m.id}
                  className="aero-button bg-blue-700 text-white"
                >
                  Join meeting
                </Link>
              ) : (
                <span className="py-3 text-sm text-slate-600">
                  {m.joinState === "expired"
                    ? "Ended / cancelled · no join link"
                    : "Join opens 15 minutes before start"}
                </span>
              )}
              {role !== "applicant" && (
                <button
                  className="aero-button border"
                  onClick={() => setDetails(m)}
                >
                  Notes & attendees
                </button>
              )}
              {role === "employee" &&
                ["Accept", "Decline", "Maybe"].map((r) => (
                  <button
                    key={r}
                    className="aero-button border"
                    onClick={async () => {
                      try {
                        await api("/api/meet/" + m.id + "/details", "POST", {
                          action: "rsvp",
                          rsvp: r,
                        });
                        await reload();
                      } catch (e) {
                        setMessage((e as Error).message);
                      }
                    }}
                  >
                    {m.rsvp === r ? "✓ " : ""}
                    {r}
                  </button>
                ))}
            </div>
            {m.notes && <p className="mt-3 text-sm">{m.notes}</p>}
          </article>
        ))}
        {!meetings.length && (
          <p className="aero-card">No meetings scheduled.</p>
        )}
        <div className="flex gap-3">
          <button
            className="aero-button border"
            disabled={!offset}
            onClick={() => setOffset((n) => Math.max(0, n - 20))}
          >
            Previous meetings
          </button>
          <button
            className="aero-button border"
            disabled={meetings.length < 20}
            onClick={() => setOffset((n) => n + 20)}
          >
            Next meetings
          </button>
        </div>
      </section>
      {showAll && (
        <CollaborationDialog
          title={"Selected attendees: " + total}
          close={() => setShowAll(false)}
        >
          <label className="block">
            Filter by name, email or department
            <input
              className="aero-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setAllOffset(0);
              }}
            />
          </label>
          <ul className="my-4 space-y-2">
            {selected.map((p) => (
              <li
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
                key={p.id}
              >
                <span>
                  {p.name} · {p.department}
                </span>
                <button
                  type="button"
                  className="aero-button border"
                  onClick={() => {
                    setExclude((v) => [...v, p.id]);
                    setPeople((v) => v.filter((x) => x.id !== p.id));
                  }}
                >
                  Exclude
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="aero-button border"
            disabled={!allOffset}
            onClick={() => setAllOffset((n) => Math.max(0, n - 20))}
          >
            Previous
          </button>
          <button
            type="button"
            className="aero-button border"
            disabled={!more}
            onClick={() => setAllOffset((n) => n + 20)}
          >
            Load more
          </button>
        </CollaborationDialog>
      )}
      {details && (
        <MeetingDetails
          meeting={details}
          employer={employer}
          close={() => setDetails(null)}
          base={base}
          reload={reload}
        />
      )}
    </div>
  );
}
function MeetingDetails({
  meeting,
  employer,
  close,
  base,
  reload,
}: {
  meeting: Meeting;
  employer: boolean;
  close: () => void;
  base: string;
  reload: () => Promise<void>;
}) {
  const [people, setPeople] = useState<
      { id: string; name: string; rsvp: string; joined_at: string | null }[]
    >([]),
    [actions, setActions] = useState<
      { id: string; title: string; task_id: string }[]
    >([]),
    [q, setQ] = useState(""),
    [offset, setOffset] = useState(0),
    [message, setMessage] = useFeedback();
  useEffect(() => {
    const c = new AbortController(),
      t = setTimeout(
        () =>
          void api<{ participants: typeof people; actions: typeof actions }>(
            "/api/meet/" +
              meeting.id +
              "/details?" +
              new URLSearchParams({ q, offset: String(offset) }),
            "GET",
            undefined,
            c.signal,
          )
            .then((d) => {
              setPeople(d.participants);
              setActions(d.actions);
            })
            .catch((e) => {
              if (e.name !== "AbortError") setMessage(e.message);
            }),
        200,
      );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [meeting.id, q, offset]);
  async function save(e: FormEvent<HTMLFormElement>, action: string) {
    e.preventDefault();
    try {
      await api("/api/meet/" + meeting.id + "/details", "POST", {
        action,
        ...Object.fromEntries(new FormData(e.currentTarget)),
      });
      setMessage("Saved.");
      await reload();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <CollaborationDialog title={meeting.title} close={close}>
      <p className="text-sm">
        {formatDate(meeting.starts_at)} · {meeting.status}
      </p>
      {message && <p role="status">{message}</p>}
      <label className="mt-4 block">
        Find attendees
        <input
          className="aero-input"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffset(0);
          }}
        />
      </label>
      <ul className="my-4 space-y-2">
        {people.map((p) => (
          <li key={p.id} className="text-sm">
            {p.name} · {p.rsvp} ·{" "}
            {p.joined_at ? "Attended" : "No attendance recorded"}
          </li>
        ))}
      </ul>
      <button
        className="aero-button border"
        disabled={!offset}
        onClick={() => setOffset((n) => Math.max(0, n - 20))}
      >
        Previous
      </button>
      <button
        className="aero-button border"
        disabled={people.length < 20}
        onClick={() => setOffset((n) => n + 20)}
      >
        Load more
      </button>
      {employer && (
        <>
          <form
            onSubmit={(e) => void save(e, "notes")}
            className="mt-5 space-y-3"
          >
            <label className="block">
              Meeting notes
              <textarea
                name="notes"
                defaultValue={meeting.notes}
                maxLength={20000}
                className="aero-input"
              />
            </label>
            <button className="aero-button border">Save notes</button>
          </form>
          <form
            onSubmit={(e) => void save(e, "task")}
            className="mt-5 space-y-3"
          >
            <h3 className="font-semibold">Convert action item to task</h3>
            <label className="block">
              Action title
              <input name="title" required className="aero-input" />
            </label>
            <ResourcePicker
              label="Project"
              endpoint="/api/projects"
              name="projectId"
            />
            <label className="block">
              Due date
              <input
                name="dueAt"
                type="datetime-local"
                className="aero-input"
              />
            </label>
            <button className="aero-button border">Create project task</button>
          </form>
          <button
            className="aero-button mt-5 bg-red-700 text-white"
            onClick={async () => {
              if (
                window.confirm("Cancel this meeting and invalidate joining?")
              ) {
                try {
                  await api("/api/meet/" + meeting.id + "/details", "POST", {
                    action: "cancel",
                  });
                  await reload();
                  close();
                } catch (e) {
                  setMessage((e as Error).message);
                }
              }
            }}
          >
            Cancel meeting
          </button>
        </>
      )}
      <h3 className="mt-5 font-semibold">Action items</h3>
      {actions.map((a) => (
        <p className="py-2" key={a.id}>
          {a.title} · Task {a.task_id}
        </p>
      ))}
      <p className="mt-4 text-xs text-slate-600">
        {base.startsWith("/employee")
          ? "Only your invited meetings appear here."
          : "All notes remain within this company."}
      </p>
    </CollaborationDialog>
  );
}
