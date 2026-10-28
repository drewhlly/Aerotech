import RecruitmentDetail from '@/components/recruitment-detail';
export default async function Page({params}:{params:Promise<{id:string}>}){return <RecruitmentDetail id={(await params).id} kind="job"/>}
