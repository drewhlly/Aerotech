'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowRight,ChevronDown,ChevronLeft,ChevronRight} from 'lucide-react';
export function Container({children,className=''}:{children:ReactNode;className?:string}){return <div className={'marketing-container '+className}>{children}</div>}
export function SectionHeader({eyebrow,title,description}:{eyebrow:string;title:string;description?:string}){return <div className="marketing-section-heading"><p className="marketing-eyebrow">{eyebrow}</p><h2>{title}</h2>{description&&<p className="marketing-description">{description}</p>}</div>}
export function Button({href,children,variant='primary',className=''}:{href:string;children:ReactNode;variant?:'primary'|'secondary'|'ghost';className?:string}){return <Link href={href} className={'marketing-button marketing-button--'+variant+' '+className}>{children}<ArrowRight size={17} aria-hidden="true"/></Link>}
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <article className={'marketing-card '+className}>{children}</article>}
export function Chip({children,href}:{children:ReactNode;href:string}){return <Link className="marketing-chip" href={href}>{children}</Link>}
export function Input({label,name,placeholder}:{label:string;name:string;placeholder:string}){return <label className="marketing-input-label">{label}<input name={name} placeholder={placeholder} className="marketing-input"/></label>}
export function Dropdown({title,groups,open,onOpenChange}:{title:string;groups:{heading:string;links:{label:string;href:string}[]}[];open:boolean;onOpenChange:(open:boolean)=>void}){
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const clear=()=>{if(closeTimer.current){clearTimeout(closeTimer.current);closeTimer.current=null}};
 const dismiss=()=>{clear();onOpenChange(false)};
 const hover=()=>typeof window!=='undefined'&&window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(root.current&&!root.current.contains(event.target as Node))onOpenChange(false)};
 document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open,onOpenChange]);
 useEffect(()=>()=>{if(closeTimer.current)clearTimeout(closeTimer.current)},[]);
 const links=()=>Array.from(root.current?.querySelectorAll<HTMLAnchorElement>('.marketing-dropdown-panel a')||[]);
 return <div ref={root} className="marketing-dropdown" data-open={open} onMouseEnter={()=>{clear();if(hover())onOpenChange(true)}} onMouseLeave={()=>{if(hover()){clear();closeTimer.current=setTimeout(()=>onOpenChange(false),160)}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))dismiss()}} onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();dismiss();trigger.current?.focus()}else if(open&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();const items=links();const index=items.indexOf(document.activeElement as HTMLAnchorElement);items[(index+(e.key==='ArrowDown'?1:items.length-1))%items.length]?.focus()}else if(open&&e.key==='Home'){e.preventDefault();links()[0]?.focus()}else if(open&&e.key==='End'){e.preventDefault();links().at(-1)?.focus()}}}>
  <button ref={trigger} type="button" className="marketing-dropdown-trigger" aria-haspopup="true" aria-expanded={open} onClick={()=>{clear();onOpenChange(!open)}} onKeyDown={e=>{if(!open&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();onOpenChange(true);requestAnimationFrame(()=>{const items=links();(e.key==='ArrowDown'?items[0]:items.at(-1))?.focus()})}}}>{title}<ChevronDown size={16} aria-hidden/></button>
  <div className="marketing-dropdown-panel" inert={!open} aria-hidden={!open}>{groups.map(group=><div key={group.heading}><p className="marketing-eyebrow">{group.heading}</p>{group.links.map(link=><Link key={link.href} href={link.href} onClick={dismiss}>{link.label}</Link>)}</div>)}</div>
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
