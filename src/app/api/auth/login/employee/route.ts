import {NextResponse} from "next/server";
import {db} from "@/lib/employer-session";
import {checkPassword,startEmployeeSession} from "@/lib/employee-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 let b:{email?:unknown;password?:unknown};try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(typeof b.email!=="string"||typeof b.password!=="string")return NextResponse.json({error:"Email and password required"},{status:400});
 const pool=db();try{
 const r=await pool.query("SELECT c.employee_id,c.password_hash FROM employee_credentials c JOIN workforce_employees e ON e.id=c.employee_id AND e.employer_id=c.employer_id WHERE lower(e.email)=lower($1) AND e.employment_status IN ('active','probation','on_leave')",[b.email.trim()]);
 if(r.rows.length!==1||!(await checkPassword(b.password,r.rows[0].password_hash)))return NextResponse.json({error:"Invalid email or password"},{status:401});
 await startEmployeeSession(pool,r.rows[0].employee_id);return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Employee sign-in unavailable"},{status:503});}finally{await pool.end();}
}
