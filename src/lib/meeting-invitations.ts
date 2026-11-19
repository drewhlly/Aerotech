// A mailbox invitation is an additional proof, never a replacement for Aerotech login.
// No email address or provider token is encoded into the link. No Node-only APIs.
async function signature(id: string, generation: number) {
  const encoded = process.env.DOCUMENT_ENCRYPTION_KEY;
  if (!encoded) throw Error("Invitation signing is not configured");
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  if (bytes.length !== 32) throw Error("Invalid invitation configuration");
  const key = await crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode("meeting-invitation-v2:" + id + ":" + generation),
  );
  return Array.from(new Uint8Array(sig), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export async function meetingInvitation(id: string, generation: number) {
  return id + "." + (await signature(id, generation));
}
export async function validMeetingInvitation(
  id: string,
  generation: number,
  token: string,
) {
  if (token.length !== 101 || !token.startsWith(id + ".")) return false;
  const expected = await meetingInvitation(id, generation);
  let difference = 0;
  for (let n = 0; n < expected.length; n++)
    difference |= expected.charCodeAt(n) ^ token.charCodeAt(n);
  return difference === 0;
}
