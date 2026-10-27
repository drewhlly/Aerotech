import Projects from "@/components/projects-workspace";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <Projects projectId={(await params).id} />;
}
