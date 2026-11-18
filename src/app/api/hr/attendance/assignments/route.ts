import {NextResponse} from 'next/server';import {currentEmployer,db} from '@/lib/employer-session';
export async function GET(){const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR access required'},{status:401});const p=db();try{const [staff,sites]=await Promise.all([p.query('SELECT id,first_name,last_name,attendance_site_id FROM workforce_employees WHERE employer_id=$1 ORDER BY first_name',[employer]),p.query('SELECT id,name FROM attendance_sites WHERE employer_id=$1 AND active=TRUE ORDER BY name',[employer])]);return NextResponse.json({staff:staff.rows,sites:sites.rows})}finally{await p.end()}}
export async function POST(req:Request){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:'HR access required'},{status:401});
 let body:unknown;
 try{body=await req.json()}catch{return NextResponse.json({error:'Invalid assignment'},{status:400})}
 if(!body||typeof body!=='object'||Array.isArray(body))return NextResponse.json({error:'Invalid assignment'},{status:400});
 const b=body as {employeeId?:unknown;siteId?:unknown};
 if(typeof b.employeeId!=='string'||!b.employeeId||typeof b.siteId!=='string')return NextResponse.json({error:'Employee and workplace are required'},{status:400});
 const p=db();
 try{
  // A blank workplace clears an employee's assignment without deleting their history.
  // All updates remain scoped to the authenticated employer.
  const result=b.siteId
   ?await p.query('UPDATE workforce_employees w SET attendance_site_id=s.id FROM attendance_sites s WHERE w.id=$1 AND w.employer_id=$2 AND s.id=$3 AND s.employer_id=$2 AND s.active=TRUE RETURNING w.id',[b.employeeId,employer,b.siteId])
   :await p.query('UPDATE workforce_employees SET attendance_site_id=NULL WHERE id=$1 AND employer_id=$2 RETURNING id',[b.employeeId,employer]);
  return result.rowCount?NextResponse.json({ok:true}):NextResponse.json({error:'Employee or location not found'},{status:404});
 }catch{return NextResponse.json({error:'Unable to update workplace assignment'},{status:400})}finally{await p.end()}
}
