import {birthdayEventsSql} from '@/lib/birthday-events';
import {NextResponse} from "next/server";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 const pool=db();
 try{
 const birthdays=await pool.query(birthdayEventsSql,[employer]);
 const alerts=await pool.query("SELECT w.first_name,w.last_name,l.notified_at,(((NOW() AT TIME ZONE 'Africa/Lagos')::date+1)::timestamp AT TIME ZONE 'Africa/Lagos') AS expires_at FROM birthday_notification_log l JOIN workforce_employees w ON w.id=l.employee_id AND w.employer_id=l.employer_id WHERE l.employer_id=$1 AND w.employment_status IN ('active','probation','on_leave') AND TO_CHAR(w.date_of_birth,'MM-DD')=TO_CHAR(NOW() AT TIME ZONE 'Africa/Lagos','MM-DD') AND (l.notified_at AT TIME ZONE 'Africa/Lagos')::date=(NOW() AT TIME ZONE 'Africa/Lagos')::date ORDER BY w.first_name",[employer]);
 const tomorrow=await pool.query("SELECT first_name,last_name,department,(((NOW() AT TIME ZONE 'Africa/Lagos')::date+1)::timestamp AT TIME ZONE 'Africa/Lagos') AS expires_at FROM workforce_employees WHERE employer_id=$1 AND date_of_birth IS NOT NULL AND employment_status IN ('active','probation','on_leave') AND TO_CHAR(date_of_birth,'MM-DD')=TO_CHAR((NOW() AT TIME ZONE 'Africa/Lagos')::date+1,'MM-DD')",[employer]);return NextResponse.json({birthdays:birthdays.rows,hrAlerts:alerts.rows,tomorrow:tomorrow.rows},{headers:{"Cache-Control":"private, no-store"}});
 }catch{return NextResponse.json({error:"Birthdays unavailable"},{status:503});}finally{await pool.end();}
}
