import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import {Camera,ArrowUp} from 'lucide-react';
import {Container} from '@/components/marketing-ui';
const groups=[
 {title:'Company',links:[['/about','About Aerotech'],['/solutions','Solutions'],['/pricing','Company plans'],['/contact','Contact us'],['/locations','Locations']]},
 {title:'Explore',links:[['/careers','Careers'],['/insights','Insights'],['/auth/login','Login'],['/support','Help and support'],['/install','Get the app']]},
 {title:'Website & legal',links:[['/privacy','Privacy policy'],['/terms','Terms'],['/cookies','Cookie notice']]}
];
export default function PublicFooter(){return <footer className="marketing-footer"><Container><div className="grid gap-10 lg:grid-cols-[1.3fr_2fr]"><div><BrandLogo light href="/"/><p className="mt-5 max-w-sm text-sm leading-7 text-slate-200">Better connections between opportunities, people and everyday work.</p><div className="mt-6 flex items-center gap-4"><a href="https://www.instagram.com/aerotechhr/" target="_blank" rel="noopener noreferrer" aria-label="Aerotech on Instagram" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-500 text-white hover:border-cyan-300"><Camera size={20} aria-hidden/></a></div></div><nav aria-label="Footer links" className="grid gap-7 sm:grid-cols-3">{groups.map(group=><div key={group.title}><h2 className="text-xs font-bold uppercase tracking-wider text-cyan-200">{group.title}</h2><div className="mt-4">{group.links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</div></div>)}</nav></div><div className="mt-12 flex flex-wrap items-center justify-between gap-5 border-t border-slate-700 pt-6 text-sm text-slate-300"><p>© {new Date().getFullYear()} Aerotech. All rights reserved.</p><a href="#main-content" className="inline-flex min-h-11 items-center gap-2 font-semibold text-white">Back to top <ArrowUp size={16} aria-hidden/></a></div></Container></footer>}
