import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {randomBytes,randomUUID,createHash,scrypt as rawScrypt,timingSafeEqual} from "node:crypto";
import {promisify} from "node:util";
import {db,sessionDigest} from "@/lib/employer-session";
import {SUPPORT_COOKIE,sameOrigin} from "@/lib/support-session";
import {generateTotpSecret,encryptStaffTotp,decryptStaffTotp,validTotpStep} from "@/lib/support-security";
const scrypt=promisify(rawScrypt),cookieName="aerotech_support_enrollment";
export const runtime="nodejs";
async function passwordMatches(password:string,stored:string){const [type,salt,hex]=stored.split(":");if(type!=="scrypt"||!salt||!/^[a-f0-9]{128}$/i.test(hex))return false;return timingSafeEqual(await scrypt(password,salt,64) as Buffer,Buffer.from(hex,"hex"));}
function json(value:unknown,status=200){return NextResponse.json(value,{status,headers:{"Cache-Control":"no-store"}});}
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:"Request origin not allowed"},403);
 let b;try{b=await request.json();}catch{return json({error:"Invalid request"},400);}
 if(!b||!["begin","confirm"].includes(b.action)||typeof b.password!=="string"||b.password.length>255)return json({error:"Invalid enrollment request"},400);
 const jar=await cookies();const pool=db(),client=await pool.connect();
 try{
  await client.query("BEGIN");
  if(b.action==="begin"){
   if(typeof b.email!=="string"||b.email.length>255||typeof b.staffPassword!=="string"||b.staffPassword.length<16||b.staffPassword.length>255||b.staffPassword===b.password){await client.query("ROLLBACK");return json({error:"Use your approved email, current account password and a staff password of at least 16 characters"},400);}
   const email=b.email.trim().toLowerCase(),emailHash=createHash("sha256").update("enrollment:"+email).digest("hex");
   const limit=await client.query("INSERT INTO support_login_limits(email_hash,attempts,reset_at) VALUES($1,1,NOW()+INTERVAL '15 minutes') ON CONFLICT(email_hash) DO UPDATE SET attempts=CASE WHEN support_login_limits.reset_at<NOW() THEN 1 ELSE support_login_limits.attempts+1 END,reset_at=CASE WHEN support_login_limits.reset_at<NOW() THEN NOW()+INTERVAL '15 minutes' ELSE support_login_limits.reset_at END RETURNING attempts",[emailHash]);
   if(limit.rows[0].attempts>5){await client.query("COMMIT");return json({error:"Too many attempts. Try again in 15 minutes."},429);}
   const approval=(await client.query("SELECT * FROM support_enrollment_approvals WHERE email=$1 AND used_at IS NULL FOR UPDATE",[email])).rows[0];
   const account=approval?(await client.query(approval.account_type==="employer"?"SELECT password_hash,admin_first_name AS name FROM employer_accounts WHERE id=$1 AND company_email=$2":"SELECT password_hash,first_name AS name FROM applicant_accounts WHERE id=$1 AND email=$2",[approval.account_id,email])).rows[0]:null;
   if(!account||!await passwordMatches(b.password,account.password_hash)||(await client.query("SELECT id FROM support_agents WHERE email=$1",[email])).rowCount){await client.query("COMMIT");return json({error:"Enrollment is unavailable for these credentials. Existing support agents should sign in."},401);}
   const salt=randomBytes(16).toString("hex"),secret=generateTotpSecret(),token=randomBytes(32).toString("hex");
   const hash=`scrypt:${salt}:${(await scrypt(b.staffPassword,salt,64) as Buffer).toString("hex")}`;
   await client.query("INSERT INTO support_pending_enrollments(token_hash,email,password_hash,totp_encrypted,expires_at) VALUES($1,$2,$3,$4,NOW()+INTERVAL '10 minutes') ON CONFLICT(email) DO UPDATE SET token_hash=EXCLUDED.token_hash,password_hash=EXCLUDED.password_hash,totp_encrypted=EXCLUDED.totp_encrypted,expires_at=EXCLUDED.expires_at,attempts=0,created_at=NOW()",[sessionDigest(token),email,hash,encryptStaffTotp(secret,b.staffPassword,salt)]);
   await client.query("COMMIT");jar.set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:600});
   return json({secret,uri:`otpauth://totp/Aerotech%20Support:${encodeURIComponent(email)}?secret=${secret}&issuer=Aerotech%20Support&algorithm=SHA1&digits=6&period=30`});
  }
  const token=jar.get(cookieName)?.value;
  if(!token||typeof b.code!=="string"){await client.query("ROLLBACK");return json({error:"Start enrollment first"},401);}
  const pending=(await client.query("SELECT p.*,a.account_type,a.account_id FROM support_pending_enrollments p JOIN support_enrollment_approvals a ON a.email=p.email WHERE p.token_hash=$1 AND p.expires_at>NOW() AND a.used_at IS NULL FOR UPDATE OF p,a",[sessionDigest(token)])).rows[0];
  if(!pending||pending.attempts>=5){await client.query("ROLLBACK");return json({error:"Enrollment expired or locked. Start again."},401);}
  await client.query("UPDATE support_pending_enrollments SET attempts=attempts+1 WHERE token_hash=$1",[sessionDigest(token)]);
  let step:number|null=null;
  if(await passwordMatches(b.password,pending.password_hash)){const salt=pending.password_hash.split(":")[1];step=validTotpStep(decryptStaffTotp(pending.totp_encrypted,b.password,salt),b.code,-1);}
  if(step===null){await client.query("COMMIT");return json({error:"Check your new staff password and authenticator code"},401);}
  const account=(await client.query(pending.account_type==="employer"?"SELECT admin_first_name AS name FROM employer_accounts WHERE id=$1":"SELECT first_name AS name FROM applicant_accounts WHERE id=$1",[pending.account_id])).rows[0];
  if(!account){await client.query("ROLLBACK");return json({error:"Approved account no longer exists"},401);}
  const id=randomUUID(),session=randomBytes(32).toString("hex");
  await client.query("INSERT INTO support_agents(id,email,display_name,password_hash,totp_encrypted,last_totp_step,is_super_admin) VALUES($1,$2,$3,$4,$5,$6,$7)",[id,pending.email,account.name||"Aerotech Support",pending.password_hash,pending.totp_encrypted,step,pending.email===process.env.SUPPORT_INITIAL_AGENT_EMAIL?.trim().toLowerCase()]);
  await client.query("UPDATE support_enrollment_approvals SET used_at=NOW() WHERE email=$1",[pending.email]);await client.query("DELETE FROM support_pending_enrollments WHERE token_hash=$1",[sessionDigest(token)]);
  await client.query("INSERT INTO support_sessions(token_hash,agent_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '15 minutes')",[sessionDigest(session),id]);
  await client.query("INSERT INTO support_auth_events(id,email_hash,agent_id,outcome) VALUES($1,$2,$3,'success')",[randomUUID(),createHash("sha256").update(pending.email).digest("hex"),id]);await client.query("COMMIT");
  for(const role of ['employer','employee','applicant']) (await cookies()).delete('aerotech_'+role+'_session');(await cookies()).delete('aerotech_portal_role');jar.delete(cookieName);jar.set(SUPPORT_COOKIE,session,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:900});return json({ok:true,superAdmin:pending.email===process.env.SUPPORT_INITIAL_AGENT_EMAIL?.trim().toLowerCase()});
 }catch{await client.query("ROLLBACK").catch(()=>{});return json({error:"Support enrollment is temporarily unavailable"},503);}finally{client.release();await pool.end();}
}
