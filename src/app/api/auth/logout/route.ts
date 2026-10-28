import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, SESSION_COOKIE, sessionDigest } from "@/lib/employer-session";
export const runtime = "nodejs";
export async function POST() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && process.env.DATABASE_URL) {
    const pool = db();
    try { await pool.query("DELETE FROM employer_sessions WHERE token_hash = $1", [sessionDigest(token)]); }
    finally { await pool.end(); }
  }
  jar.delete(SESSION_COOKIE);
  jar.delete('aerotech_portal_role');return NextResponse.json({ ok: true });
}
