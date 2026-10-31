import {acceptsPolicies,POLICY_VERSION} from '@/lib/policy';
import {randomUUID} from 'node:crypto';
import {NextResponse} from "next/server";
import {db} from "@/lib/employer-session";
import {digest,hashPassword,startEmployeeSession} from "@/lib/employee-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 let b:{token?:unknown;password?:unknown;acceptedPolicies?:unknown;policyVersion?:unknown};try{b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Request body must be a JSON object.'},{status:400});
}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(typeof b.token!=="string"||! /^[0-9a-f]{64}$/.test(b.token)||typeof b.password!=="string"||b.password.length<12||b.password.length>128)return NextResponse.json({error:"Valid invitation and password of at least 12 characters required"},{status:400});
 if(!acceptsPolicies(b))return NextResponse.json({error:'Accept the current Terms and Privacy Policy.'},{status:400});
 const pool=db();const client=await pool.connect();let released=false,committed=false;
 try{await client.query("BEGIN");
 const r=await client.query("SELECT i.id,i.employee_id,i.employer_id FROM employee_invitations i JOIN workforce_employees w ON w.id=i.employee_id AND w.employer_id=i.employer_id WHERE i.token_hash=$1 AND i.accepted_at IS NULL AND i.expires_at>NOW() AND w.employment_status IN ('active','probation','on_leave') FOR UPDATE OF i",[digest(b.token)]);
 if(!r.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Invitation expired or already used"},{status:410});}
 const i=r.rows[0],hash=await hashPassword(b.password);
 await client.query("INSERT INTO employee_credentials(employee_id,employer_id,password_hash) VALUES($1,$2,$3)",[i.employee_id,i.employer_id,hash]);
 await client.query("UPDATE employee_invitations SET accepted_at=NOW() WHERE id=$1",[i.id]);
 await client.query("UPDATE employee_invitations SET accepted_at=NOW() WHERE employee_id=$1 AND accepted_at IS NULL",[i.employee_id]);
 await client.query('INSERT INTO policy_acceptances(id,account_role,account_id,policy_version) VALUES($1,$2,$3,$4)',[randomUUID(),'employee',i.employee_id,POLICY_VERSION]);
 await client.query("COMMIT");committed=true;client.release();released=true;
 await startEmployeeSession(pool,i.employee_id);
 return NextResponse.json({ok:true},{status:201});
 }catch(error){if(!committed)await client.query("ROLLBACK").catch(()=>{});const code=typeof (error as {code?:unknown})?.code==='string'&&/^[0-9A-Z]{5}$/.test((error as {code:string}).code)?(error as {code:string}).code:'ACTIVATION_ERROR';console.error('Employee activation failed',{code,phase:committed?'session':'transaction'});if(committed)return NextResponse.json({ok:true,requiresSignIn:true});return NextResponse.json({error:code==='23505'?'Employee account already activated. Sign in or reset your password.':'Unable to activate employee account. Please retry.'},{status:code==='23505'?409:503});}
 finally{if(!released)client.release();await pool.end();}
}
