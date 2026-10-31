import {NextResponse} from "next/server";
import {randomUUID,randomBytes} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
import {digest} from "@/lib/employee-auth";
import {sendEmployeeInvitation} from "@/lib/invitation-email";
export const runtime="nodejs";
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 let b:{employeeId?:unknown};try{b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Request body must be a JSON object.'},{status:400});
}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof b.employeeId!=="string")return NextResponse.json({error:"Employee required"},{status:400});
 const pool=db();try{
 const employee=await pool.query("SELECT e.id,e.email,e.first_name, c.employee_id AS activated FROM workforce_employees e LEFT JOIN employee_credentials c ON c.employee_id=e.id WHERE e.id=$1 AND e.employer_id=$2",[b.employeeId,employer]);
 if(!employee.rowCount)return NextResponse.json({error:"Employee not found"},{status:404});
 if(employee.rows[0].activated)return NextResponse.json({error:"Employee account already activated"},{status:409});
 const base=process.env.APP_BASE_URL;
 if(!base||!/^https:\/\//.test(base)||!process.env.RESEND_API_KEY||!process.env.INVITATION_FROM_EMAIL)return NextResponse.json({error:"Set APP_BASE_URL, RESEND_API_KEY and INVITATION_FROM_EMAIL on hosting before sending invitations."},{status:503});
 const token=randomBytes(32).toString("hex");
 await pool.query("INSERT INTO employee_invitations(id,employer_id,employee_id,token_hash,expires_at) VALUES($1,$2,$3,$4,NOW()+INTERVAL '48 hours')",[randomUUID(),employer,b.employeeId,digest(token)]);
 const link=new URL("/auth/activate",base);link.searchParams.set("token",token);
 try{await sendEmployeeInvitation(employee.rows[0].email,employee.rows[0].first_name,link.toString());}
 catch{return NextResponse.json({error:"Invitation email could not be delivered. Check email service configuration."},{status:502});}
 return NextResponse.json({sent:true,employeeEmail:employee.rows[0].email,expiresInHours:48},{status:201});
 }catch{return NextResponse.json({error:"Unable to create invitation"},{status:503});}finally{await pool.end();}
}
