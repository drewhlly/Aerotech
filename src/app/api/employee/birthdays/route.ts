import {birthdayEventsSql} from '@/lib/birthday-events';
import {NextResponse} from "next/server";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employee=await currentEmployee();if(!employee)return NextResponse.json({error:"Employee login required"},{status:401});
 const pool=db();try{
 const r=await pool.query(birthdayEventsSql,[employee.employer_id]);
 return NextResponse.json({birthdays:r.rows},{headers:{"Cache-Control":"private, no-store"}});
 }catch{return NextResponse.json({error:"Birthdays unavailable"},{status:503});}finally{await pool.end();}
}
