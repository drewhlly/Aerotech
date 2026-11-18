import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import BrandLogo from '../brand-logo';
import { portalConfig, type LoginPortal } from './portal-config';

export default function AuthLayout({ portal, children }: { portal: LoginPortal; children: ReactNode }) {
  const config = portalConfig[portal];
  return <main className="portal-auth">
    <div className="portal-auth-shell">
      <aside className="portal-auth-panel" aria-label={config.name + ' welcome'}>
        <div className="portal-auth-orbit" aria-hidden="true" />
        <div className="relative"><BrandLogo light href="/" /><p className="portal-auth-portal">{config.name}</p></div>
        <div className="portal-auth-welcome relative">
          <p className="portal-auth-accent">{config.accent}</p>
          <h2>{config.welcome}</h2><p className="portal-auth-message">{config.message}</p>
          <ul>{config.highlights.map(text => <li key={text}><Check size={18} aria-hidden="true" />{text}</li>)}</ul>
        </div>
        <div className="portal-auth-panel-footer relative"><ShieldCheck size={18} aria-hidden="true" /><span>One platform. Dedicated workspaces.<br />Access for the right people.</span></div>
      </aside>
      <section className="portal-auth-card" aria-labelledby="portal-login-title">
        <div className="portal-auth-mobile-brand"><BrandLogo compact href="/" /><span>{config.name}</span></div>
        <Link href="/" className="portal-auth-back"><ArrowLeft size={15} aria-hidden="true" />Back to home</Link>
        <div className="portal-auth-form-content">{children}</div>
        <footer className="portal-auth-footer"><span>Need a hand? <Link href="/contact">Contact support</Link></span><Link href="/privacy">Privacy policy</Link></footer>
      </section>
    </div>
  </main>;
}
