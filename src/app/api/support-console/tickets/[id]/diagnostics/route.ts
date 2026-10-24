import {NextResponse} from "next/server";
import {db} from "@/lib/employer-session";
import {supportAgent} from "@/lib/support-session";
import {audit} from "@/lib/support-store";
import {SUPPORT_SCOPES,type SupportScope} from "@/lib/support-security";
const queries:Record<SupportScope,string>={
 workforce:"SELECT COUNT(*)::int AS employee_records,COUNT(*) FILTER(WHERE employment_status='active')::int AS active_records,COUNT(*) FILTER(WHERE email IS NULL OR email='')::int AS missing_email FROM workforce_employees WHERE employer_id=$1",
 recruitment:"SELECT COUNT(*)::int AS candidate_records,MAX(imported_at) AS last_import FROM imported_candidates WHERE employer_id=$1",
 meetings:"SELECT COUNT(*)::int AS scheduled_meetings,COUNT(*) FILTER(WHERE starts_at>NOW())::int AS upcoming_meetings FROM meet_rooms WHERE employer_id=$1",
 payroll:"SELECT COUNT(*)::int AS payroll_runs,COUNT(*) FILTER(WHERE status='pending_ceo_approval')::int AS awaiting_company_approval FROM payroll_runs WHERE employer_id=$1"
};
export async function GET(request:Request,context:{params:Promise<{id:string}>}){
 const agent=await supportAgent();if(!agent)return NextResponse.json({error:"Support sign-in required"},{status:401});const {id}=await context.params;const scope=new URL(request.url).searchParams.get("scope") as SupportScope;if(!/^[a-f0-9-]{36}$/i.test(id)||!SUPPORT_SCOPES.includes(scope))return NextResponse.json({error:"Invalid diagnostic scope"},{status:400});
 const pool=db(),client=await pool.connect();try{
 await client.query("BEGIN");const ticket=(await client.query("SELECT employer_id,status FROM support_tickets WHERE id=$1 FOR UPDATE",[id])).rows[0];if(!ticket){await client.query("ROLLBACK");return NextResponse.json({error:"Ticket not found"},{status:404});}
 const grant=(await client.query("SELECT id FROM support_grants WHERE ticket_id=$1 AND employer_id=$2 AND revoked_at IS NULL AND expires_at>clock_timestamp() AND $3=ANY(scopes) ORDER BY approved_at DESC LIMIT 1",[id,ticket.employer_id,scope])).rows[0];
 if(!grant||ticket.status!=="open"){
 await audit(client,ticket.employer_id,id,"support",agent.id,"diagnostics_denied",{scope});await client.query("COMMIT");return NextResponse.json({error:"Company approval for this scope is missing, expired or revoked"},{status:403});}
 const data=(await client.query(queries[scope],[ticket.employer_id])).rows[0];
 const configured=scope==="meetings"?{conferencingConfigured:Boolean((process.env.JAAS_APP_ID&&process.env.JAAS_KEY_ID&&process.env.JAAS_PRIVATE_KEY)||(process.env.JITSI_DOMAIN&&process.env.JITSI_APP_ID&&process.env.JITSI_APP_SECRET))}:scope==="workforce"?{invitationEmailConfigured:Boolean(process.env.RESEND_API_KEY&&process.env.INVITATION_FROM_EMAIL&&process.env.APP_BASE_URL)}:{};
 await audit(client,ticket.employer_id,id,"support",agent.id,"diagnostics_viewed",{scope,grantId:grant.id});await client.query("COMMIT");return NextResponse.json({scope,data,configured,readOnly:true},{headers:{"Cache-Control":"no-store"}});
 }catch{await client.query("ROLLBACK").catch(()=>{});return NextResponse.json({error:"Diagnostics unavailable"},{status:503});}finally{client.release();await pool.end();}
}
