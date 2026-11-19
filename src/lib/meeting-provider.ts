// Provider-only HTTP adapter: Web Crypto + fetch; safe to reuse from a Worker.
// Verified 2026-11-19: https://www.daily.co/pricing/video-sdk/ advertises 10,000
// free participant-minutes/month, then usage billing (no provider hard cap).
// Our configurable reservation budget is deliberately separate from that allowance.
// API contract: https://docs.daily.co/reference/rest-api/rooms/create-room
// https://docs.daily.co/reference/rest-api/meeting-tokens/create-meeting-token
// https://docs.daily.co/reference/rest-api/rooms/session/eject
import { tokenExpiry, type MeetingType } from "./meeting-policy";
export type RoomInput = {
  name: string;
  startsAt: number;
  endsAt: number;
  maxParticipants: number;
  type: MeetingType;
};
export type TokenInput = {
  room: string;
  userId: string;
  name: string;
  host: boolean;
  type: MeetingType;
  endsAt: number;
  ttl: number;
};
export interface MeetingProvider {
  createRoom(input: RoomInput): Promise<{ name: string; url: string }>;
  createToken(input: TokenInput): Promise<string>;
  endRoom(name: string, userIds: string[]): Promise<void>;
}
function roomName(name: string) {
  if (!/^aero-[a-f0-9]{32}-g\d+$/.test(name))
    throw Error("Invalid provider room");
  return name;
}
export function dailyOrigin() {
  const domain = process.env.DAILY_DOMAIN?.trim();
  if (!domain || !/^[a-z0-9-]+\.daily\.co$/.test(domain))
    throw Error("Daily domain is not configured");
  return "https://" + domain;
}
export function meetingProviderReady() {
  return Boolean(
    process.env.DAILY_API_KEY &&
    process.env.DAILY_DOMAIN &&
    (!process.env.MEETING_PROVIDER || process.env.MEETING_PROVIDER === "daily"),
  );
}
async function request(
  path: string,
  method = "GET",
  body?: unknown,
  allow404 = false,
): Promise<Record<string, unknown>> {
  const key = process.env.DAILY_API_KEY;
  if (!key) throw Error("Daily is not configured");
  const r = await fetch("https://api.daily.co/v1" + path, {
    method,
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (allow404 && r.status === 404) return {};
  if (!r.ok)
    throw Error(
      r.status === 429
        ? "Meeting service is busy. Try again shortly."
        : "Meeting provider could not complete this operation.",
    );
  return (await r.json()) as Record<string, unknown>;
}
export function dailyTokenProperties(i: TokenInput, now = Date.now()) {
  if (!/^[a-f0-9-]{36}$/i.test(i.userId))
    throw Error("Invalid participant identity");
  return {
    room_name: roomName(i.room),
    user_id: i.userId,
    user_name: i.name.slice(0, 80),
    is_owner: i.host,
    nbf: Math.floor(now / 1000) - 5,
    exp: tokenExpiry(now, i.endsAt, i.ttl),
    enable_prejoin_ui: true,
    start_video_off: i.type === "audio",
    start_audio_off: true,
    enable_recording: false,
    enable_recording_ui: false,
    start_cloud_recording: false,
    auto_start_transcription: false,
    enable_live_captions_ui: false,
    permissions: {
      hasPresence: true,
      canSend:
        i.type === "audio"
          ? ["audio"]
          : ["audio", "video", "screenVideo", "screenAudio"],
      canAdmin: i.host ? ["participants"] : false,
    },
  };
}
const daily: MeetingProvider = {
  async createRoom(i) {
    roomName(i.name);
    const origin = dailyOrigin();
    const properties = {
      nbf: Math.floor(i.startsAt / 1000),
      exp: Math.floor(i.endsAt / 1000),
      eject_at_room_exp: true,
      max_participants: i.maxParticipants,
      enforce_unique_user_ids: true,
      enable_prejoin_ui: true,
      enable_people_ui: true,
      enable_chat: true,
      enable_shared_chat_history: false,
      enable_hand_raising: true,
      enable_screenshare: i.type !== "audio",
      start_video_off: i.type === "audio",
      start_audio_off: true,
      enable_recording: false,
      enable_recording_ui: false,
      enable_live_captions_ui: false,
      enable_transcription_storage: false,
      permissions: { canAdmin: false },
      // Lobby admission is enforced by Aerotech before issuing a token. Public Daily
      // knocking stays OFF: otherwise anyone with a leaked URL could ask to enter.
      enable_knocking: false,
    };
    // Idempotent retries use the persisted opaque room name; never create a public room.
    let result: Record<string, unknown>;
    try {
      result = await request("/rooms/" + i.name);
    } catch {
      result = await request("/rooms", "POST", {
        name: i.name,
        privacy: "private",
        properties,
      });
    }
    if (
      result.privacy !== "private" ||
      result.name !== i.name ||
      result.url !== origin + "/" + i.name
    )
      throw Error("Meeting provider returned an unexpected room");
    return { name: i.name, url: String(result.url) };
  },
  async createToken(i) {
    dailyOrigin();
    const r = await request("/meeting-tokens", "POST", {
      properties: dailyTokenProperties(i),
    });
    if (typeof r.token !== "string" || !r.token)
      throw Error("Meeting token unavailable");
    return r.token;
  },
  async endRoom(name, userIds) {
    roomName(name);
    for (let n = 0; n < userIds.length; n += 100)
      await request(
        "/rooms/" + name + "/eject",
        "POST",
        { user_ids: userIds.slice(n, n + 100), ban: true },
        true,
      );
    await request("/rooms/" + name, "DELETE", undefined, true);
  },
};
export function meetingProvider(): MeetingProvider {
  if (process.env.MEETING_PROVIDER && process.env.MEETING_PROVIDER !== "daily")
    throw Error("Meeting provider is not configured");
  return daily;
}
