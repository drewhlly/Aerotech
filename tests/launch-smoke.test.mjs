import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("employer signup is reachable from the home page", () => {
  assert.ok(read("src/app/page.tsx").includes("/auth/signup/employer"));
  assert.ok(existsSync(new URL("../src/app/auth/signup/employer/page.tsx", import.meta.url)));
});

test("job seekers can reach the jobs page", () => {
  assert.match(read("src/components/aerotech-portal.tsx"), /href="\/jobs"/);
  assert.ok(existsSync(new URL("../src/app/jobs/page.tsx", import.meta.url)));
});

test("home links to dedicated solutions and the shared navigation serves every audience", () => {
  assert.match(read("src/app/page.tsx"), /href="\/solutions"/);
  const solutions=read("src/app/solutions/page.tsx");
  for(const module of ["Recruitment","Learning","Attendance","Payroll","compliance"]) assert.ok(solutions.toLowerCase().includes(module.toLowerCase()));
  const nav=read("src/components/site-navigation.tsx");
  for(const portal of ["/dashboard","/employee","/applicant"]) assert.ok(nav.includes(portal));
});

test("unknown job IDs do not display another vacancy", () => {
  const details = read("src/app/jobs/[id]/page.tsx");
  assert.match(details, /if \(!job\) notFound\(\)/);
  assert.doesNotMatch(details, /\?\? jobs\[0\]/);
});

test("jobs require a registered applicant session", () => {
  const gate = read("src/app/jobs/layout.tsx");
  assert.match(gate, /currentApplicant/);
  assert.match(gate, /redirect\("\/careers"\)/);
});

test("applicant registration is free and submits to backend", () => {
  const signup = read("src/app/auth/signup/employee/page.tsx");
  assert.match(signup, /\/api\/auth\/signup\/applicant/);
  assert.match(signup, /Create free account/);
  assert.ok(existsSync(new URL("../src/app/api/auth/signup/applicant/route.ts", import.meta.url)));
});

test("Aerotech AI screens use the real API rather than canned replies", () => {
  for (const path of ["src/app/dashboard/employer/ai/page.tsx", "src/components/aerotech-ui.tsx"]) {
    const source=read(path);
    assert.match(source, /fetch\("\/api\/ai\/ask"/);
  }
  const route=read("src/app/api/ai/ask/route.ts");
  assert.match(route, /OPENAI_API_KEY/);
  assert.match(route, /currentEmployer/);
  assert.match(route, /api\.openai\.com\/v1\/responses/);
});

test("employee directory and profile use matching IDs and source", () => {
 const directory=read("src/app/dashboard/employer/employees/page.tsx");
 const profile=read("src/app/dashboard/employer/employees/[id]/page.tsx");
 const directoryApi=read("src/app/api/employees/route.ts");
 const profileApi=read("src/app/api/employees/[id]/route.ts");
 assert.match(directory, /fetch\("\/api\/employees"\)/);
 assert.match(directory, /setEmployees\(d\.employees\)/);
 assert.ok(directory.includes('href={`/dashboard/employer/employees/${e.id}`}'));
 assert.match(profile, /const id=params\.id/);
 assert.ok(profile.includes('fetch(`/api/employees/${encodeURIComponent(id)}`)'));
 assert.match(profile, /setEmployee\(d\.employee\)/);
 assert.match(directoryApi, /FROM workforce_employees WHERE employer_id=\$1/);
 assert.match(directoryApi, /employees:r\.rows/);
 assert.match(profileApi, /FROM workforce_employees WHERE id=\$1 AND employer_id=\$2/);
 assert.match(profileApi, /\[id,employerId\]/);
 assert.match(profileApi, /employee:r\.rows\[0\]/);
 for (const source of [directory, profile]) {
  assert.doesNotMatch(source, /employerOSData\.workforce|getEmployee\(/);
 }
});
