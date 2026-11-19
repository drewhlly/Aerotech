// Synthetic canary only. Never uses or prints any real hosting secret.
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
const canary = randomBytes(32).toString("hex"),
  env = {
    ...process.env,
    DAILY_API_KEY: canary,
    DAILY_DOMAIN: "build-fixture.daily.co",
    MEETING_BUILT_IN_ENABLED: "true",
  };
for (const k of [
  "DATABASE_URL",
  "RESEND_API_KEY",
  "DOCUMENT_ENCRYPTION_KEY",
  "PAYSTACK_SECRET_KEY",
])
  delete env[k];
const run = spawnSync("npm", ["run", "build"], {
  env,
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});
// The random canary may never appear in build logs either.
if ((run.stdout + run.stderr).includes(canary))
  throw Error("Build output contains synthetic API key");
process.stdout.write(run.stdout);
process.stderr.write(run.stderr);
if (run.status !== 0) process.exit(run.status || 1);
let count = 0;
async function scan(p) {
  for (const x of await readdir(p, { withFileTypes: true })) {
    const f = p + "/" + x.name;
    if (x.isDirectory()) await scan(f);
    else {
      const bytes = await readFile(f);
      count++;
      if (
        bytes.includes(Buffer.from(canary)) ||
        bytes.includes(Buffer.from("DAILY_API_KEY"))
      )
        throw Error("Client artifact contains server meeting key material");
    }
  }
}
await scan(".next/static");
console.log(
  JSON.stringify({
    clientFilesScanned: count,
    keyCanaryAbsent: true,
    serverKeyNameAbsent: true,
    buildWithoutDatabaseOrProductionSecrets: true,
  }),
);
