import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
const modules={
 onboarding:{table:"employee_onboarding_tasks",fields:["title","due_date"],required:["title"]},
 training:{table:"employee_training_records",fields:["title","content_url","description","due_date"],required:["title"]},
 reviews:{table:"employee_performance_reviews",fields:["summary","rating","reviewer_employee_id"],required:["summary"]},
 documents:{table:"employee_document_records",fields:["title","external_url","expiry_date"],required:["title"]},
 notifications:{table:"employee_notifications",fields:["title","body"],required:["title","body"]}
} as const;
type Module=keyof typeof modules;
function selected(raw:string):Module|null{return Object.prototype.hasOwnProperty.call(modules,raw)?raw as Module:null;}
export async function GET(_:Request,{params}:{params:Promise<{module:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const module=selected((await params).module);if(!module)return NextResponse.json({error:"Unknown module"},{status:404});
 const pool=db();try{const r=await pool.query(`SELECT x.* FROM ${modules[module].table} x WHERE x.employer_id=$1 ORDER BY x.created_at DESC LIMIT 200`,[employer]);return NextResponse.json({records:r.rows});}catch{return NextResponse.json({error:"Records unavailable"},{status:503});}finally{await pool.end();}
}
export async function POST(req:Request,{params}:{params:Promise<{module:string}>}){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Unauthorized"},{status:401});
 const module=selected((await params).module);if(!module)return NextResponse.json({error:"Unknown module"},{status:404});
 let body:Record<string,unknown>;try{body=await req.json();}catch{return NextResponse.json({error:"Invalid JSON"},{status:400});}
 if(typeof body.employeeId!=="string")return NextResponse.json({error:"Employee required"},{status:400});
 const cfg=modules[module],fields=[...cfg.fields] as string[];
 for(const key of fields){const value=body[key];if(value!=null&&typeof value!=="string"&&!(key==="rating"&&Number.isInteger(value)))return NextResponse.json({error:"Invalid field "+key},{status:400});if(typeof value==="string"&&value.length>2000)return NextResponse.json({error:"Field too long"},{status:400});}
 for(const key of cfg.required){if(!String(body[key]||"").trim())return NextResponse.json({error:key+" required"},{status:400});}
 if(body.due_date&&!/^\d{4}-\d{2}-\d{2}$/.test(String(body.due_date)))return NextResponse.json({error:"Invalid date"},{status:400});
 if(body.rating!=null&&(!Number.isInteger(body.rating)||Number(body.rating)<1||Number(body.rating)>5))return NextResponse.json({error:"Rating must be 1 to 5"},{status:400});
 if(body.reviewer_employee_id!=null)return NextResponse.json({error:"Reviewer identity cannot be asserted by an employer form"},{status:400});
 for(const field of ['content_url','external_url'])if(body[field]){try{if(new URL(String(body[field])).protocol!=='https:')throw Error()}catch{return NextResponse.json({error:'Document and learning links must use HTTPS'},{status:400})}}
 const pool=db();try{
 const names=["id","employer_id","employee_id",...fields],values=[randomUUID(),employer,body.employeeId,...fields.map(f=>body[f]===''?null:body[f]??null)];
 const columns=names.join(","),placeholders=names.map((_,i)=>"$"+(i+1)).join(",");
 const r=await pool.query(`INSERT INTO ${cfg.table}(${columns}) SELECT ${placeholders} FROM workforce_employees WHERE id=$3 AND employer_id=$2 RETURNING id`,values);
 if(!r.rowCount)return NextResponse.json({error:"Employee not found"},{status:404});
 return NextResponse.json({id:r.rows[0].id},{status:201});
 }catch{return NextResponse.json({error:"Could not save record"},{status:503});}finally{await pool.end();}
}
