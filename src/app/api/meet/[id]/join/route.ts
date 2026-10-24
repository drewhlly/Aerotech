import {NextResponse} from "next/server";
import {createHmac,createSign} from "node:crypto";
import {currentEmployee} from "@/lib/employee-auth";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString("base64url");
export async function GET(_request:Request,context:{params:Promise<{id:string}>}){
 const {id}=await context.params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid meeting"},{status:400});
 const employee=await currentEmployee();
 const employerId=employee?.employer_id||await currentEmployer();
 if(!employerId)return NextResponse.json({error:"Sign in required"},{status:401});
 const managed=Boolean(process.env.JAAS_APP_ID);
 const domain=managed?"8x8.vc":process.env.JITSI_DOMAIN?.trim().replace(/^https?:\/\//,"").replace(/\/$/,"");
 const appId=process.env.JITSI_APP_ID;
 const secret=process.env.JITSI_APP_SECRET;
 if(!domain||(!managed&&(!appId||!secret||secret.length<32))||(managed&&(!process.env.JAAS_KEY_ID||!process.env.JAAS_PRIVATE_KEY))||! /^[a-z0-9.-]+(?::\d+)?$/i.test(domain))return NextResponse.json({error:"Video conferencing server has not been configured"},{status:503});
 const pool=db();try{
  const access=employee?
   await pool.query("SELECT m.id,m.title FROM meet_rooms m JOIN meet_participants p ON p.room_id=m.id AND p.employer_id=m.employer_id WHERE m.id=$1 AND m.employer_id=$2 AND p.employee_id=$3",[id,employerId,employee.id]):
   await pool.query("SELECT id,title FROM meet_rooms WHERE id=$1 AND employer_id=$2",[id,employerId]);
  if(!access.rowCount)return NextResponse.json({error:"You are not invited to this meeting"},{status:403});
  const room="aerotech-"+employerId.replaceAll("-","")+"-"+id.replaceAll("-","");
  const now=Math.floor(Date.now()/1000);
  let token:string;let roomName=room;
  if(managed){
   const jaasId=process.env.JAAS_APP_ID!;
   const kid=process.env.JAAS_KEY_ID!;
   if(!/^vpaas-magic-cookie-[a-zA-Z0-9-]+$/.test(jaasId)||!kid.startsWith(jaasId+"/"))return NextResponse.json({error:"Invalid managed meeting configuration"},{status:503});
   const privateKey=process.env.JAAS_PRIVATE_KEY!.replace(/\\n/g,"\n");
   roomName=jaasId+"/"+room;
   const header=encode({alg:"RS256",typ:"JWT",kid});
   const payload=encode({aud:"jitsi",iss:"chat",sub:jaasId,room,iat:now,nbf:now-5,exp:now+900,context:{user:{id:employee?.id||employerId,name:employee?employee.first_name+" "+employee.last_name:"Employer host",email:employee?.email||"",moderator:employee?"false":"true"},features:{recording:false,livestreaming:false,transcription:false}}});
   const body=header+"."+payload;
   const signature=createSign("RSA-SHA256");signature.update(body);signature.end();
   try{token=body+"."+signature.sign(privateKey).toString("base64url");}catch{return NextResponse.json({error:"Invalid managed meeting signing key"},{status:503});}
  }else{
   const header=encode({alg:"HS256",typ:"JWT"});
   const payload=encode({aud:appId,iss:appId,sub:process.env.JITSI_JWT_SUB||"meet.jitsi",room,iat:now,nbf:now-5,exp:now+900,context:{user:{name:employee?employee.first_name+" "+employee.last_name:"Employer host",email:employee?.email||undefined,moderator:!employee}}});
   const body=header+"."+payload;
   token=body+"."+createHmac("sha256",secret!).update(body).digest("base64url");
  }
  return NextResponse.json({domain,room:roomName,token,title:access.rows[0].title});
 }catch{return NextResponse.json({error:"Meeting access unavailable"},{status:503});}finally{await pool.end();}
}
