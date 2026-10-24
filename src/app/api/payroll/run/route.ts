import {NextResponse} from "next/server";
import {currentEmployer} from "@/lib/employer-session";
import {preparePayroll} from "@/lib/prepare-payroll";
export const runtime="nodejs";
export async function POST(request:Request){
 const employerId=await currentEmployer();
 if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 let month:string;try{const data=await request.json();month=String(data.month)}catch{return NextResponse.json({error:"Month required"},{status:400});}
 return preparePayroll(employerId,month);
}
