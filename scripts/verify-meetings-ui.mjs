// UI fixtures and blank synthetic video only. No employee biometric data.
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const children = [],
  base = "http://127.0.0.1:3194",
  out = "/tmp/aerotech-meetings-ui";
let browser;
await mkdir(out, { recursive: true });
function start(args, env = {}) {
  const p = spawn(process.execPath, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  p.stdout.on("data", (d) => (log += d));
  p.stderr.on("data", (d) => (log += d));
  p.logs = () => log;
  children.push(p);
  return p;
}
try {
  const db = start(["scripts/phase2-test-db.mjs"]);
  for (
    let i = 0;
    i < 120 && !db.logs().includes("Isolated socket ready");
    i++
  ) {
    if (db.exitCode !== null) throw Error(db.logs());
    await delay(500);
  }
  assert.ok(db.logs().includes("Isolated socket ready"));
  const server = start(
    [
      "--require",
      "./scripts/pglite-pool-preload.cjs",
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3194",
    ],
    {
      DATABASE_URL: "postgres://test:test@127.0.0.1:55432/postgres",
      DOCUMENT_ENCRYPTION_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    },
  );
  let ready = false;
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(base + "/auth/login")).ok) {
        ready = true;
        break;
      }
    } catch {}
    if (server.exitCode !== null) throw Error(server.logs());
    await delay(500);
  }
  assert.ok(ready);
  browser = await chromium.launch({ headless: true });
  const results = [];
  let kind = "video", meetingMode="built_in";
  for (const [role, root, cookie] of [
    ["employer", "/dashboard/employer", "phase2-test-employer"],
    ["employee", "/employee", "phase2-test-employee"],
    ["applicant", "/applicant", "phase2-test-applicant"],
  ]) {
    const ctx = await browser.newContext();
    await ctx.addCookies([
      {
        name: "aerotech_" + role + "_session",
        value: cookie,
        domain: "127.0.0.1",
        path: "/",
      },
    ]);
    const page = await ctx.newPage();
    await page.route("**/api/meet**", async (r) => {
      const u = new URL(r.request().url());
      if(u.pathname.endsWith("/usage"))return r.fulfill({json:{enabled:true,quota:500,used:0,reserved:0,warning:false,configurationMessage:null}});
      if (u.pathname.endsWith("/join"))
        return r.fulfill({
          status: r.request().method() === "POST" && meetingMode!=="external_link" ? 202 : 200,
          json:
            r.request().method() === "POST"
              ? (meetingMode==="external_link"?{mode:"external_link",externalUrl:"https://meet.google.com/qa-only-qa"}:{ waiting: true, message: "Waiting for the host to admit you." })
              : {
                  state: "open",
                  id: "11111111-1111-4111-8111-111111111111",
                  title: "Synthetic team call",
                  type: kind,
                  mode:meetingMode,
                  name: "Test Participant",
                  host: role === "employer",
                  status: "invited",
                  admitted: role === "employer",
                  configured: true,
                  expiresAt: Date.now() + 3600000,
                },
        });
      if (u.pathname.endsWith("/lobby"))
        return r.fulfill({ json: { waiting: [] } });
      if (u.pathname.endsWith("/applications"))
        return r.fulfill({ json: { applications: [] } });
      if (
        u.pathname.endsWith("/people") ||
        u.pathname.endsWith("/groups") ||
        u.pathname.endsWith("/selection")
      )
        return r.fulfill({ json: { records: [], total: 0, hasMore: false } });
      return r.fulfill({
        status: r.request().method() === "POST" ? 201 : 200,
        json:
          r.request().method() === "POST"
            ? { id: "11111111-1111-4111-8111-111111111111" }
            : { meetings: [], role },
      });
    });
    for (const width of [360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const suffix of [
        "/meet",
        "/meet/11111111-1111-4111-8111-111111111111",
      ]) {
        await page.goto(base + root + suffix);
        await page
          .getByRole("heading", {
            name: suffix === "/meet" ? "Meetings" : "Meeting room",
            exact: true,
          })
          .waitFor();
        if (suffix != "/meet")
          await page.getByLabel("Confirm your name", { exact: true }).waitFor();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        const axe = await new AxeBuilder({ page })
          .include(
            suffix === "/meet" ? ".workspace-content" : ".meet-workspace",
          )
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        assert.deepEqual(
          axe.violations
            .filter((v) => v.impact === "serious" || v.impact === "critical")
            .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
        );
        await page.screenshot({
          path:
            out +
            "/" +
            role +
            "-" +
            width +
            (suffix === "/meet" ? "-dashboard" : "-prejoin") +
            ".png",
          fullPage: true,
        });
        results.push({
          role,
          width,
          page: suffix === "/meet" ? "dashboard" : "prejoin",
          overflow: false,
          seriousAxeViolations: 0,
        });
      }
    }
    // No real devices or Daily/media requests. Explicit permission denial and track cleanup.
    await page.evaluate(() =>
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async () => {
            throw new DOMException("Denied", "NotAllowedError");
          },
        },
      }),
    );
    await page
      .getByRole("button", { name: "Check camera & microphone", exact: true })
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: "Cannot access camera or microphone." })
      .waitFor();
    await page.evaluate(() =>
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async (constraints) => {
            window.__meetingConstraints = constraints;
            const c = document.createElement("canvas");
            c.width = 640;
            c.height = 480;
            c.getContext("2d").fillRect(0, 0, 640, 480);
            window.__meetingStream = c.captureStream(10);
            return window.__meetingStream;
          },
        },
      }),
    );
    await page
      .getByRole("button", { name: "Check camera & microphone", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Stop preview", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Stop preview", exact: true })
      .click();
    assert.equal(
      await page.evaluate(() =>
        window.__meetingStream
          .getTracks()
          .every((t) => t.readyState === "ended"),
      ),
      true,
    );
    if (role !== "employer") {
      await page
        .getByRole("button", { name: "Join meeting", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Waiting for host…", exact: true })
        .waitFor();
    }
    kind = "audio";
    await page.reload();
    await page
      .getByRole("button", { name: "Check microphone", exact: true })
      .waitFor();
    await page.evaluate(() =>
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: async (constraints) => {
            window.__meetingConstraints = constraints;
            const c = document.createElement("canvas");
            window.__meetingStream = c.captureStream(1);
            return window.__meetingStream;
          },
        },
      }),
    );
    await page
      .getByRole("button", { name: "Check microphone", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Stop preview", exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(() => window.__meetingConstraints.video),
      false,
    );
    await page
      .getByRole("button", { name: "Stop preview", exact: true })
      .click();
    const dark = page.getByRole("button", {
      name: "Use dark mode",
      exact: true,
    });
    if (await dark.count()) {
      await dark.click();
      const a = await new AxeBuilder({ page })
        .include(".meet-workspace")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      assert.deepEqual(
        a.violations
          .filter((v) => v.impact === "serious" || v.impact === "critical")
          .map((v) => v.id),
        [],
      );
    }
    results.push({
      role,
      permissionDenied: true,
      previewCleanup: true,
      audioOnlyNoCamera: true,
      waitingLobby: role !== "employer",
    });
    meetingMode='external_link';await page.reload();await page.getByRole('button',{name:'Confirm invitation',exact:true}).click();await page.getByRole('link',{name:'Open meeting link',exact:true}).waitFor();assert.equal(await page.locator('video').count(),0);meetingMode='built_in';
    kind = "video";
    await ctx.close();
  }
  await writeFile(out + "/results.json", JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: true, results }, null, 2));
} catch (e) {
  console.error(e);
  for (const c of children) console.error(c.logs().slice(-2500));
  process.exitCode = 1;
} finally {
  await browser?.close();
  for (const c of children) c.kill("SIGTERM");
}
