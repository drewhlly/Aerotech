import {NextResponse} from "next/server";
import {cookies} from "next/headers";
import {randomUUID,randomBytes,scrypt as rawScrypt,timingSafeEqual,createHash} from "node:crypto";
import {promisify} from "node:util";
import {db,sessionDigest} from "@/lib/employer-session";
import {SUPPORT_COOKIE,sameOrigin} from "@/lib/support-session";
import {decryptTotp,validTotpStep} from "@/lib/support-security";
const scrypt=promisify(rawScrypt);export const runtime="nodejs";
export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Request origin not allowed"},{status:403});
 let b;try{b=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(typeof b?.email!=="string"||b.email.length>255||typeof b.password!=="string"||b.password.length>255||typeof b.code!=="string")return NextResponse.json({error:"Email, password and authenticator code required"},{status:400});
 const email=b.email.trim().toLowerCase();const pool=db(),client=await pool.connect();
 try{
  await client.query("BEGIN");const hash=createHash("sha256").update(email).digest("hex");
  const rate=await client.query("INSERT INTO support_login_limits(email_hash,attempts,reset_at) VALUES($1,1,NOW()+INTERVAL '15 minutes') ON CONFLICT(email_hash) DO UPDATE SET attempts=CASE WHEN support_login_limits.reset_at<NOW() THEN 1 ELSE support_login_limits.attempts+1 END,reset_at=CASE WHEN support_login_limits.reset_at<NOW() THEN NOW()+INTERVAL '15 minutes' ELSE support_login_limits.reset_at END RETURNING attempts",[hash]);
  if(rate.rows[0].attempts>10){await client.query("INSERT INTO support_auth_events(id,email_hash,outcome) VALUES($1,$2,'throttled')",[randomUUID(),hash]);await client.query("COMMIT");return NextResponse.json({error:"Too many attempts. Try again in 15 minutes."},{status:429});}
  const agent=(await client.query("SELECT * FROM support_agents WHERE email=$1 FOR UPDATE",[email])).rows[0];
  let step:number|null=null;
  if(agent&&!agent.disabled&&(!agent.locked_until||new Date(agent.locked_until).getTime()<Date.now())){
   const [algorithm,salt,hex]=String(agent.password_hash).split(":");
   if(algorithm==="scrypt"&&salt&&/^[a-f0-9]{128}$/i.test(hex)){
    const actual=await scrypt(b.password,salt,64) as Buffer;
    if(timingSafeEqual(actual,Buffer.from(hex,"hex")))step=validTotpStep(decryptTotp(agent.totp_encrypted),b.code,Number(agent.last_totp_step));
   }
  }
  if(step===null){await client.query("INSERT INTO support_auth_events(id,email_hash,agent_id,outcome) VALUES($1,$2,$3,'failure')",[randomUUID(),hash,agent?.id||null]);if(agent)await client.query("UPDATE support_agents SET failed_attempts=failed_attempts+1,locked_until=CASE WHEN failed_attempts>=4 THEN NOW()+INTERVAL '15 minutes' ELSE locked_until END WHERE id=$1",[agent.id]);await client.query("COMMIT");return NextResponse.json({error:"Unable to sign in. Check your credentials and a fresh authenticator code."},{status:401});}
  await client.query("INSERT INTO support_auth_events(id,email_hash,agent_id,outcome) VALUES($1,$2,$3,'success')",[randomUUID(),hash,agent.id]);
  const token=randomBytes(32).toString("hex");await client.query("UPDATE support_agents SET last_totp_step=$1,failed_attempts=0,locked_until=NULL WHERE id=$2",[step,agent.id]);
  await client.query("INSERT INTO support_sessions(token_hash,agent_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '15 minutes')",[sessionDigest(token),agent.id]);await client.query("COMMIT");
  (await cookies()).set(SUPPORT_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict",path:"/",maxAge:900});
  return NextResponse.json({ok:true});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Support sign-in is temporarily unavailable"},{status:503});}finally{client.release();await pool.end();}
}
