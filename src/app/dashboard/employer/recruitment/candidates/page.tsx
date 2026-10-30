import RecruitmentWorkspace from '@/components/recruitment-workspace';
export default async function Page({searchParams}:{searchParams:Promise<{job?:string}>}){const query=await searchParams;return <RecruitmentWorkspace view="candidates" initialJob={query.job}/>};
