import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { readFileSync } from "node:fs";
const compiled = ts.transpileModule(
  readFileSync("src/lib/face-policy.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const p = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);
const vec = Array(128).fill(0.03),
  motion = [
    { at: 0, eye: 0.3, yaw: 0, smile: 0.1 },
    { at: 400, eye: 0.3, yaw: 0, smile: 0.1 },
    { at: 800, eye: 0.14, yaw: 0, smile: 0.1 },
    { at: 1200, eye: 0.15, yaw: 0, smile: 0.1 },
    { at: 1600, eye: 0.3, yaw: 0, smile: 0.1 },
    { at: 2200, eye: 0.3, yaw: 0, smile: 0.1 },
  ];
test("descriptor validation rejects malformed, non-finite and zero inputs", () => {
  assert.ok(p.validEmbedding(vec));
  for (const v of [
    [],
    Array(127).fill(0.1),
    Array(128).fill(0),
    [NaN, ...vec.slice(1)],
    [Infinity, ...vec.slice(1)],
    [".1", ...vec.slice(1)],
  ])
    assert.equal(p.validEmbedding(v), false);
});
test("strict and uncertain distance boundaries are explicit; invalid config fails closed", () => {
  assert.equal(p.classifyDistance(0.45), "match");
  assert.equal(p.classifyDistance(0.451), "uncertain");
  assert.equal(p.classifyDistance(0.5), "uncertain");
  assert.equal(p.classifyDistance(0.501), "reject");
  assert.equal(p.classifyDistance(NaN), "reject");
  assert.equal(p.faceSettings({ FACE_MATCH_THRESHOLD: "99" }).threshold, 0.45);
  assert.equal(p.faceSettings({}).enabled, false);
  assert.equal(
    p.faceSettings({ FACE_BROWSER_REVIEW_REQUIRED: "false" }).reviewRequired,
    true,
  );
});
test("server-selected clock controls day, duplicate, order and overnight handling", () => {
  const now = new Date("2026-11-18T00:30:00Z"),
    ci = {
      event_type: "clock_in",
      work_date: "2026-11-17",
      event_time: "2026-11-17T20:00:00Z",
    };
  assert.equal(p.attendanceOrder("clock_in", [], now), "2026-11-18");
  assert.throws(() => p.attendanceOrder("clock_out", [], now), /Check in/);
  assert.throws(() => p.attendanceOrder("clock_in", [ci], now), /already/);
  assert.equal(p.attendanceOrder("clock_out", [ci], now), "2026-11-17");
  assert.throws(
    () =>
      p.attendanceOrder(
        "clock_in",
        [{ ...ci, event_time: "2026-11-16T00:00:00Z" }],
        now,
      ),
    /Missed check-out/,
  );
  assert.throws(
    () =>
      p.attendanceOrder(
        "clock_in",
        [
          { ...ci, work_date: "2026-11-18" },
          { event_type: "clock_out", work_date: "2026-11-18", event_time: now },
        ],
        now,
      ),
    /already/,
  );
});
test("random challenge needs neutral-change-neutral, timing bounds and ordered evidence", () => {
  assert.equal(p.validateMotion("blink", motion, 3000), true);
  assert.equal(
    p.validateMotion(
      "blink",
      motion.map((f) => ({ ...f, eye: 0.3 })),
      3000,
    ),
    false,
  );
  assert.equal(p.validateMotion("blink", motion, 46000), false);
  assert.equal(p.validateMotion("blink", motion, 1500), false);
  assert.equal(
    p.validateMotion("blink", [...motion.slice(0, 5), motion[0]], 3000),
    false,
  );
  assert.equal(p.validateMotion("left", motion, 3000), false);
});
test("three failures lock and the lock expires using server time", () => {
  const now = new Date("2026-11-18T10:00:00Z");
  assert.equal(p.retryState(2, null, now).lock, true);
  assert.equal(
    p.retryState(0, new Date("2026-11-18T10:05:00Z"), now).locked,
    true,
  );
  assert.equal(
    p.retryState(0, new Date("2026-11-18T09:59:00Z"), now).locked,
    false,
  );
});
