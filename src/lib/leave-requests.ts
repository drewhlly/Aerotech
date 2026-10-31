import {randomUUID} from 'node:crypto';
import {db} from './employer-session';
import {calendarDate,leaveCategories} from './leave-dates';
export {calendarDate,leaveCategories} from './leave-dates';
import {employeeLeaveBalances} from './leave-calculations';
import {workingDates} from './leave-policy';
export class LeaveRequestError extends Error {
 status:number;
 constructor(message:string,status:number){super(message);this.status=status}
}
export async function submitLeave(company:string,employeeId:string,body:{category?:unknown;startDate?:unknown;endDate?:unknown;details?:unknown}){
 if(typeof body.category!=='string'||!leaveCategories.includes(body.category as typeof leaveCategories[number])||!calendarDate(body.startDate)||!calendarDate(body.endDate)||body.startDate>body.endDate||typeof body.details!=='string'||!body.details.trim()||body.details.length>2000)throw new LeaveRequestError('Choose a leave type and provide valid dates and a reason.',400);
 if((Date.parse(body.endDate)-Date.parse(body.startDate))/86400000>365)throw new LeaveRequestError('A single leave request can span no more than 366 calendar days.',400);
 const pool=db(),client=await pool.connect();
 try{
  await client.query('BEGIN');
  // All application entry points lock the same tenant-scoped employee row.
  const employee=await client.query("SELECT id FROM workforce_employees WHERE id=$1 AND employer_id=$2 AND employment_status IN ('active','probation','on_leave') FOR UPDATE",[employeeId,company]);
  if(!employee.rowCount)throw new LeaveRequestError('Active employee not found.',404);
  for(let year=Number(body.startDate.slice(0,4));year<=Number(body.endDate.slice(0,4));year++){
   const data=await employeeLeaveBalances(client,company,employeeId,year),balance=data.balances.find(b=>b.category===body.category)!;
   if(!balance.enabled)throw new LeaveRequestError('This leave category is not enabled. Contact HR.',422);
   const requested=workingDates(body.startDate,body.endDate,data.policy,year).length;
   if(data.policy.enforceBalances&&balance.configured&&(balance.available_days===null||requested>balance.available_days))throw new LeaveRequestError('Insufficient available leave or a balance requiring HR review. Contact HR.',422);
  }
  const overlap=await client.query("SELECT id FROM employee_requests WHERE employer_id=$1 AND employee_id=$2 AND request_type='leave' AND status IN ('pending','approved') AND start_date<=$4::date AND end_date>=$3::date LIMIT 1",[company,employeeId,body.startDate,body.endDate]);
  if(overlap.rowCount)throw new LeaveRequestError('These dates overlap an existing pending or approved leave request. Review your history before submitting again.',409);
  const id=randomUUID();
  await client.query("INSERT INTO employee_requests(id,employer_id,employee_id,request_type,leave_category,start_date,end_date,details) VALUES($1,$2,$3,'leave',$4,$5::date,$6::date,$7)",[id,company,employeeId,body.category,body.startDate,body.endDate,body.details.trim()]);
  await client.query('COMMIT');return id;
 }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
}
