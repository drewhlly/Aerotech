import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import "./helpers/ts-loader.mjs";
const { providerRoom, terminateConference } =
  await import("../src/lib/meeting-provider.ts");
test("meeting room references preserve company, meeting and generation boundaries", () => {
  const a = "11111111-1111-4111-8111-111111111111",
    b = "22222222-2222-4222-8222-222222222222";
  assert.notEqual(providerRoom(a, b, 1), providerRoom(a, b, 2));
  assert.notEqual(providerRoom(a, b, 1), providerRoom(b, a, 1));
  assert.throws(() => providerRoom(a, b, 0));
  assert.throws(() => providerRoom("bad", b, 1));
});
test("JaaS termination uses a short-lived signed admin token and retries provider failures", async () => {
  const names = ["JAAS_APP_ID", "JAAS_KEY_ID", "JAAS_PRIVATE_KEY"],
    previous = Object.fromEntries(names.map((k) => [k, process.env[k]])),
    fetchBefore = globalThis.fetch;
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  process.env.JAAS_APP_ID = "vpaas-magic-cookie-unit";
  process.env.JAAS_KEY_ID = process.env.JAAS_APP_ID + "/test";
  process.env.JAAS_PRIVATE_KEY = privateKey
    .export({ type: "pkcs8", format: "pem" })
    .toString();
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, "https://8x8.vc/v1/_jaas/conference-commands/v1/meeting");
    assert.equal(JSON.parse(options.body).action, "DESTROY");
    const token = options.headers.Authorization.slice(7),
      [head, body, sig] = token.split("."),
      claims = JSON.parse(Buffer.from(body, "base64url"));
    assert.equal(claims.admin, true);
    assert.ok(claims.exp - claims.nbf <= 65);
    assert.ok(
      verify(
        "RSA-SHA256",
        Buffer.from(head + "." + body),
        publicKey,
        Buffer.from(sig, "base64url"),
      ),
    );
    return new Response("", { status: calls === 1 ? 200 : 503 });
  };
  try {
    const a = "11111111-1111-4111-8111-111111111111",
      b = "22222222-2222-4222-8222-222222222222";
    await terminateConference(a, b, 1);
    await assert.rejects(() => terminateConference(a, b, 1), /rejected/);
  } finally {
    globalThis.fetch = fetchBefore;
    for (const key of names) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
