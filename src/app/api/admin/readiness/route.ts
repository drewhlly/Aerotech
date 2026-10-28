import {NextResponse} from "next/server";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 const configured={
  database:Boolean(process.env.DATABASE_URL),
  ai:Boolean(process.env.OPENAI_API_KEY),
  email:Boolean(process.env.RESEND_API_KEY&&process.env.INVITATION_FROM_EMAIL&&process.env.APP_BASE_URL),
  appUrl:Boolean(process.env.APP_BASE_URL),
  biometricProvider:false,
  payrollPayouts:Boolean(process.env.PAYOUT_ENCRYPTION_KEY),
  payrollPayoutAccountRequired:true
 };
 const pool=db();try{
  const r=await pool.query("SELECT to_regclass('public.workforce_employees') AS employees,to_regclass('public.employee_requests') AS requests,to_regclass('public.employee_credentials') AS employee_login,to_regclass('public.attendance_sites') AS geofencing,to_regclass('public.workforce_shifts') AS shifts");
  return NextResponse.json({configured,dbTablesPresent:Object.fromEntries(Object.entries(r.rows[0]).map(([k,v])=>[k,Boolean(v)])),productionReady:false});
 }catch{return NextResponse.json({configured,error:"Database health check failed",productionReady:false},{status:503});}finally{await pool.end();}
}
