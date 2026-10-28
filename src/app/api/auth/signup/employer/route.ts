import {acceptsPolicies,POLICY_VERSION} from '@/lib/policy';
import { NextResponse } from "next/server";
import { randomUUID, scrypt as callbackScrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { Pool } from "pg";
import { startEmployerSession } from "@/lib/employer-session";

export const runtime = "nodejs";
const scrypt = promisify(callbackScrypt);

type Payload = Record<string, unknown>;
const required = ["companyName", "companyEmail", "firstName", "lastName", "phone", "country", "password"] as const;

export async function POST(request: Request) {
  let body: Payload;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid payload");
    body = parsed as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
  }
 if(!acceptsPolicies(body))return NextResponse.json({error:'Accept the current Terms and Privacy Policy.'},{status:400});
  for (const key of required) {
    if (typeof body[key] !== "string" || !(body[key] as string).trim() || (body[key] as string).length > 255) {
      return NextResponse.json({ error: "Please complete all fields with valid information." }, { status: 400 });
    }
  }
  const email = (body.companyEmail as string).trim().toLowerCase();
  const password = body.password as string;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid company email." }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json({ error: "Password must contain at least 12 characters." }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Employer registration is not available yet." }, { status: 503 });
  }
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const passwordHash = `scrypt:${salt}:${derived.toString("hex")}`;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000, max: 2 });
  const c=await pool.connect();
  try {
    await c.query('BEGIN');
    const result = await c.query(
      `INSERT INTO employer_accounts
        (id, company_name, company_email, admin_first_name, admin_last_name, phone, country, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        randomUUID(), (body.companyName as string).trim(), email,
        (body.firstName as string).trim(), (body.lastName as string).trim(),
        (body.phone as string).trim(), (body.country as string).trim(), passwordHash,
      ]
    );
 await c.query('INSERT INTO policy_acceptances(id,account_role,account_id,policy_version) VALUES($1,$2,$3,$4)',[randomUUID(),'employer',result.rows[0].id,POLICY_VERSION]);await c.query('COMMIT');
    await startEmployerSession(pool, result.rows[0].id);
    return NextResponse.json({ employerId: result.rows[0].id }, { status: 201 });
  } catch (error: unknown) {
 await c.query('ROLLBACK').catch(()=>{});
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "An employer account with this email already exists." }, { status: 409 });
    }
    console.error("Employer registration failed");
    return NextResponse.json({ error: "Unable to create your workspace right now." }, { status: 500 });
  } finally {
    c.release();await pool.end();
  }
}
