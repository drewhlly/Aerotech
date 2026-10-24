import {NextResponse} from "next/server";
import {createHmac} from "node:crypto";
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
 const domain=process.env.JITSI_DOMAIN?.trim().replace(/^https?:\/\//,"").replace(/\/$/,"");
 const appId=process.env.JITSI_APP_ID;
 const secret=process.env.JITSI_APP_SECRET;
 if(!domain||!appId||!secret||! /^[a-z0-9.-]+(?::\d+)?$/i.test(domain))return NextResponse.json({error:"Video conferencing server has not been configured"},{status:503});
 const pool=db();try{
  const access=employee?
   await pool.query("SELECT m.id,m.title FROM meet_rooms m JOIN meet_participants p ON p.room_id=m.id AND p.employer_id=m.employer_id WHERE m.id=$1 AND m.employer_id=$2 AND p.employee_id=$3",[id,employerId,employee.id]):
   await pool.query("SELECT id,title FROM meet_rooms WHERE id=$1 AND employer_id=$2",[id,employerId]);
  if(!access.rowCount)return NextResponse.json({error:"You are not invited to this meeting"},{status:403});
  const room="aerotech-"+employerId.replaceAll("-","")+"-"+id.replaceAll("-","");
  const now=Math.floor(Date.now()/1000);
  const header=encode({alg:"HS256",typ:"JWT"});
  const payload=encode({aud:"jitsi",iss:appId,sub:domain,room,iat:now,nbf:now-5,exp:now+3600,context:{user:{name:employee?employee.first_name+" "+employee.last_name:"Employer host",email:employee?.email||undefined,moderator:!employee}}});
  const body=header+"."+payload;
  const signature=createHmac("sha256",secret).update(body).digest("base64url");
  return NextResponse.json({domain,room,token:body+"."+signature,title:access.rows[0].title});
 }catch{return NextResponse.json({error:"Meeting access unavailable"},{status:503});}finally{await pool.end();}
}
