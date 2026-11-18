// UI fixtures and blank synthetic video only. No employee biometric data.
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const children = [],
  base = "http://127.0.0.1:3189",
  out = "/tmp/aerotech-face-mobile";
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
      "3189",
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
  const ctx = await browser.newContext();
  await ctx.addCookies([
    {
      name: "aerotech_employee_session",
      value: "phase2-test-employee",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  const page = await ctx.newPage();
  await page.route("**/api/employee/face/templates", (r) =>
    r.fulfill({
      json: {
        enabled: true,
        enrolled: true,
        enrollment: null,
        geofence: false,
        requests: [],
      },
    }),
  );
  const results = [];
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const [path, heading] of [
      ["/employee/face-enroll", "Set up face attendance"],
      ["/employee/face-attendance", "Face check-in"],
      ["/employee/face-attendance?action=clock_out", "Face check-out"],
    ]) {
      await page.goto(base + path);
      await page.getByRole("heading", { name: heading, exact: true }).waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const axe = await new AxeBuilder({ page })
        .include(".face-workspace")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        axe.violations.map((v) => v.id),
        [],
      );
      await page.screenshot({
        path: out + "/" + width + "-" + heading.replaceAll(" ", "-") + ".png",
        fullPage: true,
      });
      results.push({ width, path, axeViolations: 0, overflow: false });
    }
  }
  await page.goto(base + "/employee/face-enroll");
  await page
    .getByText("Ready. Camera frames stay on this device.", { exact: true })
    .waitFor();
  await page
    .getByLabel("I have read this notice and consent to face enrollment.", {
      exact: true,
    })
    .check();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          throw new DOMException("Denied", "NotAllowedError");
        },
      },
    });
  });
  await page
    .getByRole("button", { name: "Open front camera", exact: true })
    .click();
  await page
    .locator(".face-status")
    .filter({ hasText: "Camera permission denied" })
    .waitFor();
  // Load the real local model bundle and process a blank canvas: it must find no faces.
  const model = await page.evaluate(async () => {
    const api = await import("/models/face-api.esm.js");
    await Promise.all(
      [
        api.nets.tinyFaceDetector,
        api.nets.faceLandmark68Net,
        api.nets.faceRecognitionNet,
        api.nets.faceExpressionNet,
      ].map((n) => n.loadFromUri("/models")),
    );
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const c = canvas.getContext("2d");
    c.fillStyle = "#888";
    c.fillRect(0, 0, 640, 480);
    return (
      await api.detectAllFaces(
        canvas,
        new api.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.65,
        }),
      )
    ).length;
  });
  assert.equal(model, 0);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = 640;
          canvas.height = 480;
          const c = canvas.getContext("2d");
          c.fillStyle = "#888";
          c.fillRect(0, 0, 640, 480);
          window.__faceTestStream = canvas.captureStream(10);
          return window.__faceTestStream;
        },
      },
    });
  });
  await page
    .getByRole("button", { name: "Open front camera", exact: true })
    .click();
  await page
    .getByText("No face found. Face the camera in good light.", { exact: true })
    .waitFor({ timeout: 60000 });
  await page.getByRole("dialog").press("Escape");
  assert.equal(
    await page.evaluate(() =>
      window.__faceTestStream
        .getTracks()
        .every((t) => t.readyState === "ended"),
    ),
    true,
  );
  results.push({
    permissionDenied: true,
    realModelsLoad: true,
    blankFrameRejected: true,
    cameraTracksStopped: true,
  });
  await writeFile(out + "/results.json", JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: true, results }, null, 2));
} catch (e) {
  console.error(e);
  for (const c of children) console.error(c.logs().slice(-3000));
  process.exitCode = 1;
} finally {
  await browser?.close();
  for (const c of children) c.kill("SIGTERM");
}
