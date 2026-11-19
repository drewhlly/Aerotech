// Never emit scanner matches, patches, environment values, or raw reports.
import { spawnSync, spawn } from "node:child_process";
import { writeFile, readFile, unlink } from "node:fs/promises";
const scanner = process.argv[2] || "gitleaks";
const report = "/tmp/aerotech-history-redacted.json";
const scan = spawnSync(
  scanner,
  [
    "git",
    "--no-banner",
    "--redact=100",
    "--log-opts=--all --full-history",
    "--report-format=json",
    "--report-path=" + report,
    ".",
  ],
  { encoding: "utf8", maxBuffer: 1024 * 1024, timeout: 1200000 },
);
let findings = [];
try {
  const r = JSON.parse(await readFile(report, "utf8"));
  findings = r.map((x) => ({ commit: x.Commit, file: x.File, type: x.RuleID }));
  await unlink(report);
} catch {}
const targeted = [];
let commit = "",
  file = "",
  buffer = "";
const child = spawn(
  "git",
  [
    "log",
    "--all",
    "--full-history",
    "--format=COMMIT:%H",
    "-p",
    "-G",
    "JAAS_|JITSI_|jaas\\.8x8\\.vc|meet\\.jit\\.si|BEGIN .*PRIVATE KEY",
    "--",
    ".",
  ],
  { stdio: ["ignore", "pipe", "ignore"] },
);
child.stdout.on("data", (b) => {
  buffer += b;
  const lines = buffer.split("\n");
  buffer = lines.pop();
  for (const l of lines) {
    if (l.startsWith("COMMIT:")) commit = l.slice(7);
    if (l.startsWith("+++ b/")) file = l.slice(6);
    if (
      l.startsWith("+") &&
      !l.startsWith("+++") &&
      /JAAS_|JITSI_|jaas\.8x8\.vc|meet\.jit\.si|BEGIN .*PRIVATE KEY/.test(l)
    )
      targeted.push({
        commit,
        file,
        type: /BEGIN .*PRIVATE KEY/.test(l)
          ? "private-key-marker"
          : "retired-provider-reference",
      });
  }
});
const targetedExit = await new Promise((r) => child.on("close", r));
const unique = [
  ...new Map(targeted.map((x) => [JSON.stringify(x), x])).values(),
];
const refs = spawnSync(
  "git",
  [
    "for-each-ref",
    "--format=%(refname)",
    "refs/heads",
    "refs/remotes",
    "refs/tags",
  ],
  { encoding: "utf8" },
)
  .stdout.trim()
  .split("\n");
const result = {
  date: new Date().toISOString(),
  scanner: "gitleaks",
  scannerExit: scan.status,
  scanError: Boolean(scan.error),
  targetedExit,
  refs,
  findings,
  targetedReferences: unique,
  historyConfirmedClean:
    scan.status === 0 &&
    !scan.error &&
    targetedExit === 0 &&
    findings.length === 0,
  coverage:
    "All fetched local heads, remote branches and tags reachable by --all; excludes deleted/unreachable refs, forks not fetched, hosting secrets and deployment logs.",
};
await writeFile(
  "/tmp/aerotech-history-metadata.json",
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify({
    scannerExit: result.scannerExit,
    targetedExit,
    refs: refs.length,
    findings,
    retiredReferenceCount: unique.length,
    historyConfirmedClean: result.historyConfirmedClean,
  }),
);
if (scan.status !== 0 || scan.error || targetedExit !== 0) process.exitCode = 1;
