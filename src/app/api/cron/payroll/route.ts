import {NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {db} from "@/lib/employer-session";
import {preparePayroll} from "@/app/api/payroll/run/route";
export const runtime="nodejs";
function authorised(request:Request){
 const key=process.env.CRON_SECRET;
 const provided=request.headers.get("authorization")?.replace(/^Bearer /,"")||"";
 if(!key||!provided)return false;
 const a=Buffer.from(key),b=Buffer.from(provided);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export async function GET(request:Request){
 if(!authorised(request))return NextResponse.json({error:"Unauthorized"},{status:401});
 // Invoked by a hosting cron on the first of each month; prepare previous month's payroll.
 const now=new Date(),year=now.getUTCMonth()===0?now.getUTCFullYear()-1:now.getUTCFullYear();
 const month=now.getUTCMonth()===0?12:now.getUTCMonth();
 const period=year+"-"+String(month).padStart(2,"0");
 const pool=db();try{
 const employers=await pool.query("SELECT id FROM employer_accounts WHERE country ILIKE 'nigeria' OR country ILIKE 'NG'");
 const outcomes=[];
 for(const employer of employers.rows){
  const r=await preparePayroll(employer.id,period);
  const result=await r.json();
  outcomes.push({employerId:employer.id,prepared:r.ok,reason:r.ok?undefined:result.error});
 }
 return NextResponse.json({period,processed:outcomes.length,prepared:outcomes.filter(x=>x.prepared).length,errors:outcomes.filter(x=>!x.prepared).length});
 }catch{return NextResponse.json({error:"Payroll scheduler unavailable"},{status:503});}finally{await pool.end();}
}
