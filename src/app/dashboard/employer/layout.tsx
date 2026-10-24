import { redirect } from "next/navigation";
import { currentEmployer } from "@/lib/employer-session";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const employerId = await currentEmployer();
  if (!employerId) {
    if(await currentEmployer(true)) redirect("/pricing?subscription=required");
    redirect("/auth/login");
  }
  return <>{children}</>;
}
