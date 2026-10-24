import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("employer signup is reachable from the home page", () => {
  assert.match(read("src/app/page.tsx"), /href="\/auth\/signup\/employer"/);
  assert.ok(existsSync(new URL("../src/app/auth/signup/employer/page.tsx", import.meta.url)));
});

test("job seekers can reach the jobs page", () => {
  assert.match(read("src/app/page.tsx"), /href="\/jobs"/);
  assert.ok(existsSync(new URL("../src/app/jobs/page.tsx", import.meta.url)));
});

test("home page introduces the essential workforce modules", () => {
  const home = read("src/app/page.tsx");
  for (const module of ["Workforce", "Recruitment", "Payroll", "Training", "Attendance", "Compliance", "AI"]) {
    assert.ok(home.includes(`"${module}"`), `Missing module: ${module}`);
  }
});

test("unknown job IDs do not display another vacancy", () => {
  const details = read("src/app/jobs/[id]/page.tsx");
  assert.match(details, /if \(!job\) notFound\(\)/);
  assert.doesNotMatch(details, /\?\? jobs\[0\]/);
});
