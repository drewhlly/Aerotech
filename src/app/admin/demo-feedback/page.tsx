import {superAdmin} from '@/lib/super-admin';
import {db} from '@/lib/employer-session';
import {notFound} from 'next/navigation';
export const runtime='nodejs';
export const metadata={title:'Partner feedback | Aerotech Admin',robots:{index:false,follow:false}};
export default async function FeedbackAdmin(){
 if(!await superAdmin())notFound();
 const p=db();let rows:Record<string,unknown>[]=[];
 try{rows=(await p.query('SELECT * FROM partner_demo_feedback ORDER BY created_at DESC LIMIT 250')).rows}finally{await p.end()}
 return <main className="mx-auto max-w-6xl p-6"><h1 className="text-3xl font-bold">Partner demo feedback</h1><p className="mt-2 text-slate-600">{rows.length} most recent submissions</p><div className="mt-6 grid gap-4">{rows.map(r=><article key={String(r.id)} className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="font-semibold">{String(r.partner_name)} — {String(r.overall_rating)}/10</h2><p className="text-sm text-slate-500">{String(r.partner_role)} · {String(r.evaluation_date)} · {String((r.portals as string[]).join(', '))}</p><p className="mt-3"><b>Highlights:</b> {String(r.highlights)}</p><p><b>Improvements:</b> {String(r.improvements)}</p><p><b>Technical issue:</b> {r.encountered_issue?String(r.issue_description):'None reported'}</p><p><b>Priorities:</b> {String(r.priorities)}</p><p><b>Recommendations:</b> {String((r.recommendations as string[]).join(' · '))}</p><p><b>Additional comments:</b> {String(r.additional_comments||'—')}</p></article>)}</div></main>
}
