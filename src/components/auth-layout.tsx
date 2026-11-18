import type {ReactNode} from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import {ArrowLeft,CheckCircle2} from 'lucide-react';

export type LoginRole='employer'|'employee'|'applicant';
export const loginPortals:Record<LoginRole,{name:string;welcome:string;subtitle:string;eyebrow:string;highlights:string[];signup?:string;signupLabel?:string}>={
 employer:{name:'Employer Portal',welcome:'Bring your people together.',subtitle:'A secure space to connect hiring, attendance, payroll and your people operations.',eyebrow:'For organisations',highlights:['Manage your workforce in one place','Connect recruitment with everyday work','Keep company information protected'],signup:'/auth/signup/employer',signupLabel:'Create an employer account'},
 employee:{name:'Employee Portal',welcome:'Everything for your workday.',subtitle:'Access your attendance, leave, payslips and company updates in one dependable workspace.',eyebrow:'For your team',highlights:['Keep your workday in view','Review leave and workplace updates','Access your personal records securely']},
 applicant:{name:'Applicant Portal',welcome:'Your next opportunity starts here.',subtitle:'Discover roles, share your experience and follow every step of your application.',eyebrow:'For job seekers',highlights:['Build a free career profile','Apply and complete assessments','Track interviews and applications'],signup:'/auth/signup/applicant',signupLabel:'Create a free applicant account'}
};
export default function AuthLayout({role,children}:{role:LoginRole;children:ReactNode}){
 const content=loginPortals[role];
 return <main className="auth-page"><div className="auth-shell">
  <aside className="auth-brand-panel" aria-label={'Welcome to '+content.name}>
   <BrandLogo light href="/"/>
   <div className="relative z-10"><p className="auth-eyebrow">{content.eyebrow}</p><p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-cyan-100">Aerotech · {content.name}</p><h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">{content.welcome}</h2><p className="mt-6 max-w-md text-base leading-8 text-slate-200">{content.subtitle}</p></div>
   <ul className="relative z-10 space-y-4">{content.highlights.map(item=><li key={item} className="flex items-start gap-3 text-sm text-slate-100"><CheckCircle2 size={19} className="shrink-0 text-cyan-300" aria-hidden/>{item}</li>)}</ul>
  </aside>
  <section className="auth-form-panel" aria-label={content.name+' sign in'}><div className="lg:hidden"><BrandLogo compact href="/"/></div><div className="hidden lg:flex justify-end"><Link href="/" className="auth-text-link inline-flex items-center gap-2"><ArrowLeft size={16} aria-hidden/>Back to home</Link></div>{children}
   <footer className="auth-footer"><Link href="/" className="auth-text-link lg:hidden">Back to home</Link><div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/support" className="auth-text-link">Support</Link><Link href="/contact" className="auth-text-link">Contact</Link><Link href="/privacy" className="auth-text-link">Privacy</Link></div></footer>
  </section>
 </div></main>;
}
