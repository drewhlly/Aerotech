import EmailUnsubscribe from '@/components/email-unsubscribe';
export const metadata={title:'Email choices | Aerotech',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;return <EmailUnsubscribe token={token||''}/>}
