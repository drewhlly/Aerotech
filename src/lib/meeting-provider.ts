import { createSign } from "node:crypto";
import { uuid } from "./collaboration-policy";
export function providerRoom(
  tenant: string,
  meeting: string,
  generation: number,
) {
  if (
    !uuid(tenant) ||
    !uuid(meeting) ||
    !Number.isInteger(generation) ||
    generation < 1
  )
    throw Error("Invalid conference reference");
  return (
    "aerotech-" +
    tenant.replaceAll("-", "") +
    "-" +
    meeting.replaceAll("-", "") +
    "-g" +
    generation
  );
}
// JaaS administrative JWT and DESTROY API: https://developer.8x8.com/jaas/docs/webhooks-jaas-endpoints/
export async function terminateConference(
  tenant: string,
  meeting: string,
  generation: number,
) {
  const app = process.env.JAAS_APP_ID,
    kid = process.env.JAAS_KEY_ID,
    key = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (
    !app ||
    !/^vpaas-magic-cookie-[a-zA-Z0-9-]+$/.test(app) ||
    !kid?.startsWith(app + "/") ||
    !key
  )
    throw Error("JaaS room termination is not configured");
  const now = Math.floor(Date.now() / 1000),
    encode = (v: unknown) =>
      Buffer.from(JSON.stringify(v)).toString("base64url");
  const body =
    encode({ alg: "RS256", typ: "JWT", kid }) +
    "." +
    encode({
      aud: "jitsi",
      iss: "chat",
      sub: app,
      admin: true,
      nbf: now - 5,
      exp: now + 60,
    });
  const signer = createSign("RSA-SHA256");
  signer.update(body);
  signer.end();
  const token = body + "." + signer.sign(key).toString("base64url");
  const r = await fetch(
    "https://8x8.vc/v1/_jaas/conference-commands/v1/meeting",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "DESTROY",
        payload: {
          conferenceFullName:
            providerRoom(tenant, meeting, generation) +
            "@conference." +
            app +
            ".8x8.vc",
        },
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!r.ok && r.status !== 404) throw Error("JaaS rejected room termination");
}
