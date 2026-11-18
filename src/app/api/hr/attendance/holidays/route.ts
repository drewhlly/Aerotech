import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {currentEmployer,db} from '@/lib/employer-session';
export const runtime='nodejs';
const validDay=(day:unknown)=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day;
export async function GET(req:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR access required'},{status:401});
 const year=new URL(req.url).searchParams.get('year')||String(new Date().getUTCFullYear());
 if(!/^\d{4}$/.test(year))return NextResponse.json({error:'Invalid year'},{status:400});
 const pool=db();try{const result=await pool.query("SELECT id,work_date::text AS work_date,name FROM attendance_holidays WHERE employer_id=$1 AND EXTRACT(YEAR FROM work_date)=$2::integer ORDER BY work_date",[employer,year]);return NextResponse.json({holidays:result.rows},{headers:{'Cache-Control':'private, no-store'}})}finally{await pool.end()}
}
export async function POST(req:Request){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR access required'},{status:401});
 let body:unknown;try{body=await req.json()}catch{return NextResponse.json({error:'Invalid holiday'},{status:400})}
 if(!body||typeof body!=='object'||Array.isArray(body))return NextResponse.json({error:'Invalid holiday'},{status:400});
 const {date,name}=body as {date?:unknown;name?:unknown};
 if(!validDay(date)||typeof name!=='string'||name.trim().length<2||name.length>150)return NextResponse.json({error:'Valid date and holiday name required'},{status:400});
 const pool=db();try{await pool.query('INSERT INTO attendance_holidays(id,employer_id,work_date,name) VALUES($1,$2,$3::date,$4) ON CONFLICT(employer_id,work_date) DO UPDATE SET name=EXCLUDED.name',[randomUUID(),employer,date,name.trim()]);return NextResponse.json({ok:true},{status:201})}finally{await pool.end()}
}
