import {NextResponse} from "next/server";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:"Employee login required"},{status:401});
 const pool=db();try{
 const r=await pool.query("SELECT first_name,last_name,department,TO_CHAR(date_of_birth,'MM-DD') AS birthday FROM workforce_employees WHERE employer_id=$1 AND date_of_birth IS NOT NULL AND employment_status <> 'terminated' ORDER BY EXTRACT(MONTH FROM date_of_birth),EXTRACT(DAY FROM date_of_birth)",[employee.employer_id]);
 return NextResponse.json({birthdays:r.rows});
 }catch{return NextResponse.json({error:"Birthdays unavailable"},{status:503});}finally{await pool.end();}
}
