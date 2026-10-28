import {
  actor,
  transaction,
  errorResponse,
  respond,
  AccessError,
  documentAccess,
  audit,
  text,
  id,
  ids,
  enqueue,
  notify,
  date,
} from "@/lib/collaboration";
import { pageBounds } from "@/lib/collaboration-policy";
import {
  encryptDocument,
  decryptDocument,
  hashDocument,
  documentMime,
  signDownload,
  verifyDownload,
} from "@/lib/document-crypto";
import { textPDF } from "@/lib/simple-pdf";
export const runtime = "nodejs";
type C = { params: Promise<{ segments?: string[] }> };
const categories = [
  "Contracts",
  "Policies",
  "Payroll",
  "Identification",
  "Certificates",
  "Company",
  "Templates",
];
export async function GET(req: Request, ctx: C) {
  try {
    const a = await actor(),
      s = (await ctx.params).segments || [],
      u = new URL(req.url),
      { limit, offset } = pageBounds(u);
    return await transaction(async (c) => {
      if (!s.length) {
        const q = "%" + text(u.searchParams.get("q"), 100) + "%",
          category = text(u.searchParams.get("category"), 30),
          folder = u.searchParams.get("folder");
        if (folder) id(folder);
        const r = await c.query(
          `SELECT d.id,d.title,d.folder_id,d.category,d.owner,d.employee_id,d.department,d.tags,d.expiry_date,d.current_version,d.visibility,d.created_at,v.filename,v.mime,v.size_bytes,v.scan_status FROM library_documents d JOIN library_document_versions v ON v.document_id=d.id AND v.version=d.current_version WHERE d.employer_id=$1 AND ($2::uuid IS NULL OR d.owner=$3 OR d.visibility='company' OR d.visibility='department' AND d.department=$4 OR EXISTS(SELECT 1 FROM document_grants g WHERE g.document_id=d.id AND g.employee_id=$2)) AND (d.retention_until IS NULL OR d.retention_until>=CURRENT_DATE) AND d.title ILIKE $5 AND ($6='' OR d.category=$6) AND ($7::uuid IS NULL OR d.folder_id=$7) AND ($10='' OR d.owner=$10) AND ($11::uuid IS NULL OR d.employee_id=$11) AND ($12='' OR v.mime=$12) AND ($13='' OR v.scan_status=$13) AND ($14::date IS NULL OR d.created_at>=$14::date) ORDER BY d.created_at DESC,d.id LIMIT $8 OFFSET $9`,
          [
            a.tenant,
            a.employee,
            a.id,
            a.department,
            q,
            category,
            folder || null,
            limit,
            offset,
            text(u.searchParams.get("owner"), 100),
            u.searchParams.get("employee")
              ? id(u.searchParams.get("employee"))
              : null,
            text(u.searchParams.get("type"), 150),
            text(u.searchParams.get("status"), 20),
            u.searchParams.get("from")
              ? date(u.searchParams.get("from"))
              : null,
          ],
        );
        return respond({ records: r.rows, limit, offset, categories });
      }
      if (s[0] === "folders")
        return respond({
          records: (
            await c.query(
              `SELECT f.id,f.name,f.parent_id FROM document_folders f WHERE f.employer_id=$1 AND ($2::uuid IS NULL OR EXISTS(SELECT 1 FROM library_documents d WHERE d.folder_id=f.id AND (d.owner=$3 OR d.visibility='company' OR d.visibility='department' AND d.department=$4 OR EXISTS(SELECT 1 FROM document_grants g WHERE g.document_id=d.id AND g.employee_id=$2)))) ORDER BY f.name LIMIT 100`,
              [a.tenant, a.employee, a.id, a.department],
            )
          ).rows,
        });
      if (s[0] === "templates") {
        if (a.employee) throw new AccessError("Employer access required");
        return respond({
          records: (
            await c.query(
              "SELECT id,title,body FROM document_templates WHERE employer_id=$1 ORDER BY title LIMIT 100",
              [a.tenant],
            )
          ).rows,
        });
      }
      const d = await documentAccess(c, a, s[0]);
      if (
        d.retention_until &&
        new Date(d.retention_until) <
          new Date(new Date().toISOString().slice(0, 10))
      )
        throw new AccessError("Retention period ended", 410);
      const version = u.searchParams.get("version")
        ? Number(u.searchParams.get("version"))
        : d.current_version;
      const v = (
        await c.query(
          "SELECT * FROM library_document_versions WHERE employer_id=$1 AND document_id=$2 AND version=$3",
          [a.tenant, d.id, version],
        )
      ).rows[0];
      if (!v) throw new AccessError("Version not found", 404);
      if (s[1] === "download") {
        const exp = Number(u.searchParams.get("expires"));
        if (
          !verifyDownload(
            a.tenant + ":" + d.id + ":" + version + ":" + a.id,
            exp,
            u.searchParams.get("signature") || "",
          )
        )
          throw new AccessError("Download link expired", 410);
        if (v.scan_status !== "clean")
          throw new AccessError(
            "This version is quarantined pending a clean scan",
            423,
          );
        await audit(c, a, "document.downloaded", d.id, { version });
        const bytes = decryptDocument(
          v.encrypted_content,
          a.tenant + ":" + d.id + ":" + version,
        );
        return new Response(new Uint8Array(bytes), {
          headers: {
            "Content-Type": v.mime,
            "Content-Disposition": `${u.searchParams.get("preview") === "1" && ["application/pdf", "image/png", "image/jpeg"].includes(v.mime) ? "inline" : "attachment"}; filename="${v.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "sandbox; default-src 'none'",
          },
        });
      }
      if (s[1] === "signed-copy") {
        if (v.scan_status !== "clean")
          throw new AccessError("Document is quarantined", 423);
        const acks = (
          await c.query(
            `SELECT status,content_hash,signed_name,updated_at FROM document_acknowledgements WHERE document_id=$1 AND version=$2 AND ($3::uuid IS NULL OR employee_id=$3)`,
            [d.id, version, a.employee],
          )
        ).rows;
        await audit(c, a, "document.receipt", d.id, { version });
        return new Response(
          new Uint8Array(
            textPDF("Acknowledgement receipt: " + d.title, [
              "Document: " + d.id,
              "Version: " + version,
              "Original SHA256: " + v.content_hash,
              ...acks.map(
                (x) => `${x.status} | ${x.signed_name || ""} | ${x.updated_at}`,
              ),
              "This receipt accompanies the immutable original; it is an authenticated acknowledgement, not a qualified digital signature.",
            ]),
          ),
          {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition":
                'attachment; filename="acknowledgement-receipt.pdf"',
              "Cache-Control": "private, no-store",
            },
          },
        );
      }
      const expires = Date.now() + 120000,
        scope = a.tenant + ":" + d.id + ":" + version + ":" + a.id;
      const versions = (
        await c.query(
          "SELECT version,filename,mime,scan_status,content_hash,created_at FROM library_document_versions WHERE employer_id=$1 AND document_id=$2 ORDER BY version DESC LIMIT $3 OFFSET $4",
          [a.tenant, d.id, limit, offset],
        )
      ).rows;
      const acknowledgements = (
        await c.query(
          "SELECT id,version,employee_id,status,signed_name,updated_at FROM document_acknowledgements WHERE document_id=$1 AND ($2::uuid IS NULL OR employee_id=$2) ORDER BY updated_at DESC LIMIT 100",
          [d.id, a.employee],
        )
      ).rows;
      await c.query(
        "UPDATE document_acknowledgements SET status='Viewed',updated_at=NOW() WHERE document_id=$1 AND employee_id=$2 AND version=$3 AND status='Sent'",
        [d.id, a.employee, version],
      );
      await audit(c, a, "document.viewed", d.id, { version });
      return respond({
        document: d,
        versions,
        acknowledgements,
        downloadUrl:
          v.scan_status === "clean"
            ? `/api/document-library/${d.id}/download?version=${version}&expires=${expires}&signature=${signDownload(scope, expires)}`
            : null,
      });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: Request, ctx: C) {
  try {
    const a = await actor(),
      s = (await ctx.params).segments || [];
    if (a.employee)
      throw new AccessError("Employer document management required");
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      if (Number(req.headers.get("content-length")) > 2200000)
        throw new AccessError("Maximum file size is 2 MB", 413);
      const f = await req.formData(),
        file = f.get("file");
      if (!(file instanceof File) || !file.size || file.size > 2097152)
        throw new AccessError("Choose a file up to 2 MB", 400);
      const bytes = Buffer.from(await file.arrayBuffer()),
        mime = documentMime(bytes, file.name);
      if (!mime)
        throw new AccessError("Choose PDF, DOCX, XLSX, PNG or JPEG", 400);
      const title = text(f.get("title") || file.name, 200, true),
        category = text(f.get("category") || "Company", 30);
      if (!categories.includes(category))
        throw new AccessError("Invalid category", 400);
      return await transaction(async (c) => {
        let d;
        if (s[0]) d = await documentAccess(c, a, s[0], true);
        else
          d = (
            await c.query(
              "INSERT INTO library_documents(employer_id,title,category,owner,folder_id,expiry_date,retention_until,employee_id,department,tags) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *",
              [
                a.tenant,
                title,
                category,
                a.id,
                f.get("folderId") ? id(f.get("folderId")) : null,
                date(f.get("expiryDate")),
                date(f.get("retentionUntil")),
                f.get("employeeId") ? id(f.get("employeeId")) : null,
                text(f.get("department"), 100),
                text(f.get("tags"), 500)
                  .split(",")
                  .filter(Boolean)
                  .slice(0, 20),
              ],
            )
          ).rows[0];
        const version = s[0] ? d.current_version + 1 : 1;
        const encrypted = encryptDocument(
          bytes,
          a.tenant + ":" + d.id + ":" + version,
        );
        const v = (
          await c.query(
            "INSERT INTO library_document_versions(employer_id,document_id,version,filename,mime,encrypted_content,content_hash,size_bytes,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
            [
              a.tenant,
              d.id,
              version,
              file.name.slice(0, 160),
              mime,
              encrypted,
              hashDocument(bytes),
              bytes.length,
              a.id,
            ],
          )
        ).rows[0];
        await c.query(
          "UPDATE library_documents SET current_version=$1,updated_at=NOW() WHERE id=$2",
          [version, d.id],
        );
        await enqueue(c, a.tenant, "virus_scan", "scan:" + v.id, {
          versionId: v.id,
        });
        await audit(c, a, "document.uploaded", d.id, {
          version,
          hash: hashDocument(bytes),
        });
        return respond({ id: d.id, version, scanStatus: "pending" }, 201);
      });
    }
    const b = await req.json();
    return await transaction(async (c) => {
      if (s[0] === "folders") {
        if (b.parentId) id(b.parentId);
        return respond(
          (
            await c.query(
              "INSERT INTO document_folders(employer_id,name,parent_id) VALUES($1,$2,$3) RETURNING id",
              [a.tenant, text(b.name, 100, true), b.parentId || null],
            )
          ).rows[0],
          201,
        );
      }
      if (s[0] === "templates") {
        const body = text(b.body, 20000, true);
        if (
          (body.match(/\{\{([^}]+)\}\}/g) || []).some(
            (x) =>
              !["{{name}}", "{{role}}", "{{salary}}", "{{date}}"].includes(x),
          )
        )
          throw new AccessError(
            "Allowed fields: name, role, salary, date",
            400,
          );
        return respond(
          (
            await c.query(
              "INSERT INTO document_templates(employer_id,title,body) VALUES($1,$2,$3) RETURNING id",
              [a.tenant, text(b.title, 200, true), body],
            )
          ).rows[0],
          201,
        );
      }
      if (s[0] === "generate") {
        const template = (
          await c.query(
            "SELECT * FROM document_templates WHERE employer_id=$1 AND id=$2",
            [a.tenant, id(b.templateId)],
          )
        ).rows[0];
        if (!template) throw new AccessError("Template not found", 404);
        let body = template.body;
        for (const k of ["name", "role", "salary", "date"])
          body = body.replaceAll("{{" + k + "}}", text(b[k], 300));
        await audit(c, a, "document.generated", template.id);
        return new Response(
          new Uint8Array(textPDF(template.title, body.split("\n"))),
          {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition":
                'attachment; filename="generated-document.pdf"',
              "Cache-Control": "private, no-store",
            },
          },
        );
      }
      const d = await documentAccess(c, a, s[0], true);
      if (b.action === "restore") {
        const v = (
          await c.query(
            "SELECT * FROM library_document_versions WHERE employer_id=$1 AND document_id=$2 AND version=$3 AND scan_status='clean'",
            [a.tenant, d.id, Number(b.version)],
          )
        ).rows[0];
        if (!v) throw new AccessError("Clean version not found", 404);
        const bytes = decryptDocument(
            v.encrypted_content,
            a.tenant + ":" + d.id + ":" + v.version,
          ),
          version = d.current_version + 1;
        await c.query(
          "INSERT INTO library_document_versions(employer_id,document_id,version,filename,mime,encrypted_content,content_hash,size_bytes,created_by,scan_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'clean')",
          [
            a.tenant,
            d.id,
            version,
            v.filename,
            v.mime,
            encryptDocument(bytes, a.tenant + ":" + d.id + ":" + version),
            v.content_hash,
            v.size_bytes,
            a.id,
          ],
        );
        await c.query(
          "UPDATE library_documents SET current_version=$1,updated_at=NOW() WHERE id=$2",
          [version, d.id],
        );
        await audit(c, a, "document.restored", d.id, {
          source: v.version,
          version,
        });
        return respond({ ok: true, version });
      }
      if (b.action === "share") {
        if (
          !["private", "people", "department", "company"].includes(b.visibility)
        )
          throw new AccessError("Invalid sharing policy", 400);
        const members = ids(b.employeeIds || []);
        if (b.visibility === "department" && !text(b.department, 100))
          throw new AccessError("Select a department", 400);
        await c.query("DELETE FROM document_grants WHERE document_id=$1", [
          d.id,
        ]);
        for (const member of members)
          await c.query(
            "INSERT INTO document_grants(employer_id,document_id,employee_id) VALUES($1,$2,$3)",
            [a.tenant, d.id, member],
          );
        await c.query(
          "UPDATE library_documents SET visibility=$1,department=$2 WHERE id=$3",
          [b.visibility, text(b.department, 100), d.id],
        );
        await audit(c, a, "document.shared", d.id, {
          visibility: b.visibility,
        });
        return respond({ ok: true });
      }
      if (b.action === "send") {
        const members = ids(b.employeeIds || []),
          v = (
            await c.query(
              "SELECT content_hash FROM library_document_versions WHERE document_id=$1 AND version=$2 AND scan_status='clean'",
              [d.id, d.current_version],
            )
          ).rows[0];
        if (!members.length || !v)
          throw new AccessError(
            "Choose recipients and wait for a clean scan",
            400,
          );
        for (const member of members) {
          await c.query(
            "INSERT INTO document_grants(employer_id,document_id,employee_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
            [a.tenant, d.id, member],
          );
          await c.query(
            "INSERT INTO document_acknowledgements(employer_id,document_id,version,employee_id,content_hash) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING",
            [a.tenant, d.id, d.current_version, member, v.content_hash],
          );
        }
        await c.query(
          "UPDATE library_documents SET visibility=CASE WHEN visibility='private' THEN 'people' ELSE visibility END WHERE id=$1",
          [d.id],
        );
        await notify(
          c,
          a,
          members.map((x) => "employee:" + x),
          "document",
          "Document acknowledgement requested",
          d.title,
          "/documents",
          d.id + ":" + d.current_version,
        );
        await audit(c, a, "document.sent", d.id, {
          version: d.current_version,
          count: members.length,
        });
        return respond({ ok: true });
      }
      throw new AccessError("Unknown document operation", 400);
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PATCH(req: Request, ctx: C) {
  try {
    const a = await actor(),
      s = (await ctx.params).segments || [],
      b = await req.json();
    return await transaction(async (c) => {
      const d = await documentAccess(c, a, s[0]);
      if (
        !a.employee ||
        !["Signed", "Declined"].includes(b.status) ||
        !b.consent
      )
        throw new AccessError("Explicit employee consent required", 400);
      const name = text(b.signedName, 200, true);
      const r = await c.query(
        `UPDATE document_acknowledgements SET status=$1,signed_name=$2,updated_at=NOW() WHERE employer_id=$3 AND document_id=$4 AND employee_id=$5 AND version=$6 AND status IN ('Sent','Viewed') RETURNING id,content_hash`,
        [b.status, name, a.tenant, d.id, a.employee, d.current_version],
      );
      if (!r.rowCount)
        throw new AccessError("No open acknowledgement for this version", 409);
      await audit(c, a, "document." + b.status.toLowerCase(), d.id, {
        version: d.current_version,
        hash: r.rows[0].content_hash,
        acknowledgement: r.rows[0].id,
      });
      return respond({ ok: true });
    });
  } catch (e) {
    return errorResponse(e);
  }
}
