import {authAttempt} from '@/lib/auth-rate-limit';
import { NextResponse } from "next/server";
import { timingSafeEqual, scrypt as callbackScrypt } from "node:crypto";
import { promisify } from "node:util";
import { db, startEmployerSession } from "@/lib/employer-session";

export const runtime = "nodejs";
const scrypt = promisify(callbackScrypt);

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof body?.email !== "string" || typeof body?.password !== "string") return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  if(body.email.length>254||body.password.length>256)return NextResponse.json({error:'Invalid email or password'},{status:400});
  const pool = db();
  try {
 if(!await authAttempt(pool,'employer',body.email))return NextResponse.json({error:'Too many attempts. Try again in 15 minutes.'},{status:429,headers:{'Retry-After':'900'}});
    const result = await pool.query("SELECT id, password_hash FROM employer_accounts WHERE company_email = $1", [body.email.trim().toLowerCase()]);
    const account = result.rows[0];
    if (!account) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    const [, salt, digest] = String(account.password_hash).split(":");
    if (!salt || !digest) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    const stored = Buffer.from(digest, "hex");
    const actual = (await scrypt(body.password, salt, stored.length)) as Buffer;
    if (!timingSafeEqual(stored, actual)) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    await startEmployerSession(pool, account.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sign in is currently unavailable." }, { status: 503 });
  } finally { await pool.end(); }
}
