import {syncPayslipNotifications} from '@/lib/payslip-notifications';
import {NextResponse} from "next/server";
import {timingSafeEqual,randomUUID} from "node:crypto";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
function valid(request:Request){const secret=process.env.CRON_SECRET||"";const token=request.headers.get("authorization")?.replace(/^Bearer /,"")||"";const a=Buffer.from(secret),b=Buffer.from(token);return !!secret&&a.length===b.length&&timingSafeEqual(a,b);}
export async function GET(req:Request){
 if(!valid(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{
 const employers=await pool.query('SELECT DISTINCT employer_id FROM payable_payroll_runs');let count=0;for(const e of employers.rows){const r=await syncPayslipNotifications(pool,e.employer_id);count+=r.rowCount||0;}
 return NextResponse.json({notificationsCreated:count});
 }catch{return NextResponse.json({error:"Payslip notifications unavailable pending employee-to-payroll identity mapping"},{status:503});}finally{await pool.end();}
}
