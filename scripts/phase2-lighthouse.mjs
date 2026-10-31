import lighthouse from "lighthouse";
import { chromium } from "playwright";
import { launch } from "chrome-launcher";
import { writeFileSync, mkdirSync } from "node:fs";
const browser = await launch({
  chromePath: process.env.CHROME_PATH || chromium.executablePath(),
  chromeFlags: [
    "--headless",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
  envVars: {
    ...process.env,
    LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || "",
  },
});
const scores = [];
mkdirSync("docs/phase2/evidence", { recursive: true });
try {
  for (const [label, path, cookie] of [
    ["home", "/", ""],
    ["login", "/auth/login?role=applicant", ""],
    [
      "projects",
      "/dashboard/employer/projects",
      "aerotech_employer_session=phase2-test-employer",
    ],
    [
      "meetings",
      "/dashboard/employer/meet",
      "aerotech_employer_session=phase2-test-employer",
    ],
    [
      "documents",
      "/dashboard/employer/documents",
      "aerotech_employer_session=phase2-test-employer",
    ],
    [
      "employee-tasks",
      "/employee/tasks",
      "aerotech_employee_session=phase2-test-employee",
    ],
  ]) {
    const result = await lighthouse("http://127.0.0.1:3100" + path, {
      port: browser.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      extraHeaders: cookie ? { Cookie: cookie } : {},
      disableStorageReset: false,
    });
    writeFileSync(
      "docs/phase2/evidence/lighthouse-" + label + ".json",
      result.report,
    );
    const privatePortal=path.startsWith('/dashboard/')||path.startsWith('/employee/');
    const indexingBlocked=result.lhr.audits['is-crawlable']?.score===0;
    const row = {
      page: label,
      indexing:privatePortal?'private':'public',
      indexingBlocked,
      url: result.lhr.finalDisplayedUrl,
      ...Object.fromEntries(
        Object.entries(result.lhr.categories).map(([key, value]) => [
          key,
          Math.round(value.score * 100),
        ]),
      ),
    };
    scores.push(row);
    console.log("LIGHTHOUSE " + JSON.stringify(row));
  }
  writeFileSync(
    "docs/phase2/evidence/lighthouse-scores.json",
    JSON.stringify(
      {
        environment:
          "Local production build; synthetic data; mobile simulated throttling",
        scores,
      },
      null,
      2,
    ),
  );
  if (
    scores.some((s) =>
      (s.indexing==='private'?["performance", "accessibility", "best-practices"]:["performance", "accessibility", "best-practices", "seo"]).some(
        (k) => s[k] < 90,
      ),
    )
  || scores.some(s=>s.indexing==='private'&&!s.indexingBlocked))
    process.exitCode = 1;
} finally {
  await browser.kill();
}
