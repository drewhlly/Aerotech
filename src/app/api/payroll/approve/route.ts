import {NextResponse} from "next/server";
import {currentEmployer} from "@/lib/employer-session";
export const runtime="nodejs";
/** Fail closed: a shared employer cookie cannot identify the four distinct human approvers. */
export async function POST(){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 return NextResponse.json({error:"Payroll approval is disabled until individually authenticated HR, Finance, Management and CEO approvers and an audit trail are configured. Draft payroll remains available."},{status:503});
}
