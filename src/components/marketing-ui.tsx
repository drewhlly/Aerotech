'use client';
import Link from 'next/link';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowRight,ChevronDown,ChevronLeft,ChevronRight} from 'lucide-react';
export function Container({children,className=''}:{children:ReactNode;className?:string}){return <div className={'marketing-container '+className}>{children}</div>}
export function SectionHeader({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}){return <div className="marketing-section-heading"><p className="marketing-eyebrow">{eyebrow}</p><h2>{title}</h2>{description&&<p className="marketing-description">{description}</p>}</div>}
export function Button({href,children,variant='primary',className=''}:{href:string;children:ReactNode;variant?:'primary'|'secondary'|'ghost';className?:string}){return <Link href={href} className={'marketing-button marketing-button--'+variant+' '+className}>{children}<ArrowRight size={17} aria-hidden="true"/></Link>}
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <article className={'marketing-card '+className}>{children}</article>}
export function Chip({children,href}:{children:ReactNode;href:string}){return <Link className="marketing-chip" href={href}>{children}</Link>}
export function Input({label,name,placeholder}:{label:string;name:string;placeholder:string}){return <label className="marketing-input-label">{label}<input name={name} placeholder={placeholder} className="marketing-input"/></label>}
export function Dropdown({title,groups}:{title:string;groups:{heading:string;links:{label:string;href:string}[]}[]}){
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const id=useId(),pathname=usePathname();
 const close=()=>setOpen(false);
 useEffect(()=>{queueMicrotask(close)},[pathname]);
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))close()};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&root.current?.contains(document.activeElement)){close();trigger.current?.focus()}};
  const another=(event:Event)=>{if((event as CustomEvent<string>).detail!==id)close()};
  document.addEventListener('pointerdown',outside);
  document.addEventListener('keydown',escape);
  window.addEventListener('aerotech:dropdown-open',another);
  return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);window.removeEventListener('aerotech:dropdown-open',another)};
 },[id]);
 const toggle=()=>{if(!open)window.dispatchEvent(new CustomEvent('aerotech:dropdown-open',{detail:id}));setOpen(v=>!v)};
 const focusItem=(position:'first'|'last')=>{const links=root.current?.querySelectorAll<HTMLAnchorElement>('.marketing-dropdown-panel a');const item=position==='first'?links?.[0]:links?.[links.length-1];item?.focus()};
 const keys=(event:React.KeyboardEvent<HTMLDivElement>)=>{
  const links=Array.from(root.current?.querySelectorAll<HTMLAnchorElement>('.marketing-dropdown-panel a')||[]);
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();
   if(!open){window.dispatchEvent(new CustomEvent('aerotech:dropdown-open',{detail:id}));setOpen(true);requestAnimationFrame(()=>focusItem(event.key==='ArrowDown'?'first':'last'));return}
   const i=links.indexOf(document.activeElement as HTMLAnchorElement),step=event.key==='ArrowDown'?1:-1;
   links[(i+step+links.length)%links.length]?.focus();
  }
  if(event.key==='Home'&&open){event.preventDefault();focusItem('first')}
  if(event.key==='End'&&open){event.preventDefault();focusItem('last')}
 };
 return <div ref={root} className="marketing-dropdown" data-open={open} onKeyDown={keys} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))close()}}>
  <button ref={trigger} type="button" aria-haspopup="true" aria-expanded={open} aria-controls={id} onClick={toggle} className="marketing-dropdown-trigger">{title}<ChevronDown size={16} aria-hidden="true"/></button>
  <div id={id} className="marketing-dropdown-panel" aria-label={title+' links'} aria-hidden={!open} inert={!open}>
   {groups.map(g=><div key={g.heading}><p className="marketing-eyebrow">{g.heading}</p>{g.links.map(l=><Link key={l.href} href={l.href} onClick={close}>{l.label}</Link>)}</div>)}
  </div>
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
