import { db } from "@/lib/employer-session";
export async function paystack(path: string, body?: unknown) {
 const key=process.env.PAYSTACK_SECRET_KEY;
 if(!key || (process.env.VERCEL_ENV === "production" && !key.startsWith("sk_live_"))) throw Error("Payment service is not available yet. Please contact Aerotech support.");
 const response=await fetch("https://api.paystack.co"+path,{method:body?"POST":"GET",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},...(body?{body:JSON.stringify(body)}:{}),cache:"no-store",signal:AbortSignal.timeout(15000)});
 const result=await response.json();
 if(!response.ok||!result.status)throw Error("Payment provider could not complete this request. Please try again.");
 return result.data;
}
export async function activatePayment(reference:string, employerId?:string) {
 const pool=db();const client=await pool.connect();
 try {
  const result=await client.query("SELECT * FROM employer_subscription_payments WHERE reference=$1",[reference]);
  const payment=result.rows[0];
  if(!payment||(employerId&&payment.employer_id!==employerId))throw Error("Payment reference not found.");
  const data=await paystack("/transaction/verify/"+encodeURIComponent(reference));
  const expectedDomain=process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_")?"live":"test";
  if(data.status!=="success"||data.reference!==reference||data.amount!==Number(payment.amount)||data.currency!==payment.currency||data.domain!==expectedDomain)throw Error("Payment has not been confirmed. Please retry verification after payment.");
  await client.query("BEGIN");
  const updated=await client.query("UPDATE employer_subscription_payments SET status='paid',paid_at=NOW() WHERE reference=$1 AND status='pending' RETURNING employer_id,plan",[reference]);
  if(updated.rowCount)await client.query(`INSERT INTO employer_subscriptions(employer_id,plan,expires_at,payment_reference) VALUES($1,$2,NOW()+INTERVAL '1 year',$3)
   ON CONFLICT(employer_id) DO UPDATE SET plan=EXCLUDED.plan,expires_at=GREATEST(employer_subscriptions.expires_at,NOW())+INTERVAL '1 year',payment_reference=EXCLUDED.payment_reference`,[payment.employer_id,payment.plan,reference]);
  await client.query("COMMIT");
 }catch(e){await client.query("ROLLBACK").catch(()=>{});throw e;}finally{client.release();await pool.end();}
}
