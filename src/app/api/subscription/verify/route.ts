import {NextResponse} from "next/server";
import {currentEmployer} from "@/lib/employer-session";
import {activatePayment} from "@/lib/subscription-payment";
export const runtime="nodejs";
export async function POST(request:Request){
 const employer=await currentEmployer(true);if(!employer)return NextResponse.json({error:"Employer sign-in required."},{status:401});
 let body;try{body=await request.json();}catch{return NextResponse.json({error:"Invalid request."},{status:400});}
 if(typeof body?.reference!=="string"||!/^aerotech-[a-f0-9-]{36}$/.test(body.reference))return NextResponse.json({error:"Invalid payment reference."},{status:400});
 try{await activatePayment(body.reference,employer);return NextResponse.json({ok:true});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to verify payment."},{status:422});}
}
