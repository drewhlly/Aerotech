import {NextResponse} from "next/server";
import {timingSafeEqual,randomUUID} from "node:crypto";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
function valid(request:Request){const secret=process.env.CRON_SECRET||"";const token=request.headers.get("authorization")?.replace(/^Bearer /,"")||"";const a=Buffer.from(secret),b=Buffer.from(token);return !!secret&&a.length===b.length&&timingSafeEqual(a,b);}
export async function GET(req:Request){
 if(!valid(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{
 const result=await pool.query(`INSERT INTO employee_notifications(id,employer_id,employee_id,title,body)
 SELECT gen_random_uuid(),p.employer_id,w.id,'Payslip available','Your approved payroll statement for '||TO_CHAR(p.payroll_month,'Mon YYYY')||' is available.'
 FROM payroll_runs p JOIN payroll_run_items i ON i.run_id=p.id
 JOIN payroll_employees pe ON pe.id=i.employee_id AND pe.employer_id=p.employer_id
 JOIN workforce_employees w ON lower(w.email)=lower(pe.email) AND w.employer_id=p.employer_id
 WHERE p.status='approved' AND NOT EXISTS (
 SELECT 1 FROM employee_notifications n WHERE n.employer_id=p.employer_id AND n.employee_id=w.id AND n.title='Payslip available' AND n.body='Your approved payroll statement for '||TO_CHAR(p.payroll_month,'Mon YYYY')||' is available.')
 RETURNING id`);
 return NextResponse.json({notificationsCreated:result.rowCount});
 }catch{return NextResponse.json({error:"Payslip notifications unavailable pending employee-to-payroll identity mapping"},{status:503});}finally{await pool.end();}
}
