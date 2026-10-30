'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Bot, Lightbulb, Send, ShieldCheck, Sparkles } from 'lucide-react';

type Status = 'loading' | 'ready' | 'unavailable' | 'error';
const suggestions = [
  'How can I improve our onboarding process?',
  'How can I plan a fair interview process?',
  'What can we do to improve attendance?',
  'How should I prepare for payroll?',
];

export default function AIPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/ai/ask', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(data => setStatus(data.configured ? 'ready' : 'unavailable'))
      .catch(error => { if (error.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, []);

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (busy || prompt.trim().length < 2 || status !== 'ready') return;
    setBusy(true);
    setError('');
    setAnswer('');
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to get a response.');
      setAnswer(data.answer);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to reach Aerotech AI.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="aero-hero">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200"><Sparkles size={15} aria-hidden="true" /> Your workplace assistant</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Aerotech AI</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">Ask questions, explore ideas and get practical support for your people and your business.</p>
      </section>

      <section className="aero-card">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Bot size={23} aria-hidden="true" /></span>
          <div><h2 className="text-xl font-bold text-slate-900">How can I help?</h2><p className="mt-1 text-sm leading-6 text-slate-600">Ask about recruitment, onboarding, payroll or day-to-day HR.</p></div>
        </div>

        {status === 'loading' && <p role="status" className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Checking assistant availability…</p>}
        {status === 'unavailable' && <p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Aerotech AI is not available yet. Please contact your administrator.</p>}
        {status === 'error' && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">Could not check availability. Refresh the page to retry.</p>}

        <form onSubmit={ask} className="mt-6 space-y-4">
          <label htmlFor="ai-question" className="block text-sm font-semibold text-slate-900">Your question</label>
          <textarea id="ai-question" value={prompt} onChange={event => setPrompt(event.target.value)} maxLength={2000} minLength={2} required rows={5} placeholder="What would you like help with today?" className="aero-input w-full" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-600">{prompt.length} / 2,000 characters</span>
            <button disabled={busy || status !== 'ready' || prompt.trim().length < 2} className="aero-button bg-blue-700 text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} aria-hidden="true" />{busy ? 'Preparing response…' : 'Ask Aerotech AI'}</button>
          </div>
        </form>
        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-600"><ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Questions are processed by Cloudflare. Please avoid sharing sensitive personal information or passwords.</span></p>

        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {busy && <p role="status" className="mt-5 text-sm text-slate-600">Preparing your response…</p>}
        {answer && <section aria-label="AI response" aria-live="polite" className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6"><h3 className="flex items-center gap-2 font-bold text-blue-900"><Sparkles size={18} aria-hidden="true" /> Aerotech AI</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">{answer}</p><p className="mt-4 text-xs leading-5 text-slate-600">Review responses before making employment, payroll or legal decisions.</p></section>}
      </section>

      <section className="aero-card">
        <h2 className="flex items-center gap-2 font-bold text-slate-900"><Lightbulb size={19} className="text-blue-700" aria-hidden="true" /> Looking for a starting point?</h2>
        <p className="mt-2 text-sm text-slate-600">Choose a question to make it your own.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{suggestions.map(suggestion => <button type="button" key={suggestion} onClick={() => { setPrompt(suggestion); setError(''); document.getElementById('ai-question')?.focus(); }} className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"><span>{suggestion}</span><ArrowRight size={16} className="shrink-0 text-blue-700" aria-hidden="true" /></button>)}</div>
      </section>
    </div>
  );
}
