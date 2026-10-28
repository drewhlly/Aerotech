"use client";
import {useFeedback} from "@/components/use-feedback";
import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {useSearchParams} from "next/navigation";
import { WorkspaceRoleContext } from "./workspace-shell";
import CollaborationDialog from "./collaboration-dialog";
import PeoplePicker, { type Person } from "./people-picker";
import { api } from "./collaboration-client";
import { formatDate } from "@/lib/i18n";
type Doc = {
  id: string;
  title: string;
  category: string;
  filename: string;
  mime: string;
  owner: string;
  visibility: string;
  current_version: number;
  scan_status: string;
  expiry_date: string;
  folder_id: string | null;
  employee_id?:string; department?:string; tags?:string[]; retention_until?:string;
};
type Folder = { id: string; name: string; parent_id: string | null };
type Version = {
  version: number;
  filename: string;
  scan_status: string;
  created_at: string;
  content_hash: string;
};
type Ack = {
  id: string;
  version: number;
  employee_id: string;
  status: string;
  signed_name: string;
  updated_at: string;
};
const categories = [
  "Contracts",
  "Policies",
  "Payroll",
  "Identification",
  "Certificates",
  "Company",
  "Templates",
];
export default function DocumentLibrary() {
  const documentId=useSearchParams().get("document");
  const role = useContext(WorkspaceRoleContext),
    employer = role === "employer";
  const [records, setRecords] = useState<Doc[]>([]),
    [uploadEmployee, setUploadEmployee] = useState<Person[]>([]),
    [folders, setFolders] = useState<Folder[]>([]),
    [folder, setFolder] = useState(""),
    [q, setQ] = useState(""),
    [ownerFilter,setOwnerFilter]=useState(""),[employeeFilter,setEmployeeFilter]=useState<Person[]>([]),[fromDate,setFromDate]=useState(""),
    [category, setCategory] = useState(""),
    [status, setStatus] = useState(""),
    [type, setType] = useState(""),
    [offset, setOffset] = useState(0),
    [grid, setGrid] = useState(false),
    [sort, setSort] = useState("date"),
    [message, setMessage] = useFeedback(),
    [doc, setDoc] = useState<Doc | null>(null),
    [upload, setUpload] = useState(false),
    [templates, setTemplates] = useState(false),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0);
  useEffect(()=>{if(!documentId)return;let active=true;void api<{document:Doc}>("/api/document-library/"+encodeURIComponent(documentId)).then(d=>{if(active)setDoc(d.document)}).catch(e=>{if(active)setMessage(e.message)});return()=>{active=false}},[documentId,setMessage]);
  const refresh = useCallback(async () => {
    const params = new URLSearchParams({
      q,
      category,
      folder,
      status,
      type,owner:ownerFilter,employee:employeeFilter[0]?.id||"",from:fromDate,sort,
      offset: String(offset),
    });
    try {
      const [d, f] = await Promise.all([
        api<{ records: Doc[] }>("/api/document-library?" + params),
        api<{ records: Folder[] }>("/api/document-library/folders"),
      ]);
      setRecords(d.records);
      setFolders(f.records);
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [q, category, folder, status, type, offset, ownerFilter, employeeFilter, fromDate,sort, setMessage]);
  useEffect(() => {
    const t = setTimeout(() => void refresh(), 200);
    return () => clearTimeout(t);
  }, [refresh]);
  async function uploadFiles(files: FileList | File[], form?: HTMLFormElement) {
    setBusy(true);
    setProgress(0);
    try {
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        if (list[i].size > 2097152)
          throw Error("Maximum file size is 2 MB: " + list[i].name);
        const f = form ? new FormData(form) : new FormData();
        f.set("file", list[i]);
        f.set("title", list[i].name);
        f.set("category", category || String(f.get("category") || "Company"));
        if (folder) f.set("folderId", folder);
        await api("/api/document-library", "POST", f);
        setProgress(Math.round(((i + 1) / list.length) * 100));
      }
      setMessage(
        "Uploaded. Files remain quarantined until the configured scanner approves them.",
      );
      setUpload(false);
      await refresh();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const current = folders.find((f) => f.id === folder),
    parent = folders.find((f) => f.id === current?.parent_id);
  return (
    <div className="space-y-6">
      <section className="aero-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Document library</h1>
            <p className="mt-2 text-sm text-slate-600">
              {employer
                ? "Organise company records, manage versions and request acknowledgements."
                : "Documents shared with you. Your existing uploads remain below."}
            </p>
          </div>
          {employer && (
            <div className="flex gap-2">
              <button
                className="aero-button border"
                onClick={() => setTemplates(true)}
              >
                Templates
              </button>
              <button
                className="aero-button bg-blue-700 text-white"
                onClick={() => setUpload(true)}
              >
                Upload files
              </button>
            </div>
          )}
        </div>
      </section>
      {message && (
        <p role="status" className="aero-card">
          {message}
        </p>
      )}
      <section
        className="aero-card space-y-5"
        onDragOver={(e) => {
          if (employer) e.preventDefault();
        }}
        onDrop={(e) => {
          if (!employer) return;
          e.preventDefault();
          void uploadFiles(e.dataTransfer.files);
        }}
      >
        <nav
          aria-label="Document folders"
          className="flex flex-wrap gap-3 text-sm"
        >
          <button
            className="min-h-11 text-blue-800"
            onClick={() => setFolder("")}
          >
            Library
          </button>
          {parent && (
            <button
              className="min-h-11 text-blue-800"
              onClick={() => setFolder(parent.id)}
            >
              {" "}
              / {parent.name}
            </button>
          )}
          {current && <span className="py-3"> / {current.name}</span>}
        </nav>
        <div className="flex flex-wrap gap-3">
          {folders
            .filter((f) => f.parent_id === (folder || null))
            .map((f) => (
              <button
                key={f.id}
                className="aero-button border"
                onClick={() => {
                  setFolder(f.id);
                  setOffset(0);
                }}
              >
                Folder: {f.name}
              </button>
            ))}
          {employer && (
            <button
              className="aero-button border"
              onClick={async () => {
                const name = window.prompt("Folder name");
                if (name)
                  try {
                    await api("/api/document-library/folders", "POST", {
                      name,
                      parentId: folder || null,
                    });
                    await refresh();
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
              }}
            >
              New folder
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label>
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
          <label>
            Category
            <select
              className="aero-input"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setOffset(0);
              }}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Scan status
            <select
              value={status}
              onChange={(e)=>{setStatus(e.target.value);setOffset(0)}}
              className="aero-input"
            >
              <option value="">All</option>
              {["pending", "clean", "infected"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            File type
            <select
              value={type}
              onChange={(e)=>{setType(e.target.value);setOffset(0)}}
              className="aero-input"
            >
              <option value="">All</option>
              <option value="application/pdf">PDF</option>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                DOCX
              </option>
              <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                XLSX
              </option>
            </select>
          </label>
          <label>Created from<input type="date" className="aero-input" value={fromDate} onChange={e=>{setFromDate(e.target.value);setOffset(0)}}/></label>
          <label>Owner<select className="aero-input" value={ownerFilter} onChange={e=>{setOwnerFilter(e.target.value);setOffset(0)}}><option value="">All owners</option><option value="company">Company administrator</option><option value="me">My uploads</option></select></label>
          {employer&&<div><p className="text-sm">Filter by employee</p><PeoplePicker value={employeeFilter} onChange={v=>{setEmployeeFilter(v.slice(-1));setOffset(0)}}/>{employeeFilter[0]&&<button className="aero-button border" onClick={()=>{setEmployeeFilter([]);setOffset(0)}}>Clear {employeeFilter[0].name}</button>}</div>}
          <label>
            Sort
            <select
              value={sort}
              onChange={(e)=>{setSort(e.target.value);setOffset(0)}}
              className="aero-input"
            >
              <option value="date">Newest</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button
            className="aero-button border"
            aria-pressed={grid}
            onClick={() => setGrid((v) => !v)}
          >
            {grid ? "List view" : "Grid view"}
          </button>
        </div>
        {employer && (
          <p className="rounded-xl border-2 border-dashed p-5 text-sm text-slate-600">
            Drag files here or use Upload files. PDF, DOCX, XLSX, PNG and JPEG,
            up to 2 MB each.
          </p>
        )}
        <div
          className={
            grid ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"
          }
        >
          {records
            .toSorted((a, b) =>
              sort === "name" ? a.title.localeCompare(b.title) : 0,
            )
            .map((d) => (
              <article key={d.id} className="rounded-xl border p-4">
                <button
                  className="min-h-11 text-left font-semibold text-blue-800"
                  onClick={() => setDoc(d)}
                >
                  {d.title}
                </button>
                <p className="text-sm">
                  {d.category} · v{d.current_version} · {d.scan_status} ·{" "}
                  {d.visibility}
                </p>
                {d.expiry_date && (
                  <p className="text-xs">Expires {formatDate(d.expiry_date)}</p>
                )}
              </article>
            ))}
          {!records.length && <p>No documents match these filters.</p>}
        </div>
        <div className="flex gap-3">
          <button
            className="aero-button border"
            disabled={!offset}
            onClick={() => setOffset((n) => Math.max(0, n - 20))}
          >
            Previous
          </button>
          <button
            className="aero-button border"
            disabled={records.length < 20}
            onClick={() => setOffset((n) => n + 20)}
          >
            Next documents
          </button>
        </div>
      </section>
      {upload && (
        <CollaborationDialog
          title="Upload documents"
          close={() => setUpload(false)}
        >
          <form method="post"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                files = f
                  .getAll("file")
                  .filter((x) => x instanceof File) as File[];
              void uploadFiles(files, e.currentTarget);
            }}
          >
            <label className="block">
              Files
              <input
                required
                name="file"
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                className="aero-input"
              />
            </label>
            <label className="block">
              Category
              <select name="category" className="aero-input">
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Expiry date
              <input name="expiryDate" type="date" className="aero-input" />
            </label>
            <label className="block">
              Retention until
              <input name="retentionUntil" type="date" className="aero-input" />
            </label>
            <div>
              <p className="text-sm font-semibold">Employee (optional)</p>
              <PeoplePicker
                value={uploadEmployee}
                onChange={(v) => setUploadEmployee(v.slice(-1))}
              />
              <input
                type="hidden"
                name="employeeId"
                value={uploadEmployee[0]?.id || ""}
              />
              {uploadEmployee[0] && (
                <button
                  type="button"
                  className="aero-button border"
                  onClick={() => setUploadEmployee([])}
                >
                  {uploadEmployee[0].name} ×
                </button>
              )}
            </div>
            <label className="block">
              Department
              <input name="department" className="aero-input" />
            </label>
            <label className="block">
              Tags
              <input name="tags" className="aero-input" />
            </label>
            <progress
              value={progress}
              max={100}
              aria-label="Upload progress"
              className="w-full"
            />
            <button
              disabled={busy}
              className="aero-button bg-blue-700 text-white"
            >
              {busy ? "Uploading…" : "Upload"}
            </button>
          </form>
        </CollaborationDialog>
      )}
      {doc && (
        <DocumentDetails
          document={doc}
          employer={employer}
          close={() => setDoc(null)}
          refresh={refresh}
        />
      )}{" "}
      {templates && <Templates close={() => setTemplates(false)} />}
    </div>
  );
}
function DocumentDetails({
  document: d,
  employer,
  close,
  refresh,
}: {
  document: Doc;
  employer: boolean;
  close: () => void;
  refresh: () => Promise<void>;
}) {
  const [data, setData] = useState<{
      versions: Version[];
      acknowledgements: Ack[];
      downloadUrl: string | null;
    } | null>(null),
    [message, setMessage] = useFeedback(),
    [people, setPeople] = useState<Person[]>([]),
    [preview, setPreview] = useState(false),
    [version, setVersion] = useState(d.current_version),[versionOffset,setVersionOffset]=useState(0);
  const load = useCallback(async () => {
    try {
      setData(
        await api("/api/document-library/" + d.id + "?version=" + version+"&limit=20&offset="+versionOffset),
      );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }, [d.id, version, versionOffset, setMessage]);
  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);
  async function action(body: unknown) {
    try {
      await api("/api/document-library/" + d.id, "POST", body);
      setMessage("Saved.");
      await load();
      await refresh();
      close();
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <CollaborationDialog title={d.title} close={close}>
      {message && <p role="status">{message}</p>}
      <p className="text-sm">{d.category} · Company-managed record</p>

      {employer&&<details className="mt-4"><summary className="cursor-pointer font-semibold">Edit document details</summary><form method="post" className="mt-4 grid gap-3" onSubmit={async e=>{e.preventDefault();await action({action:"metadata",...Object.fromEntries(new FormData(e.currentTarget))})}}><label>Title<input name="title" required defaultValue={d.title} className="aero-input"/></label><label>Category<select name="category" defaultValue={d.category} className="aero-input">{categories.map(x=><option key={x}>{x}</option>)}</select></label><label>Expiry<input name="expiryDate" type="date" defaultValue={d.expiry_date?.slice(0,10)||""} className="aero-input"/></label><label>Retention until<input name="retentionUntil" type="date" defaultValue={d.retention_until?.slice(0,10)||""} className="aero-input"/></label><input type="hidden" name="employeeId" value={d.employee_id||""}/><label>Department<input name="department" defaultValue={d.department||""} className="aero-input"/></label><label>Tags<input name="tags" defaultValue={d.tags?.join(", ")||""} className="aero-input"/></label><button className="aero-button bg-blue-700 text-white">Save details</button></form></details>}
      {data && (
        <div className="mt-5 space-y-5">
          <label className="block">
            Version history
            <select
              className="aero-input"
              value={version}
              onChange={(e) => {
                setVersion(Number(e.target.value));
                setPreview(false);
              }}
            >
              {data.versions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} · {v.scan_status} · {formatDate(v.created_at)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-3"><button className="aero-button border" disabled={!versionOffset} onClick={()=>setVersionOffset(n=>Math.max(0,n-20))}>Newer versions</button><button className="aero-button border" disabled={data.versions.length<20} onClick={()=>setVersionOffset(n=>n+20)}>Older versions</button></div>
          {data.downloadUrl ? (
            <div className="flex flex-wrap gap-3">
              <a
                href={data.downloadUrl}
                className="aero-button bg-blue-700 text-white"
              >
                Download (2 minute link)
              </a>
              {["application/pdf", "image/png", "image/jpeg"].includes(
                d.mime,
              ) && (
                <button
                  className="aero-button border"
                  onClick={() => setPreview((v) => !v)}
                >
                  Preview
                </button>
              )}
              <a
                className="aero-button border"
                href={
                  "/api/document-library/" +
                  d.id +
                  "/signed-copy?version=" +
                  version
                }
              >
                Acknowledgement receipt PDF
              </a>
            </div>
          ) : (
            <p className="rounded-xl bg-amber-50 p-3 text-sm">
              Quarantined: downloads and signing remain blocked until a clean
              scan.
            </p>
          )}
          {preview && data.downloadUrl && (
            <iframe
              title="Document preview"
              src={data.downloadUrl + "&preview=1"}
              className="h-96 w-full rounded-xl border"
              sandbox=""
            />
          )}
          {employer && (
            <>
              <button
                className="aero-button border"
                onClick={() => void action({ action: "restore", version })}
              >
                Restore selected version as a new version
              </button>
              <form method="post"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  try {
                    await api("/api/document-library/" + d.id, "POST", f);
                    setMessage("Version uploaded for scanning.");
                    await load();
                    await refresh();
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
                className="space-y-2"
              >
                <label className="block">
                  Upload new version
                  <input
                    name="file"
                    required
                    type="file"
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                    className="aero-input"
                  />
                </label>
                <input type="hidden" name="category" value={d.category} />
                <button className="aero-button border">Upload version</button>
              </form>
              <PeoplePicker value={people} onChange={setPeople} />
              <form method="post"
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void action({
                    action: "share",
                    ...Object.fromEntries(new FormData(e.currentTarget)),
                    employeeIds: people.map((p) => p.id),
                  });
                }}
              >
                <label className="block">
                  Sharing policy
                  <select
                    name="visibility"
                    defaultValue={d.visibility}
                    className="aero-input"
                  >
                    {["private", "people", "department", "company"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  Department (for department access)
                  <input name="department" className="aero-input" />
                </label>
                <button className="aero-button border">Update access</button>
              </form>
              <button
                className="aero-button border"
                onClick={() =>
                  void action({
                    action: "send",
                    employeeIds: people.map((p) => p.id),
                  })
                }
              >
                Send acknowledgement request to selected people
              </button>
            </>
          )}
          <h3 className="font-semibold">Acknowledgements</h3>
          {data.acknowledgements.map((a) => (
            <div key={a.id} className="rounded-xl border p-3 text-sm">
              <p>
                Version {a.version} · {a.status} ·{" "}
                {a.signed_name || a.employee_id}
              </p>
              {!employer &&
                a.version === d.current_version &&
                ["Sent", "Viewed"].includes(a.status) &&
                data.downloadUrl && (
                  <form method="post"
                    className="mt-3 space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      try {
                        await api("/api/document-library/" + d.id, "PATCH", {
                          status: f.get("decision"),
                          signedName: f.get("name"),
                          consent: f.get("consent") === "on",
                        });
                        await load();
                      } catch (e) {
                        setMessage((e as Error).message);
                      }
                    }}
                  >
                    <label className="block">
                      Your full name
                      <input name="name" required className="aero-input" />
                    </label>
                    <label className="block">
                      Decision
                      <select name="decision" className="aero-input">
                        <option value="Signed">Acknowledge and sign</option>
                        <option value="Declined">Decline</option>
                      </select>
                    </label>
                    <label className="flex gap-2">
                      <input name="consent" required type="checkbox" />I have
                      reviewed this version and confirm this decision.
                    </label>
                    <button className="aero-button bg-blue-700 text-white">
                      Submit decision
                    </button>
                  </form>
                )}
            </div>
          ))}
          <p className="text-xs text-slate-600">
            Authenticated electronic acknowledgement with a version/hash audit
            trail. This is not a qualified or provider-certified digital
            signature.
          </p>
        </div>
      )}
    </CollaborationDialog>
  );
}
function Templates({ close }: { close: () => void }) {
  const [records, setRecords] = useState<
      { id: string; title: string; body: string }[]
    >([]),
    [message, setMessage] = useFeedback();
  const load = useCallback(
    async () =>
      setRecords(
        (
          await api<{ records: typeof records }>(
            "/api/document-library/templates",
          )
        ).records,
      ),
    [],
  );
  useEffect(() => {
    void Promise.resolve()
      .then(load)
      .catch((e) => setMessage(e.message));
  }, [load, setMessage]);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await api(
        "/api/document-library/templates",
        "POST",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      await load();
      setMessage("Template saved.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <CollaborationDialog title="Company templates" close={close}>
      {message && <p role="status">{message}</p>}
      <form method="post" className="space-y-3" onSubmit={create}>
        <label className="block">
          Template name
          <input
            name="title"
            required
            className="aero-input"
            placeholder="Offer letter, contract or warning"
          />
        </label>
        <label className="block">
          Body with merge fields
          <textarea
            name="body"
            className="aero-input min-h-40"
            required
            placeholder="Dear {{name}}, your role is {{role}}. Salary: {{salary}}. Date: {{date}}."
          />
        </label>
        <button className="aero-button border">Save template</button>
      </form>
      <form
        method="post"
        action="/api/document-library/generate"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const r = await fetch("/api/document-library/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                Object.fromEntries(new FormData(e.currentTarget)),
              ),
            });
            if (!r.ok) throw Error((await r.json()).error);
            const url = URL.createObjectURL(await r.blob()),
              a = document.createElement("a");
            a.href = url;
            a.download = "generated-document.pdf";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          } catch (e) {
            setMessage((e as Error).message);
          }
        }}
        className="mt-6 space-y-3"
      >
        <h3 className="font-semibold">Generate a PDF</h3>
        <label className="block">
          Template
          <select name="templateId" required className="aero-input">
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </label>
        {["name", "role", "salary", "date"].map((k) => (
          <label className="block capitalize" key={k}>
            {k}
            <input
              name={k}
              required
              type={k === "date" ? "date" : "text"}
              className="aero-input"
            />
          </label>
        ))}
        <button className="aero-button bg-blue-700 text-white">
          Generate PDF
        </button>
      </form>
    </CollaborationDialog>
  );
}
