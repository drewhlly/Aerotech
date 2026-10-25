import WorkspaceShell from "@/components/workspace-shell";
import { redirect } from "next/navigation";
import { currentEmployer } from "@/lib/employer-session";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const employerId = await currentEmployer();
  if (!employerId) redirect("/auth/login");
  return <WorkspaceShell role="employer">{children}</WorkspaceShell>;
}
