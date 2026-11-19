import FaceCamera from '@/components/face/face-camera';
export default async function Page({searchParams}:{searchParams:Promise<{action?:string}>}){const q=await searchParams;return <FaceCamera purpose={q.action==='clock_out'?'clock_out':'clock_in'}/>}
