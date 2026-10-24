import {NextResponse} from "next/server";
import {createHmac,timingSafeEqual} from "node:crypto";
import {activatePayment} from "@/lib/subscription-payment";
export const runtime="nodejs";
export async function POST(request:Request){
 const secret=process.env.PAYSTACK_SECRET_KEY;if(!secret)return NextResponse.json({error:"Unavailable"},{status:503});
 const raw=await request.text();const signature=request.headers.get("x-paystack-signature")||"";
 if(!/^[a-f0-9]{128}$/i.test(signature)||!timingSafeEqual(Buffer.from(signature,"hex"),createHmac("sha512",secret).update(raw).digest()))return NextResponse.json({error:"Invalid signature"},{status:401});
 let event;try{event=JSON.parse(raw);}catch{return NextResponse.json({error:"Invalid event"},{status:400});}
 if(event.event==="charge.success"&&typeof event.data?.reference==="string"&&event.data.reference.startsWith("aerotech-")){
  try{await activatePayment(event.data.reference);}catch{return NextResponse.json({error:"Verification pending"},{status:503});}
 }
 return NextResponse.json({received:true});
}
