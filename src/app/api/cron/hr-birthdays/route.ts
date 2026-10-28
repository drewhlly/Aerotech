import {NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET||"";
 const supplied=request.headers.get("authorization")?.replace(/^Bearer /,"")||"";
 const a=Buffer.from(secret),b=Buffer.from(supplied);
 if(!secret||a.length!==b.length||!timingSafeEqual(a,b))return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();
 try{
  const result=await pool.query(`INSERT INTO birthday_notification_log(employer_id,employee_id,celebration_year)
 SELECT employer_id,id,EXTRACT(YEAR FROM (NOW() AT TIME ZONE 'Africa/Lagos'))::int
 FROM workforce_employees
 WHERE date_of_birth IS NOT NULL
 AND employment_status <> 'terminated'
 AND TO_CHAR(date_of_birth,'MM-DD')=TO_CHAR((NOW() AT TIME ZONE 'Africa/Lagos')::date,'MM-DD')
 ON CONFLICT DO NOTHING RETURNING employer_id,employee_id`);
  await pool.query(`INSERT INTO workflow_alerts(employer_id,alert_key,title,details,expires_at) SELECT employer_id,'birthday:'||id||':'||((NOW() AT TIME ZONE 'Africa/Lagos')::date+1),'Birthday tomorrow',first_name||' '||last_name||' has a birthday tomorrow.',(((NOW() AT TIME ZONE 'Africa/Lagos')::date+2)::timestamp AT TIME ZONE 'Africa/Lagos') FROM workforce_employees WHERE date_of_birth IS NOT NULL AND employment_status IN ('active','probation','on_leave') AND TO_CHAR(date_of_birth,'MM-DD')=TO_CHAR((NOW() AT TIME ZONE 'Africa/Lagos')::date+1,'MM-DD') ON CONFLICT DO NOTHING`);
  return NextResponse.json({hrBirthdayAlertsCreated:result.rowCount,note:"Alerts are available to employers in the birthday section; no employee notifications are sent."});
 }catch{return NextResponse.json({error:"Birthday notification task failed"},{status:503});}
 finally{await pool.end();}
}
