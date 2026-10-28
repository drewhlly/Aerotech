import {selectPortal} from './portal-selection';
import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {cookies} from "next/headers";
import type {Pool} from "pg";
import {db} from "@/lib/employer-session";
const scrypt=promisify(scryptCallback);
export const EMPLOYEE_COOKIE="aerotech_employee_session";
export const digest=(token:string)=>createHash("sha256").update(token).digest("hex");
export async function hashPassword(password:string){
 const salt=randomBytes(16).toString("hex");const key=await scrypt(password,salt,64) as Buffer;
 return "scrypt:"+salt+":"+key.toString("hex");
}
export async function checkPassword(password:string,stored:string){
 const [scheme,salt,hex]=stored.split(":");if(scheme!=="scrypt"||!salt||!hex||!/^[0-9a-f]{128}$/.test(hex))return false;
 const original=Buffer.from(hex,"hex"),derived=await scrypt(password,salt,original.length) as Buffer;
 return timingSafeEqual(original,derived);
}
export async function startEmployeeSession(pool:Pool,employeeId:string){
 await selectPortal('employee');
 (await cookies()).delete("aerotech_employer_session");
 (await cookies()).delete("aerotech_applicant_session");

 const token=randomBytes(32).toString("hex");await pool.query("INSERT INTO employee_sessions(token_hash,employee_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '7 days')",[digest(token),employeeId]);
 (await cookies()).set(EMPLOYEE_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800});
}
export async function currentEmployee(){
 const token=(await cookies()).get(EMPLOYEE_COOKIE)?.value;if(!token)return null;
 const pool=db();try{const r=await pool.query("SELECT e.id,e.employer_id,e.first_name,e.last_name,e.email,e.department,e.manager_employee_id FROM employee_sessions s JOIN workforce_employees e ON e.id=s.employee_id WHERE s.token_hash=$1 AND s.expires_at>NOW() AND e.employment_status IN ('active','probation','on_leave')",[digest(token)]);
 return r.rows[0] as {id:string;employer_id:string;first_name:string;last_name:string;email:string;department:string;manager_employee_id:string|null}|undefined || null;
 }finally{await pool.end();}
}
