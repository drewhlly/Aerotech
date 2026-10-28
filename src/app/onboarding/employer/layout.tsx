import { redirect } from "next/navigation";
import { currentEmployer } from "@/lib/employer-session";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const employerId = await currentEmployer(false);
  if (!employerId) redirect("/auth/login?role=employer");
  return <>{children}</>;
}
