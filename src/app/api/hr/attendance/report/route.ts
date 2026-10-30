import {NextResponse} from 'next/server';
import {GET as summary} from '../summary/route';
import {workbookResponse} from '@/lib/report-workbook';
export const runtime='nodejs';
export async function GET(req:Request){
 const response=await summary(req);if(!response.ok)return response;
 try{const {date,records}=await response.json();const time=(v:string|null)=>v?new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',hour:'2-digit',minute:'2-digit'}).format(new Date(v)):'';
 const rows=records.map((r:{first_name:string;last_name:string;location:string|null;status:string;clock_in:string|null;clock_out:string|null;hours:number|null})=>({employee:r.first_name+' '+r.last_name,location:r.location||'Unassigned',status:r.status.replaceAll('_',' '),clockIn:time(r.clock_in),clockOut:time(r.clock_out),hours:r.hours??''}));
 return await workbookResponse('Daily attendance',[{header:'Employee',key:'employee',width:32},{header:'Workplace',key:'location',width:28},{header:'Status',key:'status',width:25},{header:'Clock in (Lagos)',key:'clockIn',width:22},{header:'Clock out (Lagos)',key:'clockOut',width:22},{header:'Hours',key:'hours',width:14}],rows,`aerotech-attendance-${date}.xlsx`);
 }catch{return NextResponse.json({error:'Attendance report unavailable. Please retry.'},{status:503})}
}
