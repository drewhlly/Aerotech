import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{const r=await pool.query("SELECT s.id,s.employee_id,s.assigned_by,s.work_date,s.starts_at,s.ends_at,e.first_name,e.last_name FROM workforce_shifts s JOIN workforce_employees e ON e.id=s.employee_id AND e.employer_id=s.employer_id WHERE s.employer_id=$1 ORDER BY s.work_date DESC LIMIT 200",[employer]);return NextResponse.json({shifts:r.rows});}catch{return NextResponse.json({error:"Shift data unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:{employeeId?:string;managerId?:string;date?:string;startsAt?:string;endsAt?:string};
 try{b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Request body must be a JSON object.'},{status:400});
}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(!b.employeeId||!b.managerId||!/^\d{4}-\d{2}-\d{2}$/.test(b.date||"")||!/^\d{2}:\d{2}$/.test(b.startsAt||"")||!/^\d{2}:\d{2}$/.test(b.endsAt||""))return NextResponse.json({error:"Employee, manager, shift date and times are required"},{status:400});
 const pool=db();try{
 const r=await pool.query("INSERT INTO workforce_shifts(id,employer_id,employee_id,assigned_by,work_date,starts_at,ends_at) SELECT $1,$2,e.id,m.id,$3::date,$4::time,$5::time FROM workforce_employees e JOIN workforce_employees m ON m.id=e.manager_employee_id AND m.employer_id=e.employer_id WHERE e.id=$6 AND e.employer_id=$2 AND m.id=$7 RETURNING id",[randomUUID(),employer,b.date,b.startsAt,b.endsAt,b.employeeId,b.managerId]);
 if(!r.rowCount)return NextResponse.json({error:"Manager must be the employee's assigned line manager"},{status:403});
 return NextResponse.json({id:r.rows[0].id},{status:201});
 }catch{return NextResponse.json({error:"Shift already assigned or invalid"},{status:409});}finally{await pool.end();}
}
