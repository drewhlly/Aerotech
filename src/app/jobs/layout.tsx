import WorkspaceShell from "@/components/workspace-shell";
import { redirect } from "next/navigation";
import { currentApplicant } from "@/lib/applicant-session";
export default async function JobsLayout({children}:{children:React.ReactNode}) {
 if(!await currentApplicant()) redirect("/careers");
 return <WorkspaceShell role="applicant">{children}</WorkspaceShell>;
}
