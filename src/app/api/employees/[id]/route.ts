import { NextResponse } from "next/server";
import { currentEmployer,db } from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const employerId=await currentEmployer();if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 const {id}=await params;if(!/^[\da-f]{8}-[\da-f-]{27,}$/i.test(id))return NextResponse.json({error:"Employee not found"},{status:404});
 const pool=db();try{const r=await pool.query("SELECT id,employee_number,first_name,last_name,email,phone,job_title,department,location,employment_status,hire_date FROM workforce_employees WHERE id=$1 AND employer_id=$2",[id,employerId]);return r.rowCount?NextResponse.json({employee:r.rows[0]}):NextResponse.json({error:"Employee not found"},{status:404});}
 catch{return NextResponse.json({error:"Employee records unavailable"},{status:503});}finally{await pool.end();}
}
