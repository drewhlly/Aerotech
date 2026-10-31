import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import ExcelJS from "exceljs";
import { currentEmployer, db } from "@/lib/employer-session";
export const runtime="nodejs";
export async function POST(request:Request){
 const employerId=await currentEmployer();
 if(!employerId)return NextResponse.json({error:"Please sign in"},{status:401});
 let form:FormData;try{form=await request.formData()}catch{return NextResponse.json({error:"Submit a valid multipart upload."},{status:400})}
 const file=form.get("file");
 if(!(file instanceof File)||file.size>5_000_000||!(/\.(xlsx|csv)$/i).test(file.name))return NextResponse.json({error:"Upload an XLSX or CSV file under 5MB"},{status:400});
 const workbook=new ExcelJS.Workbook();
 const bytes=Buffer.from(await file.arrayBuffer());
 try {if(file.name.toLowerCase().endsWith(".csv")){const stream=await import("node:stream");const sheet=await workbook.csv.read(stream.Readable.from(bytes));if(!sheet)throw Error("No worksheet");}else await workbook.xlsx.load(bytes as unknown as Parameters<typeof workbook.xlsx.load>[0]);}
 catch{return NextResponse.json({error:"Unable to read spreadsheet"},{status:400});}
 const sheet=workbook.worksheets[0];
 if(!sheet)return NextResponse.json({error:"Spreadsheet is empty"},{status:400});
 const value=(v:ExcelJS.CellValue)=>typeof v==="string"?v.trim():typeof v==="number"?String(v):v&&typeof v==="object"&&"text" in v?String(v.text):"";
 const cols:Record<string,number>={};
 sheet.getRow(1).eachCell((cell,index)=>{cols[value(cell.value).toLowerCase().replace(/[^a-z]/g,"")]=index});
 const nameCol=cols.fullname||cols.name, emailCol=cols.email||cols.emailaddress;
 if(!nameCol||!emailCol)return NextResponse.json({error:"First row must include Full Name and Email columns"},{status:400});
 const rows:{name:string;email:string;phone:string;position:string}[]=[];
 for(let n=2;n<=sheet.rowCount;n++){
  const row=sheet.getRow(n),name=value(row.getCell(nameCol).value),email=value(row.getCell(emailCol).value).toLowerCase();
  if(!name&&!email)continue;
  if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:`Invalid record on row ${n}`},{status:400});
  rows.push({name,email,phone:cols.phone||cols.phonenumber?value(row.getCell(cols.phone||cols.phonenumber).value):'',position:cols.position||cols.positionapplied?value(row.getCell(cols.position||cols.positionapplied).value):''});
  if(rows.length>1000)return NextResponse.json({error:"Maximum 1,000 applicants per file"},{status:400});
 }
 const pool=db();const client=await pool.connect();
 try {await client.query("BEGIN");let imported=0;
  for(const row of rows){const result=await client.query("INSERT INTO imported_candidates(id,employer_id,full_name,email,phone,position_applied,source_file) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(employer_id,email) DO NOTHING",[randomUUID(),employerId,row.name,row.email,row.phone,row.position,file.name]);imported+=result.rowCount||0;}
  await client.query("COMMIT");return NextResponse.json({imported,skipped:rows.length-imported});
 }catch{await client.query("ROLLBACK");return NextResponse.json({error:"Import failed"},{status:500});}
 finally{client.release();await pool.end();}
}
