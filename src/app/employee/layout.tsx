import WorkspaceShell from "@/components/workspace-shell";
import {redirect} from "next/navigation";
import {currentEmployee} from "@/lib/employee-auth";
export default async function EmployeeLayout({children}:{children:React.ReactNode}){
 const employee=await currentEmployee();if(!employee)redirect("/auth/login?role=employee");
 return <WorkspaceShell role="employee">{children}</WorkspaceShell>;
}
