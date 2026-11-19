import test from "node:test";
import assert from "node:assert/strict";
import "./helpers/ts-loader.mjs";
const { dailyTokenProperties, meetingProvider } =
  await import("../src/lib/meeting-provider.ts");
import {
  scheduleInput,
  reservationMonths,
  tokenExpiry,
  calendarFile,
} from "../src/lib/meeting-policy.ts";
import {
  meetingInvitation,
  validMeetingInvitation,
} from "../src/lib/meeting-invitations.ts";
const room = "aero-" + "a".repeat(32) + "-g1",
  user = "11111111-1111-4111-8111-111111111111",
  now = Date.parse("2026-11-19T10:00:00Z");
test("Daily tokens are room/user bound, short-lived, and never grant recording or transcription", () => {
  for (const host of [false, true]) {
    const p = dailyTokenProperties(
      {
        room,
        userId: user,
        name: "Test participant",
        host,
        type: "audio",
        endsAt: now + 3600000,
        ttl: 300,
      },
      now,
    );
    assert.equal(p.room_name, room);
    assert.equal(p.user_id, user);
    assert.equal(p.exp, Math.floor(now / 1000) + 300);
    assert.equal(p.is_owner, host);
    assert.equal(p.start_video_off, true);
    assert.deepEqual(p.permissions.canSend, ["audio"]);
    assert.equal(p.enable_recording, false);
    assert.equal(p.auto_start_transcription, false);
    assert.deepEqual(p.permissions.canAdmin, host ? ["participants"] : false);
  }
});
test("expiry and scheduling use UTC offsets and the server clock", () => {
  assert.equal(
    tokenExpiry(now, now + 120000, 300),
    Math.floor(now / 1000) + 120,
  );
  assert.throws(() => tokenExpiry(now, now));
  const a = scheduleInput(
    {
      startsAt: "2026-11-20T11:30:00+01:00",
      timezone: "Africa/Lagos",
      type: "video",
    },
    now,
  );
  assert.equal(a.date.toISOString(), "2026-11-20T10:30:00.000Z");
  assert.throws(() =>
    scheduleInput(
      { startsAt: "2026-11-20T11:30", timezone: "Africa/Lagos" },
      now,
    ),
  );
  assert.throws(() =>
    scheduleInput(
      { startsAt: "2026-11-20T11:30:00Z", timezone: "Wrong/Zone" },
      now,
    ),
  );
  assert.equal(scheduleInput({ instant: true }, now).date.getTime(), now);
});
test("budget reservations include both UTC months and all participants", () => {
  assert.deepEqual(
    reservationMonths(
      new Date("2026-11-30T23:50:00Z"),
      new Date("2026-12-01T00:10:00Z"),
      4,
    ),
    [
      { month: "2026-11-01", minutes: 40 },
      { month: "2026-12-01", minutes: 40 },
    ],
  );
});
test("calendar links contain no provider credentials and escape injected lines", () => {
  const c = calendarFile(
    {
      id: user,
      title: "Title\r\nATTENDEE:bad" + "é".repeat(90),
      starts_at: new Date(now),
      duration_minutes: 30,
      status: "scheduled",
      join_generation: 2,
    },
    "https://aerotech.test",
  );
  assert.match(c, /DTSTART:20261119T100000Z/);
  assert.ok(!c.includes("\r\nATTENDEE:"));
  assert.match(c, /SEQUENCE:2/);
  assert.ok(!c.includes("daily.co"));
  for (const line of c.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
});
test("mailbox invitation is opaque, generation scoped and requires the exact identity", async () => {
  process.env.DOCUMENT_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
  const t = await meetingInvitation(user, 2);
  assert.equal(await validMeetingInvitation(user, 2, t), true);
  assert.equal(await validMeetingInvitation(user, 3, t), false);
  assert.equal(
    await validMeetingInvitation("22222222-2222-4222-8222-222222222222", 2, t),
    false,
  );
});
test("Daily adapter creates a private expiring room, never leaks its key into token properties, and ejects before deleting", async () => {
  const saved = global.fetch;
  process.env.DAILY_API_KEY = "daily-disposable-fixture";
  process.env.DAILY_DOMAIN = "meetings-fixture.daily.co";
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (options.method === "GET") return new Response("{}", { status: 404 });
    if (url.endsWith("/meeting-tokens"))
      return Response.json({ token: "disposable.token.only" });
    if (options.method === "DELETE" || url.endsWith("/eject"))
      return Response.json({});
    return Response.json({
      name: room,
      privacy: "private",
      url: "https://meetings-fixture.daily.co/" + room,
    });
  };
  try {
    const p = meetingProvider();
    await p.createRoom({
      name: room,
      startsAt: now - 900000,
      endsAt: now + 3600000,
      maxParticipants: 2,
      type: "audio",
    });
    const created = JSON.parse(calls[1].options.body);
    assert.equal(created.privacy, "private");
    assert.equal(created.properties.enable_knocking, false);
    assert.equal(created.properties.eject_at_room_exp, true);
    assert.equal(created.properties.enable_recording, false);
    assert.equal(created.properties.enable_shared_chat_history, false);
    await p.createToken({
      room,
      userId: user,
      name: "Test",
      host: false,
      type: "video",
      endsAt: Date.now() + 600000,
      ttl: 300,
    });
    await p.endRoom(room, [user]);
    assert.ok(calls.at(-2).url.endsWith("/eject"));
    assert.equal(calls.at(-1).options.method, "DELETE");
    assert.ok(
      !calls.some((c) => c.options.body?.includes("daily-disposable-fixture")),
    );
  } finally {
    global.fetch = saved;
    delete process.env.DAILY_API_KEY;
    delete process.env.DAILY_DOMAIN;
  }
});
