import {NextResponse} from "next/server";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 const pool=db();try{
 const r=await pool.query(`SELECT id,first_name,last_name,department,
 TO_CHAR(date_of_birth,'MM-DD') AS birthday,
 ((MAKE_DATE(EXTRACT(YEAR FROM (NOW() AT TIME ZONE 'Africa/Lagos'))::int,
 EXTRACT(MONTH FROM date_of_birth)::int,
 LEAST(EXTRACT(DAY FROM date_of_birth)::int,EXTRACT(DAY FROM (DATE_TRUNC('month',MAKE_DATE(EXTRACT(YEAR FROM (NOW() AT TIME ZONE 'Africa/Lagos'))::int,EXTRACT(MONTH FROM date_of_birth)::int,1))+INTERVAL '1 month - 1 day'))::int))
 - (NOW() AT TIME ZONE 'Africa/Lagos')::date + 366) % 366) AS approx_days
 FROM workforce_employees WHERE employer_id=$1 AND date_of_birth IS NOT NULL AND employment_status <> 'terminated' ORDER BY EXTRACT(MONTH FROM date_of_birth),EXTRACT(DAY FROM date_of_birth)`,[employer]);
 return NextResponse.json({birthdays:r.rows});
 }catch{return NextResponse.json({error:"Birthdays unavailable"},{status:503});}finally{await pool.end();}
}
