import test from "node:test";
import assert from "node:assert/strict";
import "./helpers/ts-loader.mjs";
const { externalMeetingUrl, hybridInput, minuteSegments } =
  await import("../src/lib/meeting-hybrid-policy.ts");
const { builtInConfiguration } =
  await import("../src/lib/meeting-runtime-config.ts");
test("external domains use exact/subdomain boundaries, HTTPS and no credentials or custom ports", () => {
  for (const u of [
    "https://meet.google.com/abc-defg-hij",
    "https://us02web.zoom.us/j/123",
    "https://teams.microsoft.com/l/meetup-join/abc",
  ])
    assert.equal(externalMeetingUrl(u), u);
  for (const u of [
    "http://meet.google.com/a",
    "javascript:alert(1)",
    "https://meet.google.com.evil.test/a",
    "https://meet.google.com@evil.test/a",
    "https://meet.google.com:444/a",
    "https://127.0.0.1/a",
    "https://zoom.us/",
    "https://evil.test/redirect?url=https://zoom.us/j/1",
  ])
    assert.throws(() => externalMeetingUrl(u));
  assert.equal(
    externalMeetingUrl("https://calls.example.test/team", "calls.example.test"),
    "https://calls.example.test/team",
  );
  assert.throws(() =>
    hybridInput({ mode: "built_in", externalUrl: "https://zoom.us/j/1" }),
  );
});
test("actual duration splits UTC months, never trusts a caller clock", () => {
  const j = Date.parse("2026-10-31T23:59:30Z");
  assert.deepEqual(minuteSegments(j, j + 90000), [
    { month: "2026-10-01", minutes: 0.5 },
    { month: "2026-11-01", minutes: 1 },
  ]);
  assert.throws(() => minuteSegments(j, j - 1));
});
test("missing server credentials disables built-in without affecting external URLs", () => {
  const saved = { ...process.env };
  try {
    process.env.MEETING_BUILT_IN_ENABLED = "true";
    delete process.env.DAILY_API_KEY;
    delete process.env.DAILY_DOMAIN;
    assert.equal(builtInConfiguration().enabled, false);
    assert.equal(
      externalMeetingUrl("https://zoom.us/j/1"),
      "https://zoom.us/j/1",
    );
    process.env.DAILY_API_KEY = "disposable-fixture";
    process.env.DAILY_DOMAIN = "fixture.daily.co";
    assert.equal(builtInConfiguration().enabled, true);
    process.env.MEETING_BUILT_IN_ENABLED = "false";
    assert.equal(builtInConfiguration().enabled, false);
  } finally {
    process.env = saved;
  }
});
