import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
import {EMPLOYER_PLANS,type EmployerPlan} from "@/lib/subscriptions";
import {paystack} from "@/lib/subscription-payment";
export const runtime="nodejs";
export async function POST(request:Request){
 const employer=await currentEmployer(true);if(!employer)return NextResponse.json({error:"Sign in as an employer before choosing a plan."},{status:401});
 let body;try{body=await request.json();}catch{return NextResponse.json({error:"Invalid request."},{status:400});}
 if(!["basic","professional","business"].includes(body?.plan))return NextResponse.json({error:"Choose an available employer plan."},{status:400});
 const pool=db();try{
  const account=(await pool.query("SELECT company_email,country FROM employer_accounts WHERE id=$1",[employer])).rows[0];
  // Use the persisted company country, never a client-supplied price/currency.
  const country=account.country.trim().toLowerCase();
  const currency=country==="nigeria"||country==="ng"?"NGN":country==="united states"||country==="us"||country==="usa"?"USD":null;
  if(!currency)return NextResponse.json({error:"Contact Aerotech for pricing in your country."},{status:422});
  const plan=EMPLOYER_PLANS[body.plan as EmployerPlan];const amount=plan.prices[currency]*100;
  const base=process.env.APP_BASE_URL;if(!base||!base.startsWith("https://"))throw Error("Payment service is not available yet. Please contact Aerotech support.");
  const reference="aerotech-"+randomUUID();
  await pool.query("INSERT INTO employer_subscription_payments(reference,employer_id,plan,amount,currency) VALUES($1,$2,$3,$4,$5)",[reference,employer,body.plan,amount,currency]);
  const payment=await paystack("/transaction/initialize",{reference,email:account.company_email,amount,currency,callback_url:new URL("/subscription/verify",base).toString()});
  const url=new URL(payment.authorization_url);if(url.protocol!=="https:"||url.hostname!=="checkout.paystack.com")throw Error("Invalid payment destination.");
  return NextResponse.json({url:url.toString()});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to start payment."},{status:503});}finally{await pool.end();}
}
