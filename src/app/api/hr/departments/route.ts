import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const pool=db();try{const r=await pool.query("SELECT d.id,d.name,d.line_manager_employee_id,e.first_name AS manager_first_name,e.last_name AS manager_last_name FROM workforce_departments d LEFT JOIN workforce_employees e ON e.id=d.line_manager_employee_id AND e.employer_id=d.employer_id WHERE d.employer_id=$1 ORDER BY d.name",[employer]);return NextResponse.json({departments:r.rows});}catch{return NextResponse.json({error:"Unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 let b:{name?:string;managerId?:string};try{b=await request.json().catch(()=>null);
 if(!b||typeof b!=='object'||Array.isArray(b))return NextResponse.json({error:'Request body must be a JSON object.'},{status:400});
}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof b.name!=="string"||!b.name.trim()||b.name.length>150||typeof b.managerId!=="string"||!b.managerId)return NextResponse.json({error:"Department and manager required"},{status:400});
 const pool=db();const client=await pool.connect();try{await client.query("BEGIN");
 const manager=await client.query("SELECT id FROM workforce_employees WHERE id=$1 AND employer_id=$2 AND employment_status='active' FOR UPDATE",[b.managerId,employer]);
 if(!manager.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Manager must be an active employee of your company"},{status:422});}
 const r=await client.query("INSERT INTO workforce_departments(id,employer_id,name,line_manager_employee_id) VALUES($1,$2,$3,$4) ON CONFLICT(employer_id,name) DO UPDATE SET line_manager_employee_id=EXCLUDED.line_manager_employee_id RETURNING id",[randomUUID(),employer,b.name.trim(),b.managerId]);
 await client.query("UPDATE workforce_employees SET department_id=$1,manager_employee_id=CASE WHEN id=$2 THEN NULL ELSE $2 END WHERE employer_id=$3 AND lower(department)=lower($4)",[r.rows[0].id,b.managerId,employer,b.name.trim()]);
 await client.query("COMMIT");return NextResponse.json({id:r.rows[0].id},{status:201});
 }catch{await client.query("ROLLBACK");return NextResponse.json({error:"Unable to save department"},{status:503});}finally{client.release();await pool.end();}
}
