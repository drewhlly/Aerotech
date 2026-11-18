import Link from 'next/link';
import {notFound} from 'next/navigation';
import {insights} from '@/lib/insights';
import {pageMetadata} from '@/lib/seo';
import {Container} from '@/components/marketing-ui';
export function generateStaticParams(){return insights.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const article=insights.find(a=>a.slug===slug);return article?pageMetadata(article.title,article.excerpt,'/insights/'+slug):pageMetadata('Insights','Original Aerotech insights on workforce technology, recruitment and people operations.','/insights')}
export default async function InsightArticle({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const article=insights.find(a=>a.slug===slug);if(!article)notFound();return <main className="bg-white py-16"><Container><article className="mx-auto max-w-3xl"><p className="marketing-eyebrow">{article.category}</p><h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{article.title}</h1><p className="mt-6 text-lg leading-8 text-slate-600">{article.excerpt}</p><div className="mt-10 space-y-6 border-t border-slate-200 pt-8">{article.content.map((p,i)=><p key={i} className="text-base leading-8 text-slate-700">{p}</p>)}</div><Link href="/insights" className="mt-10 inline-flex min-h-11 items-center font-semibold text-blue-800">← All insights</Link></article></Container></main>}
