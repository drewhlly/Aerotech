import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import LandingShowcase from '@/components/landing-showcase';
import CareerSearch from '@/components/career-search';
import CredibilityStats from '@/components/credibility-stats';
import CookieNotice from '@/components/cookie-notice';
import {Button,Card,Carousel,Container,SectionHeader} from '@/components/marketing-ui';
import {insights} from '@/lib/insights';
import {pageMetadata} from '@/lib/seo';
import {organisationSchema} from '@/lib/organisation';
export const metadata=pageMetadata('Home','Find your next role, manage your workday and bring your people together. Explore dedicated Aerotech workspaces for applicants, employees and companies.','/');
const features=[
 {eyebrow:'Recruitment, connected',title:'Hiring teams deserve a clearer view.',text:'Bring vacancy planning, applications, assessments, interviews and offers into one thoughtful journey. Keep candidates informed while your team stays focused on decisions that matter.',cta:'Explore recruitment solutions',href:'/solutions',image:'/brand/feature-hiring.svg',alt:'Original illustration of Aerotech recruitment cards and workflow'},
 {eyebrow:'Your everyday workday',title:'Work feels better when everything connects.',text:'Give invited employees a dependable place to follow their attendance, documents, leave requests and payslips—with the right information visible to the right people.',cta:'Explore employee access',href:'/auth/login?role=employee',image:'/brand/feature-workday.svg',alt:'Original illustration of Aerotech workforce dashboard'},
];
const artwork=['/brand/feature-hiring.svg','/brand/feature-workday.svg','/brand/hero-pattern.svg','/brand/feature-hiring.svg'];
export default function Home(){return <main className="bg-white text-slate-900">
 <CookieNotice/>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(organisationSchema).replace(/</g,'\u003c')}}/>
 <LandingShowcase/>
 <CareerSearch/>
 <section id="choose-your-path" className="scroll-mt-28"><Container className="pt-20">
  <SectionHeader eyebrow="One connected platform" title="People solutions built for real work." description="From the moment an opportunity opens to the routines that help teams thrive, Aerotech brings important work together without losing the human perspective."/>
  {features.map((f,i)=><div key={f.title} className="marketing-feature">
   <div className={i%2?'order-1 lg:order-2':'order-1'}><div className="marketing-section-heading"><p className="marketing-eyebrow">{f.eyebrow}</p><h2>{f.title}</h2><p className="marketing-description">{f.text}</p></div><Button href={f.href} variant="ghost" className="mt-8">{f.cta}</Button></div>
   <div className={'marketing-feature-media '+(i%2?'order-2 lg:order-1':'order-2')}><Image src={f.image} alt={f.alt} width={640} height={440} className="h-full w-full object-cover" sizes="(max-width: 1023px) 100vw, 50vw"/></div>
  </div>)}
 </Container></section>
 <section className="bg-slate-50 py-20"><Container><SectionHeader eyebrow="Built on confidence" title="Progress you can verify." description="We publish company and workforce figures when they are confirmed. We do not substitute assumptions for verified results."/><CredibilityStats/></Container></section>
 <section className="py-20"><Container><div className="flex flex-wrap items-end justify-between gap-5"><SectionHeader eyebrow="Aerotech insights" title="Perspective for what comes next." description="Original, practical ideas for recruitment, people operations and better employee experiences."/><Link href="/insights" className="inline-flex min-h-11 items-center gap-2 font-semibold text-blue-800">View all insights <ArrowRight size={17} aria-hidden/></Link></div>
 <div className="marketing-insights mt-10">{insights.map((article,i)=><Card key={article.slug}><Link href={'/insights/'+article.slug} className="block overflow-hidden rounded-xl border border-slate-100"><Image src={artwork[i]} alt={'Aerotech illustration for '+article.category} width={640} height={440} className="aspect-[3/2] w-full object-cover" sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"/></Link><p className="marketing-eyebrow mt-6">{article.category}</p><h3 className="mt-3 text-xl font-bold leading-snug text-slate-900">{article.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p><Link href={'/insights/'+article.slug} className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-blue-800">Read more <ArrowRight size={16} aria-hidden/></Link></Card>)}</div>
 </Container></section>
 <section className="pb-20"><Container><Carousel slides={[{quote:'Make complex people processes understandable, so teams can focus on people instead of chasing information.',attribution:'Aerotech product principle — clarity'},{quote:'Give applicants a fairer process and employees greater visibility, while maintaining clear responsibility for employer decisions.',attribution:'Aerotech product principle — accountability'},{quote:'Build automation that remains reviewable, measurable and respectful of the people it supports.',attribution:'Aerotech product principle — human oversight'}]}/></Container></section>
 <section className="bg-slate-50 py-20"><Container><div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]"><div><p className="marketing-eyebrow">Your next step</p><h2 className="mt-4 text-4xl font-bold leading-tight text-slate-900">Find the right opportunity or bring your people together.</h2><p className="mt-5 max-w-xl text-base leading-8 text-slate-600">Applicants and invited employees access Aerotech for free. Employers choose a company subscription.</p></div><div className="flex flex-wrap gap-4 lg:justify-end"><Button href="/careers">Find jobs</Button><Button href="/solutions" variant="ghost">For businesses</Button></div></div></Container></section>
 </main>}
