import {NextResponse} from 'next/server';
import {currentEmployer,db} from '@/lib/employer-session';
import {workbookResponse} from '@/lib/report-workbook';
export const runtime='nodejs';
export async function GET(){
 const employer=await currentEmployer();if(!employer)return NextResponse.json({error:'HR access required'},{status:401});const pool=db();try{
 const r=await pool.query(`SELECT s.title,s.question,s.cadence,s.active,s.closes_at,COUNT(r.id)::int response_count,CASE WHEN COUNT(r.id)>=5 THEN ROUND(AVG(r.rating),2) ELSE NULL END average_rating,CASE WHEN COUNT(r.id)>=5 THEN COUNT(r.id) FILTER(WHERE r.rating<=2)::int ELSE NULL END low_ratings FROM hr_surveys s LEFT JOIN hr_survey_responses r ON r.survey_id=s.id WHERE s.employer_id=$1 GROUP BY s.id ORDER BY s.created_at DESC`,[employer]);
 const rows=r.rows.map(s=>({title:s.title,question:s.question,status:s.active&&(!s.closes_at||new Date(s.closes_at)>new Date())?'Active':'Closed or paused',cadence:s.cadence,closes:s.closes_at?new Date(s.closes_at).toISOString().slice(0,10):'No closing date',responses:s.response_count>=5?s.response_count:'Fewer than 5',average:s.average_rating===null?'Suppressed':Number(s.average_rating),low:s.low_ratings===null?'Suppressed':s.low_ratings}));
 return await workbookResponse('Survey summary',[{header:'Survey',key:'title',width:30},{header:'Question',key:'question',width:56},{header:'Status',key:'status',width:20},{header:'Cadence',key:'cadence',width:16},{header:'Closes',key:'closes',width:20},{header:'Responses',key:'responses',width:18},{header:'Average rating / 5',key:'average',width:22},{header:'Low ratings (1–2)',key:'low',width:22}],rows,'aerotech-survey-summary.xlsx');
 }catch{return NextResponse.json({error:'Survey report unavailable. Please retry.'},{status:503})}finally{await pool.end()}
}
