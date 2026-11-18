import {NextResponse} from 'next/server';
import {currentEmployer,db} from '@/lib/employer-session';
export const runtime='nodejs';
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export async function GET(req:Request){
 const employer=await currentEmployer();
 if(!employer)return NextResponse.json({error:'HR access required'},{status:401});
 const date=new URL(req.url).searchParams.get('date')||today();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)
  return NextResponse.json({error:'Invalid date'},{status:400});
 const pool=db();
 try{
  const r=await pool.query(`
   WITH daily AS (
    SELECT w.id,w.first_name,w.last_name,w.department,COALESCE(site.name,w.location) AS location,
     s.starts_at,s.ends_at,
     MIN(a.event_time) FILTER(WHERE a.event_type='clock_in') AS clock_in,
     MAX(a.event_time) FILTER(WHERE a.event_type='clock_out') AS clock_out,
     COALESCE(BOOL_OR(a.source='unassigned_pending_review'),false) AS assignment_review,
     EXISTS(SELECT 1 FROM employee_requests lr WHERE lr.employee_id=w.id AND lr.employer_id=w.employer_id
       AND lr.request_type='leave' AND lr.status='approved' AND $2::date BETWEEN lr.start_date AND lr.end_date) AS approved_leave,
     EXISTS(SELECT 1 FROM attendance_holidays h WHERE h.employer_id=w.employer_id AND h.work_date=$2::date) AS public_holiday
    FROM workforce_employees w
    LEFT JOIN attendance_sites site ON site.id=w.attendance_site_id AND site.employer_id=w.employer_id
    LEFT JOIN workforce_shifts s ON s.employee_id=w.id AND s.employer_id=w.employer_id AND s.work_date=$2::date
    LEFT JOIN hr_attendance_events a ON a.employee_id=w.id AND a.employer_id=w.employer_id AND a.work_date=$2::date
    WHERE w.employer_id=$1 AND w.employment_status IN ('active','probation','on_leave')
    GROUP BY w.id,site.name,s.id
   )
   SELECT *,CASE
    WHEN assignment_review THEN 'assignment_review'
    WHEN clock_in IS NOT NULL AND clock_out IS NULL AND $2::date >= (NOW() AT TIME ZONE 'Africa/Lagos')::date THEN 'clocked_in'
    WHEN clock_in IS NOT NULL AND clock_out IS NULL THEN 'missed_checkout'
    WHEN clock_in IS NOT NULL AND starts_at IS NOT NULL
     AND clock_in > (($2::date+starts_at) AT TIME ZONE 'Africa/Lagos') THEN 'late'
    WHEN clock_in IS NOT NULL THEN 'present'
    WHEN approved_leave THEN 'on_leave'
    WHEN public_holiday THEN 'holiday'
    WHEN starts_at IS NULL THEN 'not_scheduled'
    WHEN $2::date < (NOW() AT TIME ZONE 'Africa/Lagos')::date THEN 'absent'
    WHEN ($2::date+starts_at) < (NOW() AT TIME ZONE 'Africa/Lagos') THEN 'absent'
    ELSE 'scheduled' END AS status,
    CASE WHEN clock_in IS NOT NULL AND clock_out IS NOT NULL AND clock_out>=clock_in
      THEN ROUND(EXTRACT(EPOCH FROM (clock_out-clock_in))::numeric/3600,2)
      ELSE NULL END AS hours
   FROM daily ORDER BY first_name,last_name,id`,[employer,date]);
  return NextResponse.json({date,records:r.rows},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Attendance summary unavailable'},{status:503})}
 finally{await pool.end()}
}
