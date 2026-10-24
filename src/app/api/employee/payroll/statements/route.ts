import {NextResponse} from "next/server";
import {currentEmployee} from "@/lib/employee-auth";
import {db} from "@/lib/employer-session";
export const runtime="nodejs";
export async function GET(){
 const user=await currentEmployee();
 if(!user)return NextResponse.json({error:"Employee sign-in required"},{status:401});
 const pool=db();
 try{
  const rows=await pool.query(`SELECT r.id AS run_id,r.payroll_month,r.status,
   i.gross,i.paye,i.pension,i.nhf,i.sanctions,i.other_deductions,i.net
   FROM payroll_runs r
   JOIN payroll_run_items i ON i.run_id=r.id
   JOIN payroll_employees p ON p.id=i.employee_id AND p.employer_id=r.employer_id
   WHERE r.employer_id=$1
     AND LOWER(p.email)=LOWER($2)
     AND r.status='approved'
     AND (SELECT COUNT(DISTINCT stage) FROM payroll_stage_reviews v
          WHERE v.run_id=r.id AND v.employer_id=r.employer_id
            AND v.decision='approved')=4
   ORDER BY r.payroll_month DESC LIMIT 24`,[user.employer_id,user.email]);
  return NextResponse.json({statements:rows.rows,
   notice:"Approved payroll statement. This does not confirm that salary has been transferred."});
 }catch{return NextResponse.json({error:"Statements unavailable"},{status:503});}
 finally{await pool.end();}
}
