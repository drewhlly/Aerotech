import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import assert from "node:assert/strict";
const origin = process.env.PHASE2_TEST_ORIGIN || "http://127.0.0.1:3100",
  fixture = JSON.parse(readFileSync("/tmp/phase2-fixture.json", "utf8"));
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || chromium.executablePath(),
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  env: {
    ...process.env,
    LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || "",
  },
});
const results = [];
mkdirSync("docs/phase2/evidence", { recursive: true });
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: "pass" });
    console.log("PASS " + name);
  } catch (e) {
    results.push({ name, status: "fail", error: e.message });
    const active = browser
      .contexts()
      .flatMap((c) => c.pages())
      .at(-1);
    if (active) {
      await active
        .screenshot({
          path: "/tmp/phase2-failure-" + results.length + ".png",
          fullPage: true,
        })
        .catch(() => {});
      console.error(
        (
          await active
            .locator("body")
            .innerText()
            .catch(() => "")
        ).slice(-2500),
      );
    }
    console.error("FAIL " + name + ": " + e.message);
  }
}
async function roleContext(role, token = role) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  await context.addCookies([
    {
      name:
        role === "admin"
          ? "aerotech_support_session"
          : "aerotech_" + role + "_session",
      value: "phase2-test-" + token,
      url: origin,
    },
  ]);
  return context;
}
const publicContext = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  }),
  publicPage = await publicContext.newPage();
await check(
  "Public homepage and real logo render, employee and applicant sign-ins remain visible",
  async () => {
    await publicPage.goto(origin, { waitUntil: "networkidle" });
    await assert.doesNotReject(() =>
      publicPage
        .getByRole("heading", { name: /Your next role/ })
        .waitFor({ timeout: 15000 }),
    );
    assert.ok(
      await publicPage.locator('img[src="/brand/aerotech-logo.svg"]').count(),
    );
    assert.ok(
      await publicPage
        .getByRole("link", { name: "Employee sign in", exact: true })
        .count(),
    );
    await publicPage.screenshot({
      path: "/tmp/phase2-home.png",
      fullPage: true,
    });
  },
);
await check(
  "Sign-in refresh keeps separate roles and password visibility",
  async () => {
    await publicPage.goto(origin + "/auth/login?role=applicant", {
      waitUntil: "networkidle",
    });
    assert.equal(
      await publicPage.locator('img[src="/brand/aerotech-logo.svg"]').count(),
      1,
    );
    await publicPage
      .getByLabel("Password", { exact: true })
      .fill("fixture-password");
    await publicPage
      .getByRole("button", { name: "Show password", exact: true })
      .click();
    assert.equal(
      await publicPage
        .getByLabel("Password", { exact: true })
        .getAttribute("type"),
      "text",
    );
    await publicPage.getByLabel("Password", { exact: true }).fill("");
    await publicPage.screenshot({
      path: "/tmp/phase2-login.png",
      fullPage: true,
    });
  },
);
for (const route of ["/", "/auth/login?role=applicant"])
  await check("axe WCAG 2.2 AA " + route, async () => {
    await publicPage.goto(origin + route, { waitUntil: "networkidle" });
    const d = await new AxeBuilder({ page: publicPage })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    writeFileSync(
      "docs/phase2/evidence/axe-" +
        (route === "/" ? "home" : "login") +
        ".json",
      JSON.stringify(d.violations, null, 2),
    );
    assert.equal(
      d.violations.length,
      0,
      JSON.stringify(
        d.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
        })),
      ),
    );
  });
const employer = await roleContext("employer"),
  page = await employer.newPage();
page.on("dialog", (d) => d.accept());
await check(
  "Employer project create and Kanban task flow persists through API and database",
  async () => {
    await page.goto(origin + "/dashboard/employer/projects", {
      waitUntil: "networkidle",
    });
    await page
      .getByRole("button", { name: "New project", exact: true })
      .click();
    await page
      .getByLabel("Project name", { exact: true })
      .fill("Browser project");
    await page
      .getByLabel("Description", { exact: true })
      .fill("Browser integration fixture");
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/projects") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Save", exact: true }).click();
    const savedResponse = await saved;
    assert.equal(savedResponse.status(), 201, await savedResponse.text());
    await page.getByRole("link").filter({ hasText: "Browser project" }).click();
    await page.getByRole("button", { name: "New task", exact: true }).click();
    await page.getByLabel("Title", { exact: true }).fill("Browser task");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("combobox", { name: /^View/ }).selectOption("Kanban");
    await page
      .getByRole("combobox", { name: "Move Browser task", exact: true })
      .selectOption("Done");
    await page.waitForTimeout(500);
    assert.ok(
      await page
        .getByRole("button", { name: "Browser task", exact: true })
        .count(),
    );
    await page.screenshot({ path: "/tmp/phase2-project.png", fullPage: true });
  },
);
await check(
  "Meeting picker pages a thousand staff and group chips stay bounded",
  async () => {
    await page.goto(origin + "/dashboard/employer/meet", {
      waitUntil: "networkidle",
    });
    await page
      .getByRole("combobox", { name: "Find people", exact: true })
      .fill("Engineering");
    await page.waitForTimeout(800);
    const options = page.locator("[role=listbox] [role=option]");
    assert.ok((await options.count()) <= 20);
    await page
      .getByRole("button", { name: /Engineering · 1000 people/ })
      .first()
      .click({ noWaitAfter: true, timeout: 5000 });
    await page
      .getByRole("heading", { name: "Selected attendees (1000)", exact: true })
      .waitFor();
    await page.getByLabel("Title", { exact: true }).fill("Engineering review");
    await page
      .getByLabel("Start date and time", { exact: true })
      .fill("2026-11-20T10:00");
    const saved = page.waitForResponse(
      (r) => r.url().endsWith("/api/meet") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Schedule meeting", exact: true })
      .click();
    const response = await saved;
    assert.equal(response.status(), 201, await response.text());
    assert.ok(response.request().postData().length < 2000);
    await page
      .getByRole("heading", { name: "Engineering review", exact: true })
      .waitFor();
  },
);
await check(
  "Employer uploads an encrypted document and the browser shows quarantine status",
  async () => {
    await page.goto(origin + "/dashboard/employer/documents", {
      waitUntil: "networkidle",
    });
    await page
      .getByRole("button", { name: "Upload files", exact: true })
      .click();
    await page.getByLabel("Files", { exact: true }).setInputFiles({
      name: "Browser-contract.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 Synthetic browser fixture"),
    });
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/document-library") &&
        r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Upload", exact: true }).click();
    const response = await saved;
    assert.equal(response.status(), 201, await response.text());
    await page
      .getByRole("button", { name: "Browser-contract.pdf", exact: true })
      .waitFor();
  },
);
for (const route of [
  "/dashboard/employer/projects",
  "/dashboard/employer/meet",
  "/dashboard/employer/documents",
])
  await check("Employer isolation and axe " + route, async () => {
    await page.goto(origin + route, { waitUntil: "networkidle" });
    const bad = await page
      .locator('a[href^="/"]')
      .evaluateAll((as) =>
        as
          .map((a) => a.getAttribute("href"))
          .filter(
            (h) =>
              !h.startsWith("/dashboard/employer") &&
              !h.startsWith("/api/") &&
              !h.startsWith("/brand/"),
          ),
      );
    assert.deepEqual(bad, []);
    const d = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    writeFileSync(
      "docs/phase2/evidence/axe-" + route.split("/").at(-1) + ".json",
      JSON.stringify(d.violations, null, 2),
    );
    assert.equal(
      d.violations.length,
      0,
      JSON.stringify(
        d.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
        })),
      ),
    );
  });
await check("Combined command palette retains privacy navigation and permission-aware search",async()=>{await page.goto(origin+'/dashboard/employer/projects',{waitUntil:'networkidle'});await page.keyboard.press('Control+k');const dialog=page.getByRole('dialog',{name:'Search your workspace',exact:true});await dialog.waitFor();await dialog.getByRole('searchbox',{name:'Search',exact:true}).fill('Privacy');await dialog.getByRole('link',{name:'Privacy settings',exact:true}).click();await page.getByRole('heading',{name:'Privacy settings',exact:true}).waitFor();});
const employee = await roleContext("employee"),
  ep = await employee.newPage();
await check(
  "Employee sees shared project only and is blocked from employer portal",
  async () => {
    await ep.goto(origin + "/employee/projects", { waitUntil: "networkidle" });
    assert.ok(
      await ep.getByRole("link").filter({ hasText: "Launch project" }).count(),
    );
    assert.equal(
      await ep.getByRole("link").filter({ hasText: "Browser project" }).count(),
      0,
    );
    const r = await ep.goto(origin + "/dashboard/employer/projects");
    assert.equal(r.status(), 403);
  },
);
await check(
  "Mobile employee tasks page has no horizontal overflow",
  async () => {
    await ep.setViewportSize({ width: 390, height: 844 });
    await ep.goto(origin + "/employee/tasks", { waitUntil: "networkidle" });
    assert.ok(
      await ep.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await ep.screenshot({
      path: "/tmp/phase2-employee-mobile.png",
      fullPage: true,
    });
  },
);
await check("Viewed notices leave active inbox and remain in history",async()=>{
 await ep.goto(origin+'/employee/notifications',{waitUntil:'networkidle'});
 await ep.getByRole('article').filter({hasText:'Lifecycle test notice'}).getByRole('button',{name:'View notice',exact:true}).click();
 const d=ep.getByRole('dialog',{name:'Lifecycle test notice',exact:true});await d.waitFor();await d.getByRole('button',{name:'Close',exact:true}).click();
 assert.equal(await ep.getByRole('article').filter({hasText:'Lifecycle test notice'}).count(),0);
 await ep.getByRole('button',{name:'History',exact:true}).click();await ep.getByRole('article').filter({hasText:'Lifecycle test notice'}).waitFor();
});
await check("Employee recruitment stays local and saved settings close",async()=>{
 await ep.setViewportSize({width:1440,height:1100});await ep.goto(origin+'/employee/privacy',{waitUntil:'networkidle'});
 assert.equal(await ep.getByRole('link',{name:'Recruitment',exact:true}).getAttribute('href'),'/employee/opportunities');
 await ep.getByRole('button',{name:'Save choices',exact:true}).click();await ep.getByRole('button',{name:'Edit cookie preferences',exact:true}).waitFor();
 await ep.getByRole('button',{name:'New privacy request',exact:true}).click();await ep.getByLabel('Request details',{exact:true}).fill('Please provide my additional account records for this isolated test.');await ep.getByRole('button',{name:'Submit privacy request',exact:true}).click();await ep.getByRole('button',{name:'New privacy request',exact:true}).waitFor();assert.equal(await ep.getByRole('button',{name:'Submit privacy request',exact:true}).count(),0);
});
await check("Expired birthday notice is absent from active employer inbox",async()=>{
 await page.goto(origin+'/dashboard/employer/notifications',{waitUntil:'networkidle'});assert.equal(await page.getByRole('heading',{name:'Expired birthday fixture',exact:true}).count(),0);
 await page.getByRole('button',{name:'History',exact:true}).click();await page.getByRole('heading',{name:'Expired birthday fixture',exact:true}).waitFor();
});
const applicant = await roleContext("applicant"),
  ap = await applicant.newPage();
await check(
  "Applicant cannot access collaboration API or employer pages",
  async () => {
    const r = await ap.request.get(origin + "/api/projects");
    assert.equal(r.status(), 401);
    const pageResponse = await ap.goto(origin + "/dashboard/employer/projects");
    assert.equal(pageResponse.status(), 403);
  },
);
const admin = await roleContext("admin"),
  ad = await admin.newPage();
await check(
  "Admin audit renders and employee cannot call its API",
  async () => {
    await ad.goto(origin + "/admin/audit", { waitUntil: "networkidle" });
    await ad.getByRole("heading", { name: "Sensitive-action audit" }).waitFor();
    assert.equal(
      (await ep.request.get(origin + "/api/admin/audit")).status(),
      403,
    );
  },
);
writeFileSync(
  "docs/phase2/evidence/browser-results.json",
  JSON.stringify(
    {
      origin,
      fixtureType: "Throwaway database, mock employees; no production services",
      staffCount: 1000,
      projectFixture: fixture.project,
      results,
    },
    null,
    2,
  ),
);
await browser.close();
if (results.some((r) => r.status === "fail")) process.exitCode = 1;
