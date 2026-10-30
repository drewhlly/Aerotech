import {sameOrigin} from "@/lib/collaboration-policy";
import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
import {bankFingerprint} from '@/lib/payout-security';
export const runtime="nodejs";
/** Prepare payment instructions. Never sends funds. Actual transfer initiation requires
 * verified merchant onboarding, business-owned keys, and an independently approved payout release. */
export async function POST(request:Request){if(!sameOrigin(request.headers.get('origin')||'',request.headers.get('host'),new URL(request.url).protocol))return NextResponse.json({error:'Invalid origin'},{status:403});
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Employer login required"},{status:401});
 let runId:unknown;try{({runId}=await request.json());}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof runId!=="string"||! /^[0-9a-f-]{36}$/i.test(runId))return NextResponse.json({error:"Valid payroll run required"},{status:400});
 const pool=db(),client=await pool.connect();try{
 await client.query("BEGIN");
 const run=await client.query("SELECT id,status FROM payroll_runs WHERE id=$1 AND employer_id=$2 FOR UPDATE",[runId,employer]);
 if(run.rows[0]?.status!=="approved"){await client.query("ROLLBACK");return NextResponse.json({error:"HR, Finance and CEO approval required before preparing transfers"},{status:409});}
 const reviews=await client.query("SELECT stage FROM payroll_stage_reviews WHERE employer_id=$1 AND run_id=$2 AND decision='approved' AND stage IN ('hr','finance','ceo')",[employer,runId]);
 if(new Set(reviews.rows.map(x=>x.stage)).size!==3){await client.query("ROLLBACK");return NextResponse.json({error:"Three distinct completed approval stages required"},{status:409});}
 const items=await client.query(`SELECT p.id AS employee_id,i.net,r.recipient_code,r.bank_code,r.account_fingerprint,pp.details->'banking'->>'accountNumber' AS account_number FROM payroll_run_items i JOIN payroll_employees p ON p.id=i.employee_id AND p.employer_id=$2 LEFT JOIN employee_private_profiles pp ON pp.employee_id=p.workforce_employee_id AND pp.employer_id=p.employer_id LEFT JOIN payroll_transfer_recipients r ON r.employer_id=$2 AND r.payroll_employee_id=p.id WHERE i.run_id=$1`,[runId,employer]);
 if(!items.rowCount||items.rows.some(i=>!i.recipient_code||!i.bank_code||!i.account_number||i.account_fingerprint!==bankFingerprint(i.bank_code,i.account_number)||!Number.isSafeInteger(Math.round(Number(i.net)*100))||Number(i.net)<=0)){await client.query("ROLLBACK");return NextResponse.json({error:"Every employee needs a verified transfer recipient and positive net pay"},{status:422});}
 for(const item of items.rows){const reference="aero-"+runId.replaceAll("-","").slice(0,20)+"-"+item.employee_id.replaceAll("-","").slice(0,20);
 await client.query("INSERT INTO payroll_transfer_intents(id,employer_id,payroll_run_id,payroll_employee_id,amount_kobo,recipient_code,reference) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(payroll_run_id,payroll_employee_id) DO UPDATE SET recipient_code=EXCLUDED.recipient_code,amount_kobo=EXCLUDED.amount_kobo,updated_at=NOW() WHERE payroll_transfer_intents.status='ready'",[randomUUID(),employer,runId,item.employee_id,Math.round(Number(item.net)*100),item.recipient_code,reference]);}
 await client.query("COMMIT");return NextResponse.json({prepared:items.rowCount,paymentExecution:"not_initiated",message:"Payment instructions prepared and saved; no bank transfers have been sent."},{status:201});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Unable to prepare payment instructions"},{status:503});}finally{client.release();await pool.end();}
}
