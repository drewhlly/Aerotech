import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){redirect('/dashboard/employer/billing/plans?'+new URLSearchParams(await searchParams))}
