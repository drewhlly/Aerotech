// All local processes share a network namespace. Uses only synthetic fixtures.
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
const processes = [];
function start(command, args, env, log) {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const out = createWriteStream(log);
  child.stdout.pipe(out);
  child.stderr.pipe(out);
  child.ready = false;
  child.stdout.on("data", (d) => {
    if (d.toString().includes("Isolated socket ready")) child.ready = true;
  });
  processes.push(child);
  return child;
}
async function run(command, args) {
  const child = spawn(command, args, { env: process.env, stdio: "inherit" });
  return await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) => resolve(code));
  });
}
try {
  const database = start(
    "node",
    ["scripts/phase2-test-db.mjs"],
    {},
    "/tmp/automation-db-suite.log",
  );
  for (let i = 0; i < 60; i++) {
    if (database.ready) break;
    await delay(500);
  }
  start(
    "node",
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3100",
    ],
    {
      DATABASE_URL: "postgres://test:test@127.0.0.1:55432/postgres",
      NODE_OPTIONS: "--require ./scripts/pglite-pool-preload.cjs",
      DOCUMENT_ENCRYPTION_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    },
    "/tmp/automation-server-suite.log",
  );
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if (
        (
          await fetch("http://127.0.0.1:3100", {
            signal: AbortSignal.timeout(3000),
          })
        ).ok
      ) {
        ready = true;
        break;
      }
    } catch {}
    await delay(500);
  }
  if (!ready)
    throw Error(
      "Local application did not start. See /tmp/automation-server-suite.log",
    );
  process.exitCode = await run("node", [process.env.AUTOMATION_BROWSER_SCRIPT || "scripts/verify-automation-workflows.mjs"]);
  if (process.env.OUTSTANDING_LIGHTHOUSE === "1")
    process.exitCode = (await run("node", ["scripts/lighthouse-outstanding.mjs"])) || process.exitCode;
  if (process.env.PHASE2_LIGHTHOUSE === "1")
    process.exitCode =
      (await run("node", ["scripts/phase2-lighthouse.mjs"])) ||
      process.exitCode;
} finally {
  for (const child of processes) child.kill("SIGTERM");
}
