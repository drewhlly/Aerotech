import {NextResponse} from 'next/server';
import {currentEmployer,db} from '@/lib/employer-session';
export const runtime='nodejs';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function validDay(day:string){return /^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day}
export async function GET(req:Request){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:'HR access required'},{status:401});
 const url=new URL(req.url),from=url.searchParams.get('from')||today(),to=url.searchParams.get('to')||from;
 if(!validDay(from)||!validDay(to)||to<from||(Date.parse(to)-Date.parse(from))/86400000>30)
  return NextResponse.json({error:'Choose an inclusive date range of at most 31 days.'},{status:400});
 const page=Number(url.searchParams.get('page')||'1'),size=Number(url.searchParams.get('pageSize')||'25');
 if(!Number.isSafeInteger(page)||page<1||!Number.isSafeInteger(size)||size<1||size>100||page>100000)
  return NextResponse.json({error:'Invalid page or pageSize'},{status:400});
 const search=(url.searchParams.get('search')||'').trim().slice(0,100),department=(url.searchParams.get('department')||'').trim().slice(0,100),status=(url.searchParams.get('status')||'').trim();
 const statuses=['present','late','absent','on_leave','scheduled','not_scheduled','missed_checkout','clocked_in','assignment_review','holiday'];
 if(status&&!statuses.includes(status))return NextResponse.json({error:'Invalid status filter'},{status:400});
 const pool=db();
 try{
  const sql=`
  WITH daily AS (
   SELECT w.id,w.first_name,w.last_name,w.department,COALESCE(site.name,w.location) AS location,
          d.work_date::date AS work_date,s.starts_at,s.ends_at,
          MIN(a.event_time) FILTER(WHERE a.event_type='clock_in') AS clock_in,
          MAX(a.event_time) FILTER(WHERE a.event_type='clock_out') AS clock_out,
          COALESCE(BOOL_OR(a.source='unassigned_pending_review'),false) AS assignment_review,
          EXISTS(SELECT 1 FROM employee_requests lr
                 WHERE lr.employer_id=w.employer_id AND lr.employee_id=w.id
                   AND lr.request_type='leave' AND lr.status='approved'
                   AND d.work_date::date BETWEEN lr.start_date AND lr.end_date) AS approved_leave,
          EXISTS(SELECT 1 FROM attendance_holidays h WHERE h.employer_id=w.employer_id AND h.work_date=d.work_date::date) AS public_holiday
   FROM workforce_employees w
   CROSS JOIN generate_series($2::date,$3::date,interval '1 day') AS d(work_date)
   LEFT JOIN attendance_sites site ON site.id=w.attendance_site_id AND site.employer_id=w.employer_id
   LEFT JOIN workforce_shifts s ON s.employee_id=w.id AND s.employer_id=w.employer_id AND s.work_date=d.work_date::date
   LEFT JOIN hr_attendance_events a ON a.employee_id=w.id AND a.employer_id=w.employer_id AND a.work_date=d.work_date::date
   WHERE w.employer_id=$1 AND w.employment_status IN ('active','probation','on_leave')
     AND ($4='' OR (w.first_name||' '||w.last_name) ILIKE '%'||$4||'%')
     AND ($5='' OR w.department=$5)
   GROUP BY w.id,site.name,d.work_date,s.id
  ), evaluated AS (
   SELECT *,CASE
    WHEN assignment_review THEN 'assignment_review'
    WHEN clock_in IS NOT NULL AND clock_out IS NULL AND work_date >= (NOW() AT TIME ZONE 'Africa/Lagos')::date THEN 'clocked_in'
    WHEN clock_in IS NOT NULL AND clock_out IS NULL THEN 'missed_checkout'
    WHEN clock_in IS NOT NULL AND starts_at IS NOT NULL
         AND clock_in > ((work_date+starts_at) AT TIME ZONE 'Africa/Lagos') THEN 'late'
    WHEN clock_in IS NOT NULL THEN 'present'
    WHEN approved_leave THEN 'on_leave'
    WHEN public_holiday THEN 'holiday'
    WHEN starts_at IS NULL THEN 'not_scheduled'
    WHEN work_date < (NOW() AT TIME ZONE 'Africa/Lagos')::date THEN 'absent'
    WHEN (work_date+starts_at) < (NOW() AT TIME ZONE 'Africa/Lagos') THEN 'absent'
    ELSE 'scheduled' END AS status,
    CASE WHEN clock_in IS NOT NULL AND clock_out IS NOT NULL AND clock_out >= clock_in
      THEN ROUND(EXTRACT(EPOCH FROM (clock_out-clock_in))::numeric/3600,2)
      ELSE NULL END AS hours
   FROM daily
  )
  SELECT id,first_name,last_name,department,location,work_date::text AS work_date,
         starts_at,ends_at,clock_in,clock_out,status,hours,
         COUNT(*) OVER()::int AS total
  FROM evaluated
  WHERE ($6='' OR status=$6)
  ORDER BY work_date DESC,first_name,last_name,id
  LIMIT $7 OFFSET $8`;
  const rows=(await pool.query(sql,[employer,from,to,search,department,status,size,(page-1)*size])).rows;
  const total=rows[0]?.total??0;
  return NextResponse.json({from,to,page,pageSize:size,total,pages:Math.ceil(total/size),records:rows.map(({total:unused,...record}:{total:number;[key:string]:unknown})=>{void unused;return record})},
   {headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Attendance report unavailable'},{status:503})}
 finally{await pool.end()}
}