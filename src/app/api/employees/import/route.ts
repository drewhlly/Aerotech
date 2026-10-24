import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {currentEmployer,db} from "@/lib/employer-session";
export const runtime="nodejs";
const columns=["first_name","last_name","email","job_title","department","phone","location","date_of_birth"];
function parseCSV(s:string):string[][]{const rows:string[][]=[];let row:string[]=[],field="",quoted=false;for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===","&&!quoted){row.push(field.trim());field="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&s[i+1]==="\n")i++;row.push(field.trim());if(row.some(Boolean))rows.push(row);row=[];field="";}else field+=c;}if(quoted)throw Error("Unclosed quoted field");row.push(field.trim());if(row.some(Boolean))rows.push(row);return rows;}
export async function POST(request:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:"Sign in required"},{status:401});
 const form=await request.formData().catch(()=>null);const file=form?.get("file");if(!(file instanceof File))return NextResponse.json({error:"Select a CSV file"},{status:400});
 if(file.size>2_000_000)return NextResponse.json({error:"CSV exceeds 2 MB"},{status:413});
 let data:string[][];try{data=parseCSV(await file.text());}catch{return NextResponse.json({error:"Invalid CSV formatting"},{status:400});}
 if(data.length<2||data.length>1001)return NextResponse.json({error:"CSV must contain 1–1000 employee rows"},{status:400});
 const header=data.shift()!.map(x=>x.toLowerCase().trim().replace(/\s+/g,"_"));if(new Set(header).size!==header.length||columns.slice(0,5).some(x=>!header.includes(x)))return NextResponse.json({error:"Required columns: first_name, last_name, email, job_title, department"},{status:400});
 const records=data.map(row=>Object.fromEntries(columns.map(k=>[k,row[header.indexOf(k)]||""])) as Record<string,string>);
 const errors:string[]=[];const seen=new Set<string>();
 for(let i=0;i<records.length;i++){const e=records[i],email=e.email.toLowerCase();if(columns.slice(0,5).some(k=>!e[k]||e[k].length>255)||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||seen.has(email)||e.date_of_birth&&!/^\d{4}-\d{2}-\d{2}$/.test(e.date_of_birth))errors.push("Row "+(i+2)+": invalid or duplicate employee fields");seen.add(email);}
 if(errors.length)return NextResponse.json({error:"Import validation failed",details:errors.slice(0,20)},{status:422});
 const pool=db();const client=await pool.connect();try{await client.query("BEGIN");const emails=records.map(e=>e.email.toLowerCase());const existing=await client.query("SELECT email FROM workforce_employees WHERE employer_id=$1 AND LOWER(email)=ANY($2::text[])",[employer,emails]);if(existing.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"Some employee emails already exist",details:existing.rows.map(x=>x.email)},{status:409});}
 for(const e of records)await client.query("INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,phone,job_title,department,location,employment_status,date_of_birth) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'active',$10::date)",[randomUUID(),employer,e.first_name,e.last_name,e.email.toLowerCase(),e.phone,e.job_title,e.department,e.location,e.date_of_birth||null]);
 await client.query("COMMIT");return NextResponse.json({imported:records.length},{status:201});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Import failed; no rows saved"},{status:503});}finally{client.release();await pool.end();}
}
