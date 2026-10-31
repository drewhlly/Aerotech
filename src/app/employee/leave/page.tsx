'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type {LeaveBalance} from '@/lib/leave-policy';
import { CalendarDays, Clock3 } from 'lucide-react';

type LeaveRequest = { leave_category: string | null; id: string; request_type: string; start_date: string | null; end_date: string | null; status: string; details: string; review_note: string | null };
const dateText = (date: string | null) => date ? String(date).slice(0, 10) : 'Not specified';

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[] | null>(null);
  const [balance, setBalance] = useState<{annual_allowance_days:number;used_days:number;pending_days:number;remaining_days:number|null;available_days:number|null;has_uncategorised:boolean;leave_year:number}|null>(null);
  const [balances,setBalances]=useState<LeaveBalance[]>([]),[calendar,setCalendar]=useState<{id:string;start_date:string;end_date:string;first_name:string;last_name:string}[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ category: 'annual', startDate: '', endDate: '', details: '' });
  const load = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/leave', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load leave requests.');
      setRequests(data.requests as LeaveRequest[]); setBalance(data.balance);setBalances(data.balances||[]);setCalendar(data.calendar||[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load leave requests.');
    }
  }, []);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.endDate < form.startDate) { setError('End date must be on or after the start date.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, type: 'leave' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit your request.');
      setForm({ category: 'annual', startDate: '', endDate: '', details: '' });
      setNotice('Your leave request has been submitted for review.');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to submit your request.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <header className="aero-hero"><p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">My time away</p><h1 className="mt-3 text-3xl font-bold">Leave</h1><p className="mt-3 text-sm leading-6 text-slate-200">Request time away and follow the progress of your requests.</p></header>
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} {!requests && <button type="button" onClick={() => void load()} className="ml-2 font-semibold underline">Try again</button>}</div>}
    <div className="grid gap-6 lg:grid-cols-2"><section className="aero-card"><h2 className="flex items-center gap-2 text-lg font-bold"><CalendarDays size={19} className="text-blue-700" aria-hidden="true" /> Request leave</h2><p className="mt-2 text-sm text-slate-600">Your line manager or HR team will review your request.</p><form onSubmit={submit} className="mt-5 space-y-4"><label className="block text-sm font-semibold">Leave type<select className="aero-input mt-2 w-full" value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))}><option value="annual">Annual leave</option><option value="sick">Sick leave</option><option value="maternity">Maternity leave</option><option value="paternity">Paternity leave</option><option value="compassionate">Compassionate leave</option><option value="study">Study leave</option><option value="unpaid">Unpaid leave</option><option value="other">Other leave</option></select></label><label className="block text-sm font-semibold">Start date<input className="aero-input mt-2 w-full" type="date" required value={form.startDate} onChange={e=>setForm(v=>({...v,startDate:e.target.value}))}/></label><label className="block text-sm font-semibold">End date<input className="aero-input mt-2 w-full" type="date" required min={form.startDate || undefined} value={form.endDate} onChange={e=>setForm(v=>({...v,endDate:e.target.value}))}/></label><label className="block text-sm font-semibold">Reason<textarea className="aero-input mt-2 w-full" required maxLength={2000} rows={4} value={form.details} onChange={e=>setForm(v=>({...v,details:e.target.value}))}/></label><button disabled={busy} className="aero-button bg-blue-700 text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Submit request'}</button></form></section>
    <section className="aero-card"><h2 className="flex items-center gap-2 text-lg font-bold"><Clock3 size={19} className="text-blue-700" aria-hidden="true" /> Request history</h2>{requests === null ? <p role="status" className="mt-4 text-sm text-slate-600">Loading requests…</p> : requests.length === 0 ? <p className="mt-4 text-sm text-slate-600">You have not submitted any leave requests yet.</p> : <ul className="mt-4 divide-y divide-slate-100">{requests.map(item=><li key={item.id} className="py-4"><div className="flex flex-wrap justify-between gap-2"><span className="font-semibold"><span className="capitalize">{item.leave_category || "Uncategorised"} leave</span> · {dateText(item.start_date)} – {dateText(item.end_date)}</span><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-800">{item.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.details}</p>{item.review_note && <p className="mt-2 text-sm text-slate-600">Review: {item.review_note}</p>}</li>)}</ul>}</section></div>
    <section className="aero-card"><h2 className="text-lg font-bold">Who’s out</h2><p className="mt-2 text-sm text-slate-600">Your approved leave and your direct reports’ time away over the next 90 days. Private reasons and categories are not shared.</p>{calendar.length?<ul className="mt-4 divide-y">{calendar.map(r=><li className="flex flex-wrap justify-between gap-2 py-3 text-sm" key={r.id}><span>{r.first_name} {r.last_name}</span><span>{dateText(r.start_date)} – {dateText(r.end_date)}</span></li>)}</ul>:<p className="mt-4 text-sm text-slate-600">No approved time away in your permitted calendar.</p>}</section>
    <section className="aero-card"><h2 className="text-lg font-bold">Balances by leave type</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{balances.filter(b=>b.enabled).map(b=><article className="rounded-xl border p-4" key={b.category}><h3 className="font-semibold capitalize">{b.category}</h3><p className="mt-2 text-2xl font-bold">{b.available_days===null?'HR review':b.available_days+' days'}</p>{b.configured&&<dl className="mt-3 space-y-1 text-xs text-slate-600">{[['Opening',b.opening_days],['Accrued / upfront',b.accrued_days],['Carryover',b.carryover_days],['Approved',b.used_days],['Pending',b.pending_days]].map(([label,value])=><div className="flex justify-between gap-2" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}</article>)}</div></section>
    <section className="aero-card"><h2 className="font-bold">Annual leave balance</h2><p className="mt-2 text-sm text-slate-600">{!balance ? "Your annual allowance is not set. Contact HR." : balance.has_uncategorised ? "Your balance needs HR review because earlier approved leave has no category." : `Your annual leave allowance for ${balance.leave_year} is ${balance.annual_allowance_days} working days.`}</p>{balance&&!balance.has_uncategorised&&<dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Allowance',balance.annual_allowance_days],['Approved',balance.used_days],['Pending',balance.pending_days],['Available to request',balance.available_days]].map(([label,value])=><div key={label} className="rounded-xl bg-blue-50 p-4"><dt className="text-xs font-semibold text-slate-600">{label}</dt><dd className="mt-2 text-2xl font-bold text-slate-900">{value}</dd></div>)}</dl>}{balance&&<p className="mt-4 text-xs leading-5 text-slate-600">Your company working calendar and holidays apply. Pending requests reserve days; rejected requests do not reduce balances.</p>}</section>
  </div>;
}
