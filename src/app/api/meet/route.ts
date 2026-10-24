import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
import {currentEmployee} from "@/lib/employee-auth";
export const runtime="nodejs";
async function actor(){const employee=await currentEmployee();if(employee)return {employer:employee.employer_id,employee:employee.id};const employer=await currentEmployer();return employer?{employer,employee:null}:null;}
export async function GET(){
 const a=await actor();if(!a)return NextResponse.json({error:"Sign in required"},{status:401});
 const pool=db();try{
 const q=a.employee?
 "SELECT m.id,m.title,m.starts_at,m.duration_minutes FROM meet_rooms m JOIN meet_participants p ON p.room_id=m.id AND p.employer_id=m.employer_id WHERE m.employer_id=$1 AND p.employee_id=$2 ORDER BY m.starts_at DESC LIMIT 100":
 "SELECT id,title,starts_at,duration_minutes FROM meet_rooms WHERE employer_id=$1 ORDER BY starts_at DESC LIMIT 100";
 const result=await pool.query(q,a.employee?[a.employer,a.employee]:[a.employer]);return NextResponse.json({meetings:result.rows});
 }catch{return NextResponse.json({error:"Meetings unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Employer access required to schedule meetings"},{status:403});
 let b:Record<string,unknown>;try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const title=typeof b.title==="string"?b.title.trim():"";
 const date=typeof b.startsAt==="string"?new Date(b.startsAt):new Date(NaN);
 const duration=Number(b.durationMinutes||60);
 const members=Array.isArray(b.employeeIds)?b.employeeIds:[];
 if(!title||title.length>150||!Number.isFinite(date.getTime())||date.getTime()<Date.now()-60000||!Number.isInteger(duration)||duration<15||duration>240||members.some(x=>typeof x!=="string")||members.length>100)return NextResponse.json({error:"Invalid meeting details"},{status:400});
 const pool=db(),client=await pool.connect();try{
 await client.query("BEGIN");
 const ids=[...new Set(members)];
 if(ids.length){const allowed=await client.query("SELECT id FROM workforce_employees WHERE employer_id=$1 AND id=ANY($2::uuid[]) AND employment_status IN ('active','probation','on_leave')",[employer,ids]);if(allowed.rowCount!==ids.length){await client.query("ROLLBACK");return NextResponse.json({error:"Some participants do not belong to this company"},{status:422});}}
 const id=randomUUID();
 await client.query("INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes) VALUES($1,$2,$3,$4,$5)",[id,employer,title,date.toISOString(),duration]);
 for(const member of ids)await client.query("INSERT INTO meet_participants(employer_id,room_id,employee_id) VALUES($1,$2,$3)",[employer,id,member]);
 await client.query("COMMIT");return NextResponse.json({id,participants:ids.length},{status:201});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Unable to schedule meeting"},{status:503});}finally{client.release();await pool.end();}
}
