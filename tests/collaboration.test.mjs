import test from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import {
  joinWindow,
  taskProgress,
  mayWrite,
  csv,
  resolveSelection,
  pageBounds,
} from "../src/lib/collaboration-policy.ts";
import {
  encryptDocument,
  decryptDocument,
  signDownload,
  verifyDownload,
  documentMime,
} from "../src/lib/document-crypto.ts";
import { textPDF } from "../src/lib/simple-pdf.ts";
test("meeting window closes server-side at exact expiry and cancellation takes precedence", () => {
  const start = Date.parse("2026-11-01T09:00:00Z"),
    m = { starts_at: new Date(start), duration_minutes: 60 };
  assert.equal(joinWindow(m, start - 900001).state, "upcoming");
  assert.equal(joinWindow(m, start - 900000).state, "open");
  assert.equal(joinWindow(m, start + 3900000).state, "expired");
  assert.equal(
    joinWindow({ ...m, status: "cancelled" }, start).state,
    "expired",
  );
  assert.equal(joinWindow({ ...m, revoked_at: true }, start).state, "expired");
});
test("viewer cannot mutate; only project owners/managers maintain structure", () => {
  assert.equal(mayWrite("Viewer"), false);
  assert.equal(mayWrite(null), false);
  assert.equal(mayWrite("Contributor"), true);
  assert.equal(mayWrite("Contributor", true), false);
  assert.equal(mayWrite("Manager", true), true);
});
test("project health, progress and cancellation are computed from actual task state", () => {
  assert.deepEqual(
    taskProgress([{ status: "Done" }, { status: "Cancelled" }]),
    { progress: 100, overdue: 0, health: "On track" },
  );
  assert.equal(taskProgress([{ status: "Blocked" }]).health, "At risk");
  assert.equal(
    taskProgress([{ status: "To Do", due_at: "2000-01-01" }]).health,
    "Overdue",
  );
});
test("1000 employee group selection deduplicates and honors exclusions within a bounded CPU budget", () => {
  const people = Array.from({ length: 1000 }, (_, i) => ({
    id: "person" + i,
    department: i % 2 ? "Engineering" : "Finance",
  }));
  const start = performance.now(),
    selected = resolveSelection(
      people,
      ["person0", "person1"],
      ["Engineering"],
      ["person1"],
    );
  assert.equal(selected.length, 500);
  assert.equal(new Set(selected).size, selected.length);
  assert.ok(performance.now() - start < 100);
  assert.equal(selected.includes("person1"), false);
  assert.equal(
    pageBounds(new URL("https://example.test?limit=100000")).limit,
    100,
  );
});
test("encrypted versions cannot be decrypted across companies; signed grants bind user version and expiry", () => {
  process.env.DOCUMENT_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  const bytes = Buffer.from("%PDF-private"),
    encrypted = encryptDocument(bytes, "tenantA:doc:1");
  assert.ok(!encrypted.includes(bytes));
  assert.deepEqual(decryptDocument(encrypted, "tenantA:doc:1"), bytes);
  assert.throws(() => decryptDocument(encrypted, "tenantB:doc:1"));
  const now = Date.now(),
    expiry = now + 120000,
    sig = signDownload("a:doc:1:employee1", expiry);
  assert.equal(verifyDownload("a:doc:1:employee1", expiry, sig, now), true);
  assert.equal(verifyDownload("a:doc:1:employee2", expiry, sig, now), false);
  assert.equal(verifyDownload("a:doc:2:employee1", expiry, sig, now), false);
  assert.equal(verifyDownload("a:doc:1:employee1", expiry, sig, expiry), false);
});
test("safe exports neutralise formula injection and escape PDF syntax", () => {
  assert.ok(csv(["title"], [['=IMPORTXML("x")']]).includes("'=IMPORTXML"));
  const pdf = textPDF("A (B)", ["evil ) Tj (" + "x".repeat(300)]).toString();
  assert.ok(pdf.startsWith("%PDF-1.4"));
  assert.ok(pdf.endsWith("%%EOF"));
  assert.ok(pdf.includes("A \\(B\\)"));
  assert.equal(documentMime(Buffer.from("<html>"), "fake.pdf"), null);
});

test("mutation origin comparison uses requested authority and rejects foreign hosts, schemes and ports", async () => {
  const { sameOrigin } = await import("../src/lib/collaboration-policy.ts");
  assert.equal(
    sameOrigin("http://127.0.0.1:3100", "127.0.0.1:3100", "http:"),
    true,
  );
  assert.equal(
    sameOrigin("https://evil.test", "aerotechhr.app", "https:"),
    false,
  );
  assert.equal(
    sameOrigin("http://aerotechhr.app", "aerotechhr.app", "https:"),
    false,
  );
  assert.equal(
    sameOrigin("http://localhost:3000", "localhost:3100", "http:"),
    false,
  );
  assert.equal(sameOrigin("null", "aerotechhr.app", "https:"), false);
});
