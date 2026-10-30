import {activeEmployeeNotice} from '@/lib/notification-policy';
import {syncPayslipNotifications} from '@/lib/payslip-notifications';
import {NextResponse} from "next/server";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(request:Request){
 const user=await currentEmployee();if(!user)return NextResponse.json({error:"Employee sign-in required"},{status:401});
 const pool=db();try{await syncPayslipNotifications(pool,user.employer_id);const history=new URL(request.url).searchParams.get("history")==="1";const r=await pool.query(`SELECT n.id,n.title,n.body,n.created_at,n.read_at FROM employee_notifications n WHERE n.employer_id=$1 AND n.employee_id=$2 AND ($3::boolean AND NOT (${activeEmployeeNotice}) OR NOT $3::boolean AND (${activeEmployeeNotice})) ORDER BY n.created_at DESC LIMIT 100`,[user.employer_id,user.id,history]);return NextResponse.json({notifications:r.rows});}
 catch{return NextResponse.json({error:"Notifications unavailable"},{status:503});}finally{await pool.end();}
}
export async function PATCH(request:Request){
 const user=await currentEmployee();if(!user)return NextResponse.json({error:"Employee sign-in required"},{status:401});
 let id:unknown;try{({id}=await request.json());}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 if(typeof id!=="string"||! /^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Valid notification id required"},{status:400});
 const pool=db();try{const r=await pool.query("UPDATE employee_notifications SET read_at=COALESCE(read_at,NOW()) WHERE id=$1 AND employer_id=$2 AND employee_id=$3 RETURNING id",[id,user.employer_id,user.id]);if(!r.rowCount)return NextResponse.json({error:"Notification not found"},{status:404});return NextResponse.json({ok:true});}
 catch{return NextResponse.json({error:"Unable to update notification"},{status:503});}finally{await pool.end();}
}
