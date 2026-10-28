import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentEmployer, db } from "@/lib/employer-session";
export const runtime="nodejs";
const modules={
 assets:{table:"employee_assets",fields:["name","serial_number","notes"],required:"name",columns:"id,employee_id,name,serial_number,assigned_at,returned_at,notes,created_at"},
 tasks:{table:"employee_tasks",fields:["title","due_date"],required:"title",columns:"id,employee_id,title,due_date,status,created_at"},
 disciplinary:{table:"employee_disciplinary_cases",fields:["category","description"],required:"description",columns:"id,employee_id,category,description,status,created_at"},
} as const;
type Module=keyof typeof modules;
export async function GET(request:Request,{params}:{params:Promise<{module:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {module}=await params;
 if(!(module in modules))return NextResponse.json({error:"Unknown module"},{status:404});
 const definition=modules[module as Module];
 const pool=db();
 try {
  const r=await pool.query(`SELECT ${definition.columns} FROM ${definition.table} WHERE employer_id=$1 ORDER BY created_at DESC LIMIT 200`,[employer]);
  return NextResponse.json({records:r.rows});
 }catch{return NextResponse.json({error:"Database unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(request:Request,{params}:{params:Promise<{module:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {module}=await params;
 if(!(module in modules))return NextResponse.json({error:"Unknown module"},{status:404});
 const definition=modules[module as Module];
 let b:Record<string,unknown>;
 try{b=await request.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof b.employeeId!=="string"||!/^[0-9a-f-]{36}$/i.test(b.employeeId))return NextResponse.json({error:"Employee ID required"},{status:400});
 if(typeof b[definition.required]!=="string" || !(b[definition.required] as string).trim())return NextResponse.json({error:`${definition.required} required`},{status:400});
 const fields:string[]=[...definition.fields];
 const values=fields.map(key=>{
  const value=b[key];
  if(value===null||value===undefined||value==="")return null;
  if(typeof value!=="string"||value.length>2000)throw Error("Invalid field");
  if(key==="due_date"&&!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error("Invalid due date");
  return value.trim();
 });
 const pool=db();
 try{
  const id=randomUUID();
  const cols=fields.join(",");
  const placeholders=fields.map((_,i)=>`$${i+4}`).join(",");
  const sql=`INSERT INTO ${definition.table}(id,employer_id,employee_id,${cols}) SELECT $1,$2,id,${placeholders} FROM workforce_employees WHERE id=$3 AND employer_id=$2 RETURNING id`;
  const r=await pool.query(sql,[id,employer,b.employeeId,...values]);
  if(!r.rowCount)return NextResponse.json({error:"Employee not found"},{status:404});
  return NextResponse.json({id},{status:201});
 }catch{return NextResponse.json({error:"Unable to save record"},{status:400});}finally{await pool.end();}
}
