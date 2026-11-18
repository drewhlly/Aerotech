'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {ArrowRight,ChevronDown,ChevronLeft,ChevronRight} from 'lucide-react';
export function Container({children,className=''}:{children:ReactNode;className?:string}){return <div className={'marketing-container '+className}>{children}</div>}
export function SectionHeader({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}){return <div className="marketing-section-heading"><p className="marketing-eyebrow">{eyebrow}</p><h2>{title}</h2>{description&&<p className="marketing-description">{description}</p>}</div>}
export function Button({href,children,variant='primary',className=''}:{href:string;children:ReactNode;variant?:'primary'|'secondary'|'ghost';className?:string}){return <Link href={href} className={'marketing-button marketing-button--'+variant+' '+className}>{children}<ArrowRight size={17} aria-hidden="true"/></Link>}
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <article className={'marketing-card '+className}>{children}</article>}
export function Chip({children,href}:{children:ReactNode;href:string}){return <Link className="marketing-chip" href={href}>{children}</Link>}
export function Input({label,name,placeholder}:{label:string;name:string;placeholder:string}){return <label className="marketing-input-label">{label}<input name={name} placeholder={placeholder} className="marketing-input"/></label>}
export function Dropdown({title,groups}:{title:string;groups:{heading:string;links:{label:string;href:string}[]}[]}) {
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const panelId=useId();
 const pathname=usePathname();
 const cancelClose=()=>{if(closeTimer.current!==null){clearTimeout(closeTimer.current);closeTimer.current=null;}};
 const close=()=>{cancelClose();setOpen(false);};
 const show=()=>{cancelClose();window.dispatchEvent(new CustomEvent('aerotech:public-dropdown-open',{detail:title}));setOpen(true);};
 useEffect(()=>{const timer=window.setTimeout(()=>setOpen(false),0);return()=>clearTimeout(timer)},[pathname]);
 useEffect(()=>{
  const outside=(e:PointerEvent)=>{if(root.current&&!root.current.contains(e.target as Node))close()};
  const other=(e:Event)=>{if((e as CustomEvent<string>).detail!==title)close()};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&root.current?.contains(document.activeElement)){e.preventDefault();close();trigger.current?.focus()}};
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',escape);
  window.addEventListener('aerotech:public-dropdown-open',other);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);window.removeEventListener('aerotech:public-dropdown-open',other);cancelClose()};
 },[title]);
 const scheduleClose=()=>{cancelClose();closeTimer.current=setTimeout(()=>setOpen(false),150)};
 const moveFocus=(e:React.KeyboardEvent, direction:number)=>{
  const items=Array.from(root.current?.querySelectorAll<HTMLAnchorElement>('.marketing-dropdown-panel a')||[]);
  if(!items.length)return;
  const current=items.indexOf(document.activeElement as HTMLAnchorElement);
  items[(current+direction+items.length)%items.length]?.focus();
  e.preventDefault();
 };
 return <div ref={root} className={'marketing-dropdown'+(open?' is-open':'')}
  onMouseEnter={()=>{if(window.matchMedia('(hover: hover) and (pointer: fine)').matches)show()}}
  onMouseLeave={()=>{if(window.matchMedia('(hover: hover) and (pointer: fine)').matches)scheduleClose()}}
  onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))close()}}
  onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){if(!open)show();moveFocus(e,e.key==='ArrowDown'?1:-1)}else if(e.key==='Home'&&open){e.preventDefault();root.current?.querySelector<HTMLAnchorElement>('.marketing-dropdown-panel a')?.focus()}else if(e.key==='End'&&open){e.preventDefault();const items=root.current?.querySelectorAll<HTMLAnchorElement>('.marketing-dropdown-panel a');items?.[items.length-1]?.focus()}}}>
  <button ref={trigger} type="button" className="marketing-dropdown-trigger" aria-haspopup="menu" aria-expanded={open} aria-controls={panelId} onClick={()=>open?close():show()}>{title}<ChevronDown size={16} aria-hidden /></button>
  <div id={panelId} className="marketing-dropdown-panel" role="menu" aria-hidden={!open} inert={!open}>{groups.map(g=><div key={g.heading}><p className="marketing-eyebrow">{g.heading}</p>{g.links.map(l=><Link role="menuitem" key={l.href} href={l.href} onClick={close}>{l.label}</Link>)}</div>)}</div>
 </div>;
}
export function Carousel({slides}:{slides:{quote:string;attribution:string}[]}){
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
 const touch=useRef<number|null>(null);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>setReduced(media.matches);change();media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 useEffect(()=>{if(paused||reduced||slides.length<2)return;const timer=window.setInterval(()=>setIndex(i=>(i+1)%slides.length),6500);return()=>window.clearInterval(timer)},[paused,reduced,slides.length]);
 const move=(amount:number)=>setIndex(i=>(i+slides.length+amount)%slides.length);
 return <section aria-roledescription="carousel" aria-label="Aerotech perspectives" className="marketing-carousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setPaused(false)}} onTouchStart={e=>{touch.current=e.touches[0]?.clientX??null}} onTouchEnd={e=>{if(touch.current===null)return;const distance=e.changedTouches[0].clientX-touch.current;if(Math.abs(distance)>40)move(distance<0?1:-1);touch.current=null}}>
  <p className="marketing-eyebrow">Our approach</p><blockquote key={index}><p>{slides[index].quote}</p><footer>{slides[index].attribution}</footer></blockquote>
  <div className="marketing-carousel-controls"><button type="button" onClick={()=>move(-1)} aria-label="Previous perspective"><ChevronLeft size={18}/></button><div className="marketing-dots">{slides.map((s,i)=><button key={i} type="button" aria-label={'Show perspective '+(i+1)} aria-current={i===index?'true':undefined} onClick={()=>setIndex(i)}/>)}</div><button type="button" onClick={()=>move(1)} aria-label="Next perspective"><ChevronRight size={18}/></button></div>
  <p className="marketing-carousel-note">Product principles, not customer endorsements.</p>
 </section>
}
