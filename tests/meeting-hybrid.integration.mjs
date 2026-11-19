import { mock } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { installDailyFixture } from "./helpers/daily-fixture.mjs";
const database = new PGlite(),
  query = async (sql, args = []) => {
    const r = await database.query(sql, args);
    return { ...r, rowCount: r.rows.length || r.affectedRows || 0 };
  };
class Pool {
  query = query;
  async connect() {
    return { query, release() {} };
  }
  async end() {}
}
const tenant = randomUUID(),
  foreign = randomUUID(),
  employee = randomUUID(),
  otherEmployee = randomUUID(),
  applicant = randomUUID();
let mode = "employer",
  company = tenant;
mock.module("../src/lib/employer-session.ts", {
  namedExports: {
    db: () => new Pool(),
    currentEmployer: async () => (mode === "employer" ? company : null),
  },
});
mock.module("../src/lib/employee-auth.ts", {
  namedExports: {
    currentEmployee: async () =>
      mode === "employee"
        ? {
            id: employee,
            employer_id: tenant,
            first_name: "Test",
            last_name: "Employee",
          }
        : mode === "otherEmployee"
          ? {
              id: otherEmployee,
              employer_id: foreign,
              first_name: "Other",
              last_name: "Employee",
            }
          : null,
  },
});
mock.module("../src/lib/applicant-session.ts", {
  namedExports: {
    currentApplicant: async () => (mode === "applicant" ? applicant : null),
  },
});
for (const f of readFileSync("scripts/migrate.mjs", "utf8").matchAll(
  /"(\d{3}_[^"]+\.sql)"/g,
))
  await database.exec(readFileSync("database/" + f[1], "utf8"));
for (const id of [tenant, foreign])
  await query(
    "INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,'Synthetic',$2,'Test','Host','000','Nigeria','fixture')",
    [id, id + "@example.invalid"],
  );
for (const id of [tenant, foreign])
  await query(
    "INSERT INTO company_subscriptions(employer_id,plan,status,currency,paid_until,reference) VALUES($1,'business','active','NGN',NOW()+INTERVAL '1 year',$2)",
    [id, id],
  );
for (const [id, t] of [
  [employee, tenant],
  [otherEmployee, foreign],
])
  await query(
    "INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,job_title,department,employment_status) VALUES($1,$2,'Test','Employee',$3,'Tester','QA','active')",
    [id, t, id + "@example.invalid"],
  );
await query(
  "INSERT INTO applicant_accounts(id,first_name,last_name,email,phone,password_hash) VALUES($1,'Test','Applicant','invited@example.invalid','000','fixture')",
  [applicant],
);
const fixture = installDailyFixture();
process.env.DOCUMENT_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");
const meetings = await import("../src/app/api/meet/route.ts"),
  join = await import("../src/app/api/meet/[id]/join/route.ts"),
  lobby = await import("../src/app/api/meet/[id]/lobby/route.ts"),
  details = await import("../src/app/api/meet/[id]/details/route.ts"),
  calendar = await import("../src/app/api/meet/[id]/calendar/route.ts");
const req = (path, body, proof = "") =>
    new Request("https://aerotech.test" + path, {
      method: body ? "POST" : "GET",
      headers: {
        Origin: "https://aerotech.test",
        "Content-Type": "application/json",
        ...(proof ? { Authorization: "Bearer " + proof } : {}),
      },
      body: body
        ? JSON.stringify(
            path === "/api/meet" ? { mode: "built_in", ...body } : body,
          )
        : undefined,
    }),
  ctx = (id) => ({ params: Promise.resolve({ id }) });
try {
 const path='/api/meet';
 let r=await meetings.POST(req(path,{title:'External HR call',instant:true,mode:'external_link',externalUrl:'https://meet.google.com/abc-defg-hij',employeeIds:[employee]}));assert.equal(r.status,201,JSON.stringify(await r.clone().json()));const external=(await r.json()).id;
 const before=fixture.calls.length;mode='employee';r=await join.POST(req(path+'/'+external+'/join',{}),ctx(external));assert.equal(r.status,200);assert.equal((await r.json()).externalUrl,'https://meet.google.com/abc-defg-hij');assert.equal(fixture.calls.length,before,'external must never call Daily');
 mode='otherEmployee';assert.equal((await join.POST(req(path+'/'+external+'/join',{}),ctx(external))).status,404);
 mode='employer';assert.equal((await meetings.POST(req(path,{title:'Bad link',instant:true,mode:'external_link',externalUrl:'https://zoom.us.evil.test/j/1'}))).status,400);
 await query("UPDATE company_subscriptions SET plan='basic' WHERE employer_id=$1",[tenant]);assert.equal((await meetings.POST(req(path,{title:'Plan block',instant:true,mode:'built_in'}))).status,403);
 await query("UPDATE company_subscriptions SET plan='professional' WHERE employer_id=$1",[tenant]);
 r=await meetings.POST(req(path,{title:'Audio HR check-in',instant:true,mode:'built_in',employeeIds:[employee]}));assert.equal(r.status,201);const built=(await r.json()).id;
 assert.equal((await query('SELECT type FROM meetings WHERE id=$1',[built])).rows[0].type,'audio');
 r=await join.POST(req(path+'/'+built+'/join',{name:'Host'}),ctx(built));assert.equal(r.status,200,JSON.stringify(await r.clone().json()));
 const room=(await query('SELECT room_name FROM meeting_provider_rooms WHERE meeting_id=$1',[built])).rows[0].room_name;
 const wrapped=global.fetch,session=randomUUID(),joined=Math.floor(Date.now()/1000)-1200;
 global.fetch=async(url,options)=>String(url).includes('/meetings?')?Response.json({data:[{id:session,room,ongoing:false,participants:[{participant_id:tenant,user_id:tenant,join_time:joined,duration:600},{participant_id:employee,user_id:employee,join_time:joined,duration:600}]}]}):wrapped(url,options);
 const {reconcileMeetingUsage}=await import('../src/lib/meeting-metering.ts');const {meetingEntitlement}=await import('../src/lib/meeting-entitlements.ts');
 await reconcileMeetingUsage(new Pool());let e=await meetingEntitlement(new Pool(),tenant);assert.equal(e.used,20);assert.equal(e.audioMinutes,20);
 await query('UPDATE meeting_provider_rooms SET usage_checked_at=NULL');await reconcileMeetingUsage(new Pool());e=await meetingEntitlement(new Pool(),tenant);assert.equal(e.used,20,'provider retry must not double count');assert.equal((await meetingEntitlement(new Pool(),foreign)).used,0);
 await query('UPDATE employer_meeting_usage SET participant_minutes=400,audio_minutes=20 WHERE employer_id=$1',[tenant]);assert.equal((await meetingEntitlement(new Pool(),tenant)).warning,true);
 await query('UPDATE employer_meeting_usage SET participant_minutes=500 WHERE employer_id=$1',[tenant]);assert.equal((await meetings.POST(req(path,{title:'Quota block',instant:true,mode:'built_in'}))).status,429);
 assert.equal((await meetings.POST(req(path,{title:'External still works',instant:true,mode:'external_link',externalUrl:'https://zoom.us/j/123'}))).status,201);
 const usage=await import('../src/app/api/meet/usage/route.ts');mode='employee';assert.equal((await usage.GET()).status,403);mode='employer';company=foreign;assert.equal((await (await usage.GET()).json()).used,0);company=tenant;
 delete process.env.DAILY_API_KEY;assert.equal((await meetings.POST(req(path,{title:'Missing key',instant:true,mode:'built_in'}))).status,503);
 assert.equal((await join.POST(req(path+'/'+external+'/join',{}),ctx(external))).status,200);
 console.log('PASS hybrid links, plan gates, audio default, 80% warning, quota block, provider-only metering, deduplication and tenant isolation.');
} finally {fixture.restore();await database.close();}
