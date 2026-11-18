import Link from 'next/link';
import {insights} from '@/lib/insights';
import {pageMetadata} from '@/lib/seo';
import {Container,Card,SectionHeader} from '@/components/marketing-ui';
export const metadata=pageMetadata('Insights','Explore original Aerotech articles on recruitment, attendance, employee experience and responsible workforce technology for modern people teams.','/insights');
export default function InsightsPage(){return <main className="bg-white py-16"><Container><SectionHeader eyebrow="Aerotech insights" title="Ideas for better people operations" description="Practical perspectives from across the employee and recruitment journey."/><div className="marketing-insights mt-12">{insights.map(article=><Card key={article.slug}><p className="marketing-eyebrow">{article.category}</p><h2 className="mt-5 text-xl font-bold text-slate-900">{article.title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p><Link className="mt-5 inline-flex min-h-11 items-center font-semibold text-blue-800" href={'/insights/'+article.slug}>Read more →</Link></Card>)}</div></Container></main>}
