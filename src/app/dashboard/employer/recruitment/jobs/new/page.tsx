import {CreateJob} from '@/components/recruitment-workspace';
import {currentEmployer} from '@/lib/employer-session';
import {redirect} from 'next/navigation';
export default async function Page(){const id=await currentEmployer();if(!id)redirect('/dashboard/employer');return <CreateJob draftOwner={id}/>;}
