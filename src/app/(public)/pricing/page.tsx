import PricingPage from '@/components/pricing-page';
export default function Page(){return <PricingPage billingLive={!!process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_')}/>}
