import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
function key() {
  const v = Buffer.from(process.env.DOCUMENT_ENCRYPTION_KEY || "", "base64");
  if (v.length !== 32)
    throw new Error(
      "DOCUMENT_ENCRYPTION_KEY must be 32 random bytes encoded as base64",
    );
  return v;
}
export function encryptDocument(bytes: Buffer, scope: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(scope));
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
}
export function decryptDocument(bytes: Buffer, scope: string) {
  const cipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
  cipher.setAuthTag(bytes.subarray(12, 28));
  cipher.setAAD(Buffer.from(scope));
  return Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]);
}
export const hashDocument = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
export function signDownload(scope: string, expires: number) {
  return createHmac("sha256", key())
    .update(scope + ":" + expires)
    .digest("base64url");
}
export function verifyDownload(
  scope: string,
  expires: number,
  signature: string,
  now = Date.now(),
) {
  if (!Number.isFinite(expires) || expires <= now || expires > now + 5 * 60000)
    return false;
  const a = Buffer.from(signDownload(scope, expires)),
    b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function documentMime(bytes: Buffer, filename: string) {
  if (bytes.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 3 &&
    bytes[3] === 4 &&
    /\.(docx|xlsx)$/i.test(filename)
  )
    return /\.docx$/i.test(filename)
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return null;
}
