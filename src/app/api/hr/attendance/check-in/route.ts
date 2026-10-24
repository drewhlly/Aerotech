import { NextResponse } from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
import {validateGeofence} from "@/lib/attendance-geofence";
export const runtime="nodejs";
export async function POST(request:Request){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:"Employer sign-in required"},{status:401});
 let data:{employeeId?:string;siteId?:string;eventType?:string;latitude?:number;longitude?:number;accuracy?:number;faceVerification?:string};
 try{data=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(!data.employeeId||!data.siteId||!["clock_in","clock_out"].includes(data.eventType||""))return NextResponse.json({error:"Employee, site and attendance event required"},{status:400});
 if(typeof data.latitude!=="number"||typeof data.longitude!=="number"||typeof data.accuracy!=="number")return NextResponse.json({error:"Device GPS permission and reliable location required"},{status:400});
 // Never trust a client-provided biometric result. Face matching requires a server-verified provider.
 if(data.faceVerification)return NextResponse.json({error:"Face verification provider is not configured"},{status:503});
 const pool=db();const client=await pool.connect();
 try{
  await client.query("BEGIN");
  const employee=await client.query("SELECT 1 FROM workforce_employees WHERE id=$1 AND employer_id=$2",[data.employeeId,employer]);
  const site=await client.query("SELECT latitude,longitude,radius_m FROM attendance_sites WHERE id=$1 AND employer_id=$2 AND active=TRUE",[data.siteId,employer]);
  if(!employee.rowCount||!site.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Employee or approved workplace not found"},{status:404});}
  let distance:number;
  try{distance=validateGeofence(data.latitude,data.longitude,data.accuracy,site.rows[0]);}
  catch(e){await client.query("ROLLBACK");return NextResponse.json({error:e instanceof Error?e.message:"Location outside workplace"},{status:422});}
  const id=randomUUID();
  await client.query("INSERT INTO attendance_verifications(id,employer_id,employee_id,site_id,event_type,latitude,longitude,accuracy_m,distance_m,verification_method) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'gps')",[id,employer,data.employeeId,data.siteId,data.eventType,data.latitude,data.longitude,data.accuracy,distance]);
  await client.query("INSERT INTO hr_attendance_events(id,employer_id,employee_id,work_date,event_type,source) VALUES($1,$2,$3,(NOW() AT TIME ZONE 'Africa/Lagos')::date,$4,'geofence')",[randomUUID(),employer,data.employeeId,data.eventType]);
  await client.query("COMMIT");
  return NextResponse.json({status:"recorded",verificationId:id,distanceMeters:Math.round(distance)},{status:201});
 }catch{await client.query("ROLLBACK");return NextResponse.json({error:"Clock-in could not be saved. Check for an existing attendance event."},{status:409});}
 finally{client.release();await pool.end();}
}
